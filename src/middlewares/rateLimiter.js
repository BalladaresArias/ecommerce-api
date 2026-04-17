const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 999999 : 200, // Límite casi infinito en dev
  message: 'Demasiadas peticiones, intente más tarde.'
});

app.use('/api', globalLimiter);

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