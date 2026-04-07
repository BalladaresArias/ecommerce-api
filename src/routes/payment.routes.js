const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyRole } = require('../middlewares/role.middleware');

router.post('/transaction', verifyToken, paymentController.createTransaction);
router.post('/webhook', paymentController.webhook);
router.post('/refund/:id', verifyToken, verifyRole('admin'), paymentController.refundOrder);

module.exports = router;