const pool = require('../config/db');

const getAll = async (page = 1, limit = 20, search = '', category_id = null) => {
  const offset = (page - 1) * limit;
  let where = 'WHERE 1=1';
  const params = [];

  if (search) {
    where += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category_id) {
    where += ' AND p.category_id = ?';
    params.push(category_id);
  }

  const [rows] = await pool.query(`
    SELECT p.*, c.name AS category_name 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${where}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `, [...params, limit, offset]);

  const [countRows] = await pool.query(`
    SELECT COUNT(*) as total FROM products p ${where}
  `, params);

  return { products: rows, total: countRows[0].total, page, limit };
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
  const catId = category_id && category_id !== '' ? category_id : null;
  const [result] = await pool.query(
    'INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description, price, stock, catId, image_url]
  );
  return result.insertId;
};

const update = async (id, name, description, price, stock, category_id, image_url) => {
  const catId = category_id && category_id !== '' ? category_id : null;
  const [result] = await pool.query(
    'UPDATE products SET name=?, description=?, price=?, stock=?, category_id=?, image_url=? WHERE id=?',
    [name, description, price, stock, catId, image_url, id]
  );
  return result.affectedRows;
};

const remove = async (id) => {
  const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows;
};

module.exports = { getAll, getById, create, update, remove };