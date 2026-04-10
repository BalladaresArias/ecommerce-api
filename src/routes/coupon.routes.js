const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyRole } = require('../middlewares/role.middleware');

router.post('/validate', verifyToken, couponController.validate);
router.get('/', verifyToken, verifyRole('admin'), couponController.getAll);
router.post('/', verifyToken, verifyRole('admin'), couponController.create);
router.patch('/:id/toggle', verifyToken, verifyRole('admin'), couponController.toggleActive);
router.delete('/:id', verifyToken, verifyRole('admin'), couponController.remove);

module.exports = router;