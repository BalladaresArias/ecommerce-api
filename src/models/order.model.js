const pool = require('../config/db');

const createOrder = async (user_id, total) => {
  const [result] = await pool.query(
    'INSERT INTO orders (user_id, total) VALUES (?, ?)',
    [user_id, total]
  );
  return result.insertId;
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

const getAllOrders = async () => {
  const [rows] = await pool.query(`
    SELECT o.*, u.name AS customer_name, u.email,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'product_id', oi.product_id,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'product_name', p.name
        )
      ) AS items
    FROM orders o
    JOIN users u ON o.user_id = u.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `);
  return rows;
};

const updateStatus = async (id, status) => {
  const [result] = await pool.query(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, id]
  );
  return result.affectedRows;
};

module.exports = { createOrder, addOrderItem, getOrdersByUser, getAllOrders, updateStatus };