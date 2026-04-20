const reviewModel = require('../models/review.model');

// GET /api/reviews/:product_id
const getReviews = async (req, res) => {
  const product_id = parseInt(req.params.product_id);
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const data = await reviewModel.getReviewsByProduct(product_id, page, limit);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
};

// POST /api/reviews/:product_id
const createReview = async (req, res) => {
  const product_id = parseInt(req.params.product_id);
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5)
    return res.status(400).json({ error: 'Rating debe ser entre 1 y 5' });

  try {
    // Verificar que ya no haya reseña previa
    const existing = await reviewModel.getUserReview(req.user.id, product_id);
    if (existing) return res.status(409).json({ error: 'Ya tienes una reseña para este producto' });

    // Verificar que tenga una orden entregada con ese producto
    const canReview = await reviewModel.hasDeliveredOrder(req.user.id, product_id);
    if (!canReview)
      return res.status(403).json({ error: 'Solo puedes reseñar productos que hayas comprado y recibido' });

    const id = await reviewModel.createReview(req.user.id, product_id, rating, comment || '');
    res.status(201).json({ message: 'Reseña creada', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear reseña' });
  }
};

// PUT /api/reviews/:product_id
const updateReview = async (req, res) => {
  const product_id = parseInt(req.params.product_id);
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5)
    return res.status(400).json({ error: 'Rating debe ser entre 1 y 5' });

  try {
    const updated = await reviewModel.updateReview(req.user.id, product_id, rating, comment || '');
    if (!updated) return res.status(404).json({ error: 'Reseña no encontrada' });
    res.json({ message: 'Reseña actualizada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar reseña' });
  }
};

// DELETE /api/reviews/:product_id
const deleteReview = async (req, res) => {
  const product_id = parseInt(req.params.product_id);
  try {
    const deleted = await reviewModel.deleteReview(req.user.id, product_id);
    if (!deleted) return res.status(404).json({ error: 'Reseña no encontrada' });
    res.json({ message: 'Reseña eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar reseña' });
  }
};

module.exports = { getReviews, createReview, updateReview, deleteReview };
