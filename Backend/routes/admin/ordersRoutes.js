const express = require('express');
const router = express.Router();
const ordersController = require('../../controllers/admin/ordersController');
const adminAuthMiddleware = require('../../middleware/adminAuthMiddleware');

// GET
router.get('/get', adminAuthMiddleware(), ordersController.getAllOrders);
router.get('/get-by-id/:orderId', adminAuthMiddleware(), ordersController.getOrderById);



// POST
router.post('/create', adminAuthMiddleware(), ordersController.createOrder);
router.put('/update/:orderId', adminAuthMiddleware(), ordersController.updateOrder);

// DELETE
router.delete('/delete-order/:orderId', adminAuthMiddleware(), ordersController.deleteOrder);

module.exports = router;
