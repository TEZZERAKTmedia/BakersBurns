const express = require('express');
const router = express.Router();
const { getAllOrders } = require('../../controllers/admin/notificationController');

// Route to check for processing orders
router.get('/orders', getAllOrders);

module.exports = router;
