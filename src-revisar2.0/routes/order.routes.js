const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyRole } = require('../middlewares/role.middleware');

router.post('/', verifyToken, verifyRole('admin', 'cliente'), orderController.createOrder);         // cliente y admin
router.get('/my-orders', verifyToken, verifyRole('admin', 'cliente'), orderController.getMyOrders); // cliente y admin
router.get('/', verifyToken, verifyRole('admin'), orderController.getAllOrders);                     // solo admin
router.put('/:id/status', verifyToken, verifyRole('admin'), orderController.updateStatus);          // solo admin

module.exports = router;