const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 40, // Ajustado a 40 para soportar la carga
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 30000,
});

// Mantener conexión viva con ping cada 5 minutos
setInterval(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('DB ping OK');
  } catch (err) {
    console.error('DB ping error:', err.message);
  }
}, 5 * 60 * 1000);

module.exports = pool;