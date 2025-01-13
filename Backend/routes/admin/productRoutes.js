const express = require('express');
const router = express.Router();
const { productUploadMiddleware } = require('../../config/multer'); // Unified multer middleware
const {
  getProducts,
  getProductDetails,
  applyDiscountByType,
  addProduct,
  addMedia,
  updateProduct,
  updateMedia,
  deleteProduct,
  addDiscount,
  updateDiscount,
  removeDiscount,
  getDiscountedProducts,
  getProductTypes,
  getProductMedia,
  
  
} = require('../../controllers/admin/productController');
const adminAuthMiddleware = require('../../middleware/adminAuthMiddleware');

// Product routes
router.get('/', getProducts);
router.post('/discounts-by-type', adminAuthMiddleware('admin'), applyDiscountByType);

router.get('/:id/details', getProductDetails);
router.get('/:id/media', getProductMedia);
router.post('/add-media', productUploadMiddleware, addMedia);


// Unified route for adding a product
router.post('/', productUploadMiddleware, addProduct);

// Unified route for updating a product
router.put('/update-media/:id',adminAuthMiddleware('admin'), productUploadMiddleware, updateMedia);
router.put('/update-product/:id',adminAuthMiddleware('admin'), productUploadMiddleware, updateProduct);

// Route for deleting a product
router.delete('/:id', adminAuthMiddleware('admin'), deleteProduct);

// Discount routes
router.post('/:id/discount', addDiscount); // Add discount to a product
router.put('/:id/discount', updateDiscount); // Update discount for a product
router.delete('/:id/discount', removeDiscount); // Remove discount from a product
router.get('/discounted', getDiscountedProducts);
router.get('/types', getProductTypes);





module.exports = router;
