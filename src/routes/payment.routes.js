const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/transaction', verifyToken, paymentController.createTransaction);
router.post('/webhook', paymentController.webhook);

module.exports = router;