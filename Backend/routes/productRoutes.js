// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const {productUpload} = require('../config/multer'); // Add multer config
const { getProducts, addProduct, updateProduct, deleteProduct } = require('../controllers/productController');

router.get('/', getProducts);
router.post('/', productUpload.single('image'), addProduct); // Handle single image upload
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
