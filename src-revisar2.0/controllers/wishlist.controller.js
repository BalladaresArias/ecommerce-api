const wishlistModel = require('../models/wishlist.model');
const pool = require('../config/db');

// GET /api/wishlist
const getWishlist = async (req, res) => {
  try {
    const items = await wishlistModel.getWishlistByUser(req.user.id);
    res.json({ wishlist: items, total: items.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener wishlist' });
  }
};

// POST /api/wishlist/:product_id
const addToWishlist = async (req, res) => {
  const product_id = parseInt(req.params.product_id);
  if (!product_id) return res.status(400).json({ error: 'product_id inválido' });

  // Verifica que el producto exista
  const [product] = await pool.query('SELECT id FROM products WHERE id = ?', [product_id]);
  if (product.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });

  try {
    const added = await wishlistModel.addToWishlist(req.user.id, product_id);
    if (!added) return res.status(409).json({ error: 'El producto ya está en tu wishlist' });
    res.status(201).json({ message: 'Producto agregado a wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar a wishlist' });
  }
};

// DELETE /api/wishlist/:product_id
const removeFromWishlist = async (req, res) => {
  const product_id = parseInt(req.params.product_id);
  try {
    const removed = await wishlistModel.removeFromWishlist(req.user.id, product_id);
    if (!removed) return res.status(404).json({ error: 'Producto no estaba en tu wishlist' });
    res.json({ message: 'Producto eliminado de wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar de wishlist' });
  }
};

// GET /api/wishlist/check/:product_id
const checkWishlist = async (req, res) => {
  const product_id = parseInt(req.params.product_id);
  try {
    const inWishlist = await wishlistModel.isInWishlist(req.user.id, product_id);
    res.json({ inWishlist });
  } catch (err) {
    res.status(500).json({ error: 'Error al verificar wishlist' });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, checkWishlist };
