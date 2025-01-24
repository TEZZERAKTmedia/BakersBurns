const express = require('express');
const router = express.Router();
const discountController = require('../../controllers/admin/discountController');  // Import the new discount controller

// Routes for handling discounts
router.get('/', discountController.getDiscountedProductsByType); // Get all discounts for a product
router.post('/create-by-type', discountController.addDiscountByType); // Create a new discount for a product
router.put('/', discountController.updateDiscountByType); // Update an existing discount
router.delete('/', discountController.deleteDiscountByType); // Delete a discount
router.get('/type', discountController.getAllProductTypes); // Fetch all types

module.exports = router;
