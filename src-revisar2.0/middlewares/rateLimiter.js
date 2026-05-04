const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';
const passThrough = (req, res, next) => next();

const globalLimiter = isDev ? passThrough : rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Demasiadas solicitudes, intenta en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = isDev ? passThrough : rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos de login, intenta en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});

const ordersLimiter = isDev ? passThrough : rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Demasiadas órdenes en poco tiempo' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { globalLimiter, authLimiter, ordersLimiter };