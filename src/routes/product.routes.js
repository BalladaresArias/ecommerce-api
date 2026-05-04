const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyRole } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');

router.get('/', productController.getAll);                                          // público
router.get('/:id', productController.getOne);                                       // público
router.post('/', verifyToken, verifyRole('admin'), upload.single('image'), productController.create);       // solo admin
router.put('/:id', verifyToken, verifyRole('admin'), upload.single('image'), productController.update);     // solo admin
router.delete('/:id', verifyToken, verifyRole('admin'), productController.remove);  // solo admin
router.post('/import', verifyToken, verifyRole('admin'), productController.importCSV); // solo admin

module.exports = router;