const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { getReviews, createReview, updateReview, deleteReview } = require('../controllers/review.controller');

// Ver reseñas de un producto — público
router.get('/:product_id', getReviews);

// Crear/editar/eliminar — requiere login
router.post('/:product_id',   verifyToken, createReview);
router.put('/:product_id',    verifyToken, updateReview);
router.delete('/:product_id', verifyToken, deleteReview);

module.exports = router;
