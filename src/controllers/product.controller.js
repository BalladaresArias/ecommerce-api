const productModel = require('../models/product.model');

const getAll = async (req, res) => {
  try {
    const products = await productModel.getAll();
    res.json({ total: products.length, products });
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

    if (!name || !price)
      return res.status(400).json({ error: 'Nombre y precio son obligatorios' });

    const id = await productModel.create(name, description, price, stock, category_id, image_url);
    const product = await productModel.getById(id);

    res.status(201).json({ message: 'Producto creado exitosamente', product });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear producto', detail: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { name, description, price, stock, category_id, image_url } = req.body;
    const affected = await productModel.update(
      req.params.id, name, description, price, stock, category_id, image_url
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

module.exports = { getAll, getOne, create, update, remove };