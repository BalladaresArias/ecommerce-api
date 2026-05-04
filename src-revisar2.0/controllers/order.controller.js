const orderModel = require('../models/order.model');
const productModel = require('../models/product.model');
const sendEmail = require('../config/mailer');
const { orderConfirmationEmail, orderStatusEmail, newOrderAdminEmail } = require('../config/emailTemplates');
const userModel = require('../models/user.model');
const couponModel = require('../models/coupon.model');
const pointsModel = require('../models/points.model'); // ← NUEVO
const pool = require('../config/db');
require('dotenv').config();

const createOrder = async (req, res) => {
  try {
    const { items, coupon_code } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ error: 'La orden debe tener al menos un producto' });

    let total = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = await productModel.getById(item.product_id);
      if (!product)
        return res.status(404).json({ error: `Producto ${item.product_id} no encontrado` });
      if (product.stock < item.quantity)
        return res.status(400).json({ error: `Stock insuficiente para ${product.name}` });
      total += product.price * item.quantity;
      enrichedItems.push({ ...item, unit_price: product.price, product_name: product.name });
    }

    // Aplicar cupón si viene
    let discount = 0;
    let coupon_id = null;

    if (coupon_code) {
      const coupon = await couponModel.findByCode(coupon_code);
      if (coupon && coupon.active) {
        discount = coupon.type === 'percentage'
          ? (total * coupon.value / 100)
          : Number(coupon.value);
        coupon_id = coupon.id;
        await couponModel.incrementUse(coupon.id);
      }
    }

    const final_total = Math.max(0, total - discount).toFixed(2);

    const [result] = await pool.query(
      'INSERT INTO orders (user_id, total, coupon_id, discount) VALUES (?, ?, ?, ?)',
      [req.user.id, final_total, coupon_id, discount.toFixed(2)]
    );
    const orderId = result.insertId;

    for (const item of enrichedItems) {
      await orderModel.addOrderItem(orderId, item.product_id, item.quantity, item.unit_price);
      await pool.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    const order = { id: orderId, total: final_total, original_total: total.toFixed(2), discount: discount.toFixed(2) };
    const user = await userModel.findById(req.user.id);

    setImmediate(async () => {
      await sendEmail(user.email, orderConfirmationEmail(user, order, enrichedItems));
      await sendEmail(process.env.EMAIL_ADMIN, newOrderAdminEmail(order, user, enrichedItems));
    });

    res.status(201).json({
      message: 'Orden creada exitosamente',
      order_id: orderId,
      total: final_total,
      original_total: total.toFixed(2),
      discount: discount.toFixed(2),
      coupon_applied: coupon_id !== null,
    });
  } catch (err) {
    console.error('ERROR createOrder:', err.message);
    res.status(500).json({ error: 'Error al crear orden', detail: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await orderModel.getOrdersByUser(req.user.id);
    res.json({ total: orders.length, orders });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener órdenes', detail: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || '';
    const search = req.query.search || '';

    const data = await orderModel.getAllOrders(page, limit, status, search);
    res.json({
      total: data.total,
      page: data.page,
      limit: data.limit,
      pages: Math.ceil(data.total / data.limit),
      orders: data.orders,
    });
  } catch (err) {
    console.error('ERROR getAllOrders:', err.message);
    res.status(500).json({ error: 'Error al obtener órdenes', detail: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status, shipping_company, shipping_tracking, shipping_estimated, shipping_notes } = req.body;
    const validStatuses = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];

    if (!validStatuses.includes(status))
      return res.status(400).json({ error: 'Estado inválido', valid: validStatuses });

    const [currentOrders] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!currentOrders.length)
      return res.status(404).json({ error: 'Orden no encontrada' });

    const currentOrder = currentOrders[0];
    const currentStatus = currentOrder.status;

    // Cancelación → restaurar stock
    if (status === 'cancelado' && ['pagado', 'enviado', 'entregado'].includes(currentStatus)) {
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
      for (const item of items) {
        await pool.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
      }
    }

    // ← NUEVO: sumar puntos al marcar como entregado
    if (status === 'entregado' && currentStatus !== 'entregado') {
      setImmediate(async () => {
        try {
          const earned = await pointsModel.addPointsForOrder(
            currentOrder.user_id,
            currentOrder.id,
            parseFloat(currentOrder.total)
          );
          if (earned > 0) console.log(`[puntos] Usuario ${currentOrder.user_id} ganó ${earned} puntos por orden #${currentOrder.id}`);
        } catch (e) {
          console.error('[puntos] Error al sumar puntos:', e.message);
        }
      });
    }

    if (status === 'enviado') {
      if (!shipping_company || !shipping_tracking)
        return res.status(400).json({ error: 'Transportadora y número de tracking son obligatorios para enviar' });

      await pool.query(
        `UPDATE orders SET status = ?, shipping_company = ?,
         shipping_tracking = ?, shipping_estimated = ?, shipping_notes = ?
         WHERE id = ?`,
        [status, shipping_company, shipping_tracking, shipping_estimated || null, shipping_notes || null, req.params.id]
      );
    } else {
      await orderModel.updateStatus(req.params.id, status);
    }

    const [orders] = await pool.query(
      `SELECT o.*, u.name, u.email FROM orders o
       JOIN users u ON o.user_id = u.id WHERE o.id = ?`,
      [req.params.id]
    );

    if (orders.length) {
      const order = orders[0];
      const user = { name: order.name, email: order.email };
      setImmediate(async () => {
        await sendEmail(user.email, orderStatusEmail(user, { ...order, status }, {
          shipping_company, shipping_tracking, shipping_estimated, shipping_notes
        }));
      });
    }

    res.json({ message: 'Estado actualizado', status });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar estado', detail: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateStatus };