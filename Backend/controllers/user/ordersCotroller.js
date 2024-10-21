const Order = require('../../models/order');
const User = require('../../models/user');
const Product = require('../../models/product');

// Get all orders for the authenticated user
const getOrdersForUser = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { userId: req.user.id }; // Using req.user.id provided by userAuthMiddleware

        console.log('User ID:', req.user.id);
        console.log('Status query param:', status);
        console.log('Filter object', filter);


        if (status) filter.status = status;

        // Fetch orders for the user
        const orders = await Order.findAll({
            where: filter,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['username', 'email'],
                },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['image', 'name'],
                },
            ],
            attributes: [
                'id', 'quantity', 'shippingAddress', 'billingAddress', 'trackingNumber', 'carrier', 'total', 'status', 'createdAt', 'updatedAt',
            ],
        });

        console.log('Raw orders data from DB:', orders);

        // Map orders to include user and product info
        const ordersWithDetails = orders.map(order => {
            let trackingLink = null;
            if (order.trackingNumber && order.carrier) {
                trackingLink = generateTrackingLink(order.carrier, order.trackingNumber);
            }

            console.log('Processing order:', {
                id: order.id,
                username: order.user ? order.user.username : 'Unknown',
                product: order.product ? order.product : 'Unknown',
            });

            return {
                id: order.id,
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
                username: order.user ? order.user.username : 'Unknown',
                email: order.user ? order.user.email : 'Unknown',
                productImage: order.product ? order.product.image : null,
                productName: order.product ? order.product.name : 'Unknown',
            };
        });

        console.log('Processed orders with details:', ordersWithDetails);

        res.status(200).json({ message: 'Orders fetched successfully', orders: ordersWithDetails });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};

// Get a specific order by ID for the authenticated user
const getOrderForUserById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findOne({
            where: { id: orderId, userId: req.user.id }, // Ensure the order belongs to the authenticated user
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['username', 'email'],
                },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['image', 'name'],
                },
            ],
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

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

// Utility function to generate tracking link
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

module.exports = {
    getOrdersForUser,
    getOrderForUserById,
};
