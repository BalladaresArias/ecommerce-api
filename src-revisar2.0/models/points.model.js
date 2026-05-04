const pool = require('../config/db');

// Constantes del programa
const POINTS_PER_10K = 1;        // 1 punto por cada $10.000 COP gastados
const POINTS_VALUE   = 100;      // 1 punto = $100 COP de descuento

const getPoints = async (user_id) => {
  const [rows] = await pool.query(
    'SELECT total FROM points WHERE user_id = ?',
    [user_id]
  );
  return rows[0]?.total || 0;
};

const getHistory = async (user_id, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT ph.*, o.id AS order_ref
     FROM points_history ph
     LEFT JOIN orders o ON ph.order_id = o.id
     WHERE ph.user_id = ?
     ORDER BY ph.created_at DESC
     LIMIT ? OFFSET ?`,
    [user_id, limit, offset]
  );
  const [countRows] = await pool.query(
    'SELECT COUNT(*) as total FROM points_history WHERE user_id = ?',
    [user_id]
  );
  return { history: rows, total: countRows[0].total, page, limit };
};

// Suma puntos al completar una orden (llamar cuando status → 'entregado')
const addPointsForOrder = async (user_id, order_id, order_total) => {
  const earned = Math.floor(order_total / 10000) * POINTS_PER_10K;
  if (earned <= 0) return 0;

  await pool.query(
    `INSERT INTO points (user_id, total) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE total = total + ?`,
    [user_id, earned, earned]
  );
  await pool.query(
    `INSERT INTO points_history (user_id, order_id, delta, description)
     VALUES (?, ?, ?, ?)`,
    [user_id, order_id, earned, `Puntos ganados por orden #${order_id}`]
  );
  return earned;
};

// Canjea puntos (descuento en checkout)
const redeemPoints = async (user_id, points_to_redeem) => {
  const current = await getPoints(user_id);
  if (points_to_redeem > current)
    throw new Error('Puntos insuficientes');

  const discount = points_to_redeem * POINTS_VALUE;

  await pool.query(
    'UPDATE points SET total = total - ? WHERE user_id = ?',
    [points_to_redeem, user_id]
  );
  await pool.query(
    `INSERT INTO points_history (user_id, delta, description)
     VALUES (?, ?, ?)`,
    [user_id, -points_to_redeem, `Canje de ${points_to_redeem} puntos por $${discount} de descuento`]
  );
  return discount;
};

module.exports = { getPoints, getHistory, addPointsForOrder, redeemPoints, POINTS_PER_10K, POINTS_VALUE };
