const productModel = require('../models/product.model');
const pool = require('../config/db');

const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const category_id = req.query.category_id || null;

    const data = await productModel.getAll(page, limit, search, category_id);
    res.json({
      total: data.total,
      page: data.page,
      limit: data.limit,
      pages: Math.ceil(data.total / data.limit),
      products: data.products
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos', detail: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const product = await productModel.getById(req.params.id);
    if (!product)
      return res.status(404).json({ error: 'Producto no encontrado' });

    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener producto', detail: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { name, description, price, stock, category_id, image_url } = req.body;

    let finalImage = image_url;

    if (req.file) {
      finalImage = `/uploads/${req.file.filename}`;
    }

    if (!name || !price)
      return res.status(400).json({ error: 'Nombre y precio son obligatorios' });
    if (Number(price) < 0)
      return res.status(400).json({ error: 'El precio no puede ser negativo' });
    if (stock !== undefined && Number(stock) < 0)
      return res.status(400).json({ error: 'El stock no puede ser negativo' });

    const id = await productModel.create(name, description, price, stock, category_id, finalImage);
    const product = await productModel.getById(id);
    res.status(201).json({ message: 'Producto creado exitosamente', product });
  } catch (err) {
    console.error('ERROR createProduct:', err.message, err.code);
    res.status(500).json({ error: 'Error al crear producto', detail: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { name, description, price, stock, category_id, image_url } = req.body;

    let finalImage = image_url;

    if (req.file) {
      finalImage = `/uploads/${req.file.filename}`;
    }

    if (price !== undefined && Number(price) < 0)
      return res.status(400).json({ error: 'El precio no puede ser negativo' });
    if (stock !== undefined && Number(stock) < 0)
      return res.status(400).json({ error: 'El stock no puede ser negativo' });

    const affected = await productModel.update(
      req.params.id, name, description, price, stock, category_id, finalImage
    );
    if (!affected)
      return res.status(404).json({ error: 'Producto no encontrado' });

    const product = await productModel.getById(req.params.id);
    res.json({ message: 'Producto actualizado', product });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar producto', detail: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const affected = await productModel.remove(req.params.id);
    if (!affected)
      return res.status(404).json({ error: 'Producto no encontrado' });

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto', detail: err.message });
  }
};

const importCSV = async (req, res) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0)
      return res.status(400).json({ error: 'No se enviaron productos' });

    let created = 0, errors = [];

    for (const p of products) {
      if (!p.name || !p.price) {
        errors.push(`Fila sin nombre o precio: ${JSON.stringify(p)}`);
        continue;
      }
      await pool.query(
        'INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)',
        [p.name, p.description || '', Number(p.price), Number(p.stock) || 0, p.category_id || null, p.image_url || '']
      );
      created++;
    }

    res.json({ message: `${created} productos importados`, errors });
  } catch (err) {
    res.status(500).json({ error: 'Error al importar', detail: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove, importCSV };