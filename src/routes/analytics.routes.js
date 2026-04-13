const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyRole } = require('../middlewares/role.middleware');

router.get('/dashboard', verifyToken, verifyRole('admin'), analyticsController.getDashboard);

module.exports = router;