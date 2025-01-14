const express = require('express');
const router = express.Router();
const { 
    getAllOrders,
    getOrderById,
    getUsers,
    createOrder,
    updateOrder,
    quickAddProduct,
    deleteOrder,
    getOrderDetails,
    updateTracking
} = require('../../controllers/admin/ordersController');
const adminAuthMiddleware = require('../../middleware/adminAuthMiddleware');
const {productUploadMiddleware} = require('../../config/multer')

// GET
router.get('/get', adminAuthMiddleware('admin'), getAllOrders);
router.get('/get-by-id/:orderId', adminAuthMiddleware('admin'), getOrderById);
router.get('/:orderId/details', adminAuthMiddleware('admin'), getOrderDetails);
router.get('/get-users', adminAuthMiddleware('admin'), getUsers);
router.put('/update-tracking/:id', adminAuthMiddleware('admin'), updateTracking);

// POST
router.post('/create', adminAuthMiddleware('admin'), createOrder);
router.put('/update/:orderId', adminAuthMiddleware('admin'), updateOrder);
router.post('/quick-add-product',adminAuthMiddleware('admin'), productUploadMiddleware, quickAddProduct);

// DELETE
router.delete('/delete/:orderId', adminAuthMiddleware('admin'), deleteOrder);

module.exports = router;
