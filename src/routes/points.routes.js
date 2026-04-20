const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { getMyPoints, getHistory, redeemPoints } = require('../controllers/points.controller');

router.use(verifyToken);

router.get('/',          getMyPoints);
router.get('/history',   getHistory);
router.post('/redeem',   redeemPoints);

module.exports = router;
