const pool = require('../config/db');

// Verifica si el usuario tiene una orden entregada con ese producto
const hasDeliveredOrder = async (user_id, product_id) => {
  const [rows] = await pool.query(
    `SELECT o.id FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'entregado'
     LIMIT 1`,
    [user_id, product_id]
  );
  return rows.length > 0;
};

const createReview = async (user_id, product_id, rating, comment) => {
  const [result] = await pool.query(
    'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
    [user_id, product_id, rating, comment]
  );
  return result.insertId;
};

const getReviewsByProduct = async (product_id, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const [reviews] = await pool.query(
    `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.product_id = ?
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [product_id, limit, offset]
  );
  const [countRows] = await pool.query(
    'SELECT COUNT(*) as total, AVG(rating) as avg_rating FROM reviews WHERE product_id = ?',
    [product_id]
  );
  return {
    reviews,
    total: countRows[0].total,
    avg_rating: parseFloat(countRows[0].avg_rating || 0).toFixed(1),
    page,
    limit,
  };
};

const getUserReview = async (user_id, product_id) => {
  const [rows] = await pool.query(
    'SELECT * FROM reviews WHERE user_id = ? AND product_id = ?',
    [user_id, product_id]
  );
  return rows[0] || null;
};

const updateReview = async (user_id, product_id, rating, comment) => {
  const [result] = await pool.query(
    'UPDATE reviews SET rating = ?, comment = ? WHERE user_id = ? AND product_id = ?',
    [rating, comment, user_id, product_id]
  );
  return result.affectedRows > 0;
};

const deleteReview = async (user_id, product_id) => {
  const [result] = await pool.query(
    'DELETE FROM reviews WHERE user_id = ? AND product_id = ?',
    [user_id, product_id]
  );
  return result.affectedRows > 0;
};

module.exports = { hasDeliveredOrder, createReview, getReviewsByProduct, getUserReview, updateReview, deleteReview };
