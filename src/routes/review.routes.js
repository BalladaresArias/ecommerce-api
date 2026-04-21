const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { getReviews, createReview, updateReview, deleteReview } = require('../controllers/review.controller');
const { verifyRole: verifyRoleR } = require('../middlewares/role.middleware');

// Ver reseñas de un producto — público
router.get('/:product_id', getReviews);

// Crear/editar/eliminar — requiere login
router.post('/:product_id',   verifyToken, createReview);
router.put('/:product_id',    verifyToken, updateReview);
router.delete('/:product_id', verifyToken, deleteReview);

router.get('/admin/all', verifyToken, verifyRoleR('admin'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const [rows] = await require('../config/db').query(
      `SELECT r.*, u.name as user_name, p.name as product_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN products p ON r.product_id = p.id
       ORDER BY r.created_at DESC
       LIMIT ?`,
      [limit]
    );
    res.json({ reviews: rows });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
});

module.exports = router;
