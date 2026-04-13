const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/:orderId', verifyToken, invoiceController.generateInvoice);

module.exports = router;