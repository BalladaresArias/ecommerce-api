const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const categoryRoutes = require('./routes/category.routes');
const paymentRoutes = require('./routes/payment.routes');
const couponRoutes = require('./routes/coupon.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const chatRoutes = require('./routes/chat.routes');
const { globalLimiter, authLimiter, ordersLimiter } = require('./middlewares/rateLimiter');
const wishlistRoutes = require('./routes/wishlist.routes');
const reviewRoutes   = require('./routes/review.routes');
const pointsRoutes   = require('./routes/points.routes');
const path = require('path');

const app = express();

// Middlewares globales
//app.use(helmet());
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin"
    }
  })
);
//app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(globalLimiter);

// Documentación Swagger
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rutas
//app.use('/api/auth', authRoutes);
app.use('/api/auth', authLimiter, authRoutes);

app.use('/api/products', productRoutes);

//app.use('/api/orders', orderRoutes);
app.use('/api/orders', ordersLimiter, orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/chat', chatRoutes);
//app.use('/api/auth', authLimiter, authRoutes);
//app.use('/api/orders', orderLimiter, orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/points',   pointsRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ message: '🛒 Ecommerce API funcionando', docs: '/api/docs' });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;