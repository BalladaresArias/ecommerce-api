const categoryModel = require('../models/category.model');

const getAll = async (req, res) => {
  try {
    const categories = await categoryModel.getAll();
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías', detail: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name)
      return res.status(400).json({ error: 'El nombre es obligatorio' });

    const id = await categoryModel.create(name, description);
    res.status(201).json({ message: 'Categoría creada', category: { id, name, description } });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear categoría', detail: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const affected = await categoryModel.remove(req.params.id);
    if (!affected)
      return res.status(404).json({ error: 'Categoría no encontrada' });

    res.json({ message: 'Categoría eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar categoría', detail: err.message });
  }
};

module.exports = { getAll, create, remove };