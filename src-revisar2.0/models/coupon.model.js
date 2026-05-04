const pool = require('../config/db');

const findByCode = async (code) => {
  const [rows] = await pool.query('SELECT * FROM coupons WHERE code = ?', [code.toUpperCase()]);
  return rows[0];
};

const getAll = async () => {
  const [rows] = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
  return rows;
};

const create = async (code, type, value, min_order, max_uses, expires_at) => {
  const [result] = await pool.query(
    'INSERT INTO coupons (code, type, value, min_order, max_uses, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
    [code.toUpperCase(), type, value, min_order, max_uses || null, expires_at || null]
  );
  return result.insertId;
};

const incrementUse = async (id) => {
  await pool.query('UPDATE coupons SET uses = uses + 1 WHERE id = ?', [id]);
};

const toggleActive = async (id, active) => {
  await pool.query('UPDATE coupons SET active = ? WHERE id = ?', [active, id]);
};

const remove = async (id) => {
  const [result] = await pool.query('DELETE FROM coupons WHERE id = ?', [id]);
  return result.affectedRows;
};

module.exports = { findByCode, getAll, create, incrementUse, toggleActive, remove };