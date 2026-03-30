const pool = require('../config/db');

const getAll = async () => {
  const [rows] = await pool.query(`
    SELECT p.*, c.name AS category_name 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `);
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query(`
    SELECT p.*, c.name AS category_name 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `, [id]);
  return rows[0];
};

const create = async (name, description, price, stock, category_id, image_url) => {
  const [result] = await pool.query(
    'INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description, price, stock, category_id, image_url]
  );
  return result.insertId;
};

const update = async (id, name, description, price, stock, category_id, image_url) => {
  const [result] = await pool.query(
    'UPDATE products SET name=?, description=?, price=?, stock=?, category_id=?, image_url=? WHERE id=?',
    [name, description, price, stock, category_id, image_url, id]
  );
  return result.affectedRows;
};

const remove = async (id) => {
  const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows;
};

module.exports = { getAll, getById, create, update, remove };