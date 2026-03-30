const pool = require('../config/db');

const findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

const createUser = async (name, email, hashedPassword, role = 'cliente') => {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, role]
  );
  return result.insertId;
};

const findById = async (id) => {
  const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
  return rows[0];
};

module.exports = { findByEmail, createUser, findById };