const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { getMyPoints, getHistory, redeemPoints } = require('../controllers/points.controller');
const { verifyRole: verifyRoleP } = require('../middlewares/role.middleware');

router.use(verifyToken);

router.get('/',          getMyPoints);
router.get('/history',   getHistory);
router.post('/redeem',   redeemPoints);
router.get('/admin/top', verifyToken, verifyRoleP('admin'), async (req, res) => {
  try {
    const [rows] = await require('../config/db').query(
      `SELECT p.user_id, p.total, u.name, u.email
       FROM points p
       JOIN users u ON p.user_id = u.id
       WHERE p.total > 0
       ORDER BY p.total DESC
       LIMIT 50`
    );
    res.json({ users: rows });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener top puntos' });
  }
});

module.exports = router;
