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

const app = express();

// Middlewares globales
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Documentación Swagger
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);

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