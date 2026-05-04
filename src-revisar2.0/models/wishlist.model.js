const pool = require('../config/db');

const addToWishlist = async (user_id, product_id) => {
  const [result] = await pool.query(
    'INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)',
    [user_id, product_id]
  );
  return result.affectedRows > 0;
};

const removeFromWishlist = async (user_id, product_id) => {
  const [result] = await pool.query(
    'DELETE FROM wishlists WHERE user_id = ? AND product_id = ?',
    [user_id, product_id]
  );
  return result.affectedRows > 0;
};

const getWishlistByUser = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT w.id, w.created_at, p.id AS product_id, p.name, p.price, p.image_url, p.stock
     FROM wishlists w
     JOIN products p ON w.product_id = p.id
     WHERE w.user_id = ?
     ORDER BY w.created_at DESC`,
    [user_id]
  );
  return rows;
};

const isInWishlist = async (user_id, product_id) => {
  const [rows] = await pool.query(
    'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?',
    [user_id, product_id]
  );
  return rows.length > 0;
};

module.exports = { addToWishlist, removeFromWishlist, getWishlistByUser, isInWishlist };
