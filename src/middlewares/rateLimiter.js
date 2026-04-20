const rateLimit = require('express-rate-limit');

if (process.env.NODE_ENV !== 'production') {
  module.exports = {
    globalLimiter: (req, res, next) => next(),
    authLimiter: (req, res, next) => next(),
    ordersLimiter: (req, res, next) => next(),
  };
  return; // o usa un return aquí si el archivo tiene más lógica abajo
}

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 999999 : 200, 
  message: { error: 'Demasiadas solicitudes, intenta en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // solo 10 intentos de login cada 15 min
  message: { error: 'Demasiados intentos de login, intenta en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});

const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20,
  message: { error: 'Demasiadas órdenes en poco tiempo' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { globalLimiter, authLimiter, orderLimiter };