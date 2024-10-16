const Order = require('../../models/order');
const User = require('../../models/user');
const Product = require('../../models/product');
// Import the tracking link generator

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
const generateTrackingLink = (carrier, trackingNumber) => {
    let baseUrl;
    switch (carrier.toLowerCase()) {
        case 'ups':
            baseUrl = `https://wwwapps.ups.com/WebTracking/track?track=yes&trackNums=${trackingNumber}`;
            break;
        case 'fedex':
            baseUrl = `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
            break;
        case 'usps':
            baseUrl = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
            break;
        case 'dhl':
            baseUrl = `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}&brand=DHL`;
            break;
        default:
            throw new Error('Unsupported carrier');
    }
    return baseUrl;
};


// Get all orders
const getAllOrders = async (req, res) => {
    try {
        const { status, userId } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (userId) filter.userId = userId;

        // Step 1: Fetch all orders
        const orders = await Order.findAll({
            where: filter,
            include: [
                {
                    model: User,
                    as: 'user', // This should match the alias defined in the association
                    attributes: ['username', 'email'] // Fetch only the required user fields
                },
                {
                    model: Product, // Assuming this is the correct model for your products
                    as: 'product',  // Assuming this is the correct alias for the association
                    attributes: ['image', 'name'] // Fetch image and name from the Products table
                },
            ],
            attributes: [
                'id',
                'userId',
                'productId',
                'quantity',
                'shippingAddress',
                'billingAddress',
                'trackingNumber',
                'carrier',
                'total',
                'status',
                'createdAt',
                'updatedAt'
            ]
        });

        // Logging the raw orders fetched from the database to inspect user association
        console.log('Fetched orders:', JSON.stringify(orders, null, 2));

        // Step 2: For each order, fetch associated User information (username, email)
        const ordersWithUserDetails = await Promise.all(
            orders.map(async (order) => {
                // Logging the user attached to the order
                console.log('Order User:', JSON.stringify(order.user, null, 2));
                console.log('Order Product:', JSON.stringify(order.product, null, 2));

                // Generate tracking link if tracking info is available
                let trackingLink = null;
                if (order.trackingNumber && order.carrier) {
                    trackingLink = generateTrackingLink(order.carrier, order.trackingNumber);
                }

                return {
                    id: order.id,
                    userId: order.userId,
                    productId: order.productId,
                    quantity: order.quantity,
                    shippingAddress: order.shippingAddress,
                    billingAddress: order.billingAddress,
                    trackingNumber: order.trackingNumber,
                    carrier: order.carrier,
                    total: order.total,
                    status: order.status,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt,
                    trackingLink: trackingLink || 'Tracking info not available',
                    username: order.user ? order.user.username : 'Unknown', // Attach username from associated user
                    email: order.user ? order.user.email : 'Unknown',       // Attach email from associated user
                    productImage: order.product ? order.product.image : null, // Attach product image
                    productName: order.product ? order.product.name : 'Unknown', // Attach product name
                };
            })
        );

        // Step 3: Return orders with user details
        res.status(200).json({ message: 'Orders fetched successfully', orders: ordersWithUserDetails });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};


// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Generate tracking link if the order has tracking info
        let trackingLink = null;
        if (order.trackingNumber && order.carrier) {
            trackingLink = generateTrackingLink(order.carrier, order.trackingNumber);
        }

        res.status(200).json({ 
            message: 'Order fetched successfully', 
            order: { ...order.toJSON(), trackingLink: trackingLink || 'Tracking info not available' }
        });
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
        let trackingLink;
        if (trackingNumber && carrier) {
            trackingLink = generateTrackingLink(carrier, trackingNumber);
        }

        res.status(200).json({ message: 'Order updated successfully', trackingLink });
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
    deleteOrder,
   
    generateTrackingLink,
};
