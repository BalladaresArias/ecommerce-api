const orderModel = require('../models/order.model');
const productModel = require('../models/product.model');
const sendEmail = require('../config/mailer');
const { orderConfirmationEmail, orderStatusEmail, newOrderAdminEmail } = require('../config/emailTemplates');
const userModel = require('../models/user.model');
require('dotenv').config();

const createOrder = async (req, res) => {
  try {
    const { items } = req.body;

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

    const orderId = await orderModel.createOrder(req.user.id, total.toFixed(2));
    for (const item of enrichedItems) {
      await orderModel.addOrderItem(orderId, item.product_id, item.quantity, item.unit_price);
    }

    const order = { id: orderId, total };
    const user = await userModel.findById(req.user.id);

    setImmediate(async () => {
      await sendEmail(user.email, orderConfirmationEmail(user, order, enrichedItems));
      await sendEmail(process.env.EMAIL_ADMIN, newOrderAdminEmail(order, user, enrichedItems));
    });

    res.status(201).json({ message: 'Orden creada exitosamente', order_id: orderId, total });
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
    const orders = await orderModel.getAllOrders();
    res.json({ total: orders.length, orders });
  } catch (err) {
    console.error('ERROR getAllOrders:', err.message);
    res.status(500).json({ error: 'Error al obtener órdenes', detail: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];

    if (!validStatuses.includes(status))
      return res.status(400).json({ error: 'Estado inválido', valid: validStatuses });

    const affected = await orderModel.updateStatus(req.params.id, status);
    if (!affected)
      return res.status(404).json({ error: 'Orden no encontrada' });

    const [orders] = await require('../config/db').query(
      `SELECT o.*, u.name, u.email 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       WHERE o.id = ?`,
      [req.params.id]
    );

    if (orders.length) {
      const order = orders[0];
      const user = { name: order.name, email: order.email };
      setImmediate(async () => {
        await sendEmail(user.email, orderStatusEmail(user, { ...order, status }));
      });
    }

    res.json({ message: 'Estado actualizado', status });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar estado', detail: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateStatus };