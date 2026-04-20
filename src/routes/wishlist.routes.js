const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { getWishlist, addToWishlist, removeFromWishlist, checkWishlist } = require('../controllers/wishlist.controller');

// Todas requieren estar logueado
router.use(verifyToken);

router.get('/',                        getWishlist);
router.post('/:product_id',            addToWishlist);
router.delete('/:product_id',          removeFromWishlist);
router.get('/check/:product_id',       checkWishlist);

module.exports = router;
