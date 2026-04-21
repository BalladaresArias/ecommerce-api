const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { getWishlist, addToWishlist, removeFromWishlist, checkWishlist } = require('../controllers/wishlist.controller');
const { verifyRole } = require('../middlewares/role.middleware');

// Todas requieren estar logueado
router.use(verifyToken);

router.get('/',                        getWishlist);
router.post('/:product_id',            addToWishlist);
router.delete('/:product_id',          removeFromWishlist);
router.get('/check/:product_id',       checkWishlist);

router.get('/admin/top', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const [rows] = await require('../config/db').query(
      `SELECT w.product_id, p.name, COUNT(*) as total
       FROM wishlists w
       JOIN products p ON w.product_id = p.id
       GROUP BY w.product_id, p.name
       ORDER BY total DESC
       LIMIT 20`
    );
    res.json({ products: rows });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener top wishlist' });
  }
});

module.exports = router;
