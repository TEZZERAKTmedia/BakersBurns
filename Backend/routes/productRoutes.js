const express = require('express');
const router = express.Router();
const { productUploadMiddleware } = require('../config/multer'); // Unified multer middleware
const {
  getProducts,
  getProductDetails,
  applyDiscountByType,
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
router.post('/discounts-by-type', applyDiscountByType);

router.get('/:id/details', getProductDetails);

// Unified route for adding a product
router.post('/', productUploadMiddleware, addProduct);

// Unified route for updating a product
router.put('/:id', productUploadMiddleware, updateProduct);

// Route for deleting a product
router.delete('/:id', deleteProduct);

// Discount routes
router.post('/:id/discount', addDiscount); // Add discount to a product
router.put('/:id/discount', updateDiscount); // Update discount for a product
router.delete('/:id/discount', removeDiscount); // Remove discount from a product
router.get('/discounted', getDiscountedProducts);
router.get('/types', getProductTypes);



module.exports = router;
