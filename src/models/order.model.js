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
    `SELECT 
       o.*,
       CONCAT('[', GROUP_CONCAT(
         JSON_OBJECT(
           'id', oi.id,
           'product_id', oi.product_id,
           'product_name', p.name,
           'quantity', oi.quantity,
           'unit_price', oi.unit_price
         )
       ), ']') AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE o.user_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [user_id]
  );
  return rows.map(order => ({
    ...order,
    items: order.items ? JSON.parse(order.items) : [],
  }));
};

const getAllOrders = async (page = 1, limit = 20, status = '', search = '') => {
  const offset = (page - 1) * limit;
  let where = 'WHERE 1=1';
  const params = [];

  if (status) { where += ' AND o.status = ?'; params.push(status); }
  if (search) {
    where += ' AND (u.name LIKE ? OR u.email LIKE ? OR o.id LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const [rows] = await pool.query(
    `SELECT 
       o.*, u.name AS customer_name, u.email,
       CONCAT('[', GROUP_CONCAT(
         JSON_OBJECT(
           'id', oi.id,
           'product_id', oi.product_id,
           'product_name', p.name,
           'quantity', oi.quantity,
           'unit_price', oi.unit_price
         )
       ), ']') AS items
     FROM orders o
     JOIN users u ON o.user_id = u.id
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN products p ON p.id = oi.product_id
     ${where}
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(DISTINCT o.id) as total 
     FROM orders o 
     JOIN users u ON o.user_id = u.id 
     ${where}`,
    params
  );

  return {
    orders: rows.map(order => ({
      ...order,
      items: order.items ? JSON.parse(order.items) : [],
    })),
    total: countRows[0].total,
    page,
    limit,
  };
};

const updateStatus = async (id, status) => {
  const [result] = await pool.query(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, id]
  );
  return result.affectedRows;
};

module.exports = { createOrder, addOrderItem, getOrdersByUser, getAllOrders, updateStatus };