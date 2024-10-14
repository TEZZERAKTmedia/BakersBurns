const Order = require('../../models/order');
const { generateTrackingLink } = require('../../utils/tracking'); // Import the tracking link generator

// Create a new order
const createOrder = async (req, res) => {
    try {
        const { userId, productId, quantity, shippingAddress, billingAddress, trackingNumber, carrier, total } = req.body;
        const newOrder = await Order.create({
            userId,
            productId,
            quantity,
            shippingAddress,
            billingAddress,
            trackingNumber,
            carrier,
            total
        });
        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error });
    }
};

// Get all orders
const getAllOrders = async (req, res) => {
    try {
        const { status, userId } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (userId) filter.userId = userId;

        const orders = await Order.findAll({ where: filter });
        res.status(200).json({ message: 'Orders fetched successfully', orders });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};

// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        let trackingLink = null;

        // Generate tracking link if the order has tracking info
        if (order.trackingNumber && order.carrier) {
            trackingLink = generateTrackingLink(order.carrier, order.trackingNumber);
        }

        // Return order with tracking link
        res.status(200).json({ message: 'Order fetched successfully', order, trackingLink });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order', error });
    }
};


// Update an existing order
const updateOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, shippingAddress, billingAddress, trackingNumber, carrier } = req.body;

        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Update the order fields
        await order.update({
            status,
            shippingAddress,
            billingAddress,
            trackingNumber,
            carrier
        });

        // Generate tracking link if the tracking number and carrier are provided
        let trackingLink = null;
        if (trackingNumber && carrier) {
            trackingLink = generateTrackingLink(carrier, trackingNumber);
        }

        res.status(200).json({ message: 'Order updated successfully', order, trackingLink });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order', error });
    }
};


// Delete an order
const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        await order.destroy();
        res.status(200).json({ message: 'Order deleted successfully', orderId });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting order' });
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    deleteOrder
};
