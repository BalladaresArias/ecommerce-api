const pool = require('../config/db');

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
      enrichedItems.push({ ...item, unit_price: product.price });
    }

    const orderId = await orderModel.createOrder(req.user.id, total.toFixed(2));
    for (const item of enrichedItems) {
      await orderModel.addOrderItem(orderId, item.product_id, item.quantity, item.unit_price);
    }

    res.status(201).json({ message: 'Orden creada exitosamente', order_id: orderId, total });
  } catch (err) {
    console.error('ERROR createOrder:', err.message, err.code);
    res.status(500).json({ error: 'Error al crear orden', detail: err.message });
  }
};

const addOrderItem = async (order_id, product_id, quantity, unit_price) => {
  await pool.query(
    'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
    [order_id, product_id, quantity, unit_price]
  );
};

const getOrdersByUser = async (user_id) => {
  const [rows] = await pool.query(`
    SELECT o.*, 
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'product_id', oi.product_id,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'product_name', p.name
        )
      ) AS items
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `, [user_id]);
  return rows;
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel.getAllOrders();
    res.json({ total: orders.length, orders });
  } catch (err) {
    console.error('ERROR getAllOrders:', err.message, err.code);
    res.status(500).json({ error: 'Error al obtener órdenes', detail: err.message });
  }
};

const updateStatus = async (id, status) => {
  const [result] = await pool.query(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, id]
  );
  return result.affectedRows;
};

module.exports = { createOrder, addOrderItem, getOrdersByUser, getAllOrders, updateStatus };