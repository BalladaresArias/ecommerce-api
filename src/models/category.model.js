const pool = require('../config/db');

const getAll = async () => {
  const [rows] = await pool.query('SELECT * FROM categories');
  return rows;
};

const create = async (name, description) => {
  const [result] = await pool.query(
    'INSERT INTO categories (name, description) VALUES (?, ?)',
    [name, description]
  );
  return result.insertId;
};

const remove = async (id) => {
  const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
  return result.affectedRows;
};

module.exports = { getAll, create, remove };