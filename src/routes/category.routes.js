const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyRole } = require('../middlewares/role.middleware');

router.get('/', categoryController.getAll);                                           // público
router.post('/', verifyToken, verifyRole('admin'), categoryController.create);        // solo admin
router.delete('/:id', verifyToken, verifyRole('admin'), categoryController.remove);   // solo admin

module.exports = router;