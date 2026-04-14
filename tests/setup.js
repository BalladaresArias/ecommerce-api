const pool = require('../src/config/db');

beforeAll(async () => {
  // Limpiar tablas de prueba antes de correr
  await pool.query('DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id IN (SELECT id FROM users WHERE email LIKE "%@test.com"))');
  await pool.query('DELETE FROM orders WHERE user_id IN (SELECT id FROM users WHERE email LIKE "%@test.com")');
  await pool.query('DELETE FROM users WHERE email LIKE "%@test.com"');
  await pool.query('DELETE FROM coupons WHERE code LIKE "TEST%"');
});

afterAll(async () => {
  // Limpiar después de todas las pruebas
  await pool.query('DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id IN (SELECT id FROM users WHERE email LIKE "%@test.com"))');
  await pool.query('DELETE FROM orders WHERE user_id IN (SELECT id FROM users WHERE email LIKE "%@test.com")');
  await pool.query('DELETE FROM users WHERE email LIKE "%@test.com"');
  await pool.query('DELETE FROM coupons WHERE code LIKE "TEST%"');
  await pool.end();
});