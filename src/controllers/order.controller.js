const orderModel = require('../models/order.model');
const productModel = require('../models/product.model');

const createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    // items: [{ product_id, quantity }]

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
      enrichedItems.push({ ...item, unit_price: product.price });
    }

    const orderId = await orderModel.createOrder(req.user.id, total.toFixed(2));

    for (const item of enrichedItems) {
      await orderModel.addOrderItem(orderId, item.product_id, item.quantity, item.unit_price);
    }

    res.status(201).json({ message: 'Orden creada exitosamente', order_id: orderId, total });
  } catch (err) {
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

    res.json({ message: 'Estado actualizado', status });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar estado', detail: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateStatus };