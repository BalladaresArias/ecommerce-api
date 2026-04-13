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
  const [rows] = await pool.query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [user_id]
  );
  for (let order of rows) {
    const [items] = await pool.query(
      `SELECT oi.*, p.name AS product_name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [order.id]
    );
    order.items = items;
  }
  return rows;
};

const getAllOrders = async (page = 1, limit = 20, status = '', search = '') => {
  const offset = (page - 1) * limit;
  let where = 'WHERE 1=1';
  const params = [];

  if (status) {
    where += ' AND o.status = ?';
    params.push(status);
  }
  if (search) {
    where += ' AND (u.name LIKE ? OR u.email LIKE ? OR o.id LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const [rows] = await pool.query(
    `SELECT o.*, u.name AS customer_name, u.email
     FROM orders o
     JOIN users u ON o.user_id = u.id
     ${where}
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) as total FROM orders o JOIN users u ON o.user_id = u.id ${where}`,
    params
  );

  for (let order of rows) {
    const [items] = await pool.query(
      `SELECT oi.*, p.name AS product_name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [order.id]
    );
    order.items = items;
  }

  return { orders: rows, total: countRows[0].total, page, limit };
};

const updateStatus = async (id, status) => {
  const [result] = await pool.query(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, id]
  );
  return result.affectedRows;
};

module.exports = { createOrder, addOrderItem, getOrdersByUser, getAllOrders, updateStatus };