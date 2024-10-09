const express = require('express');
const router = express.Router();
const { productUpload } = require('../config/multer'); // Add multer config
const {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  addDiscount,
  updateDiscount,
  removeDiscount,
  getDiscountedProducts,
  getProductTypes,
} = require('../controllers/admin/productController');

// Product routes
router.get('/', getProducts);
router.post('/', productUpload.single('image'), addProduct); // Handle single image upload
router.put('/:id', productUpload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

// Discount routes
router.post('/:id/discount', addDiscount); // Add discount to a product
router.put('/:id/discount', updateDiscount); // Update discount for a product
router.delete('/:id/discount', removeDiscount); // Remove discount from a product
router.get('/discounted', getDiscountedProducts);
router.get('/types', getProductTypes);

module.exports = router;
