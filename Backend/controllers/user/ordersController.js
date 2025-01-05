const Order = require('../../models/order');
const OrderItem = require('../../models/orderItem');
const User = require('../../models/user');
const Product = require('../../models/product');
const { decrypt } = require('../../utils/encrypt');




// Get all orders for the authenticated user
const getOrdersForUser = async (req, res) => {
    try {
      const { status } = req.query;
      const filter = { userId: req.user.id };
  
      if (status) filter.status = status;
  
      const orders = await Order.findAll({
        where: filter,
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['name', 'thumbnail', 'price'],
              },
            ],
          },
        ],
        attributes: [
          'id',
          'total',
          'shippingAddress',
          'billingAddress',
          'trackingNumber',
          'carrier',
          'status',
          'createdAt',
          'updatedAt',
        ],
      });
  
      // Decrypt sensitive fields and serialize the orders
      const serializedOrders = orders.map(order => {
        const decryptedShippingAddress = order.shippingAddress
          ? JSON.parse(decrypt(order.shippingAddress))
          : null;
        const decryptedBillingAddress = order.billingAddress
          ? JSON.parse(decrypt(order.billingAddress))
          : null;
  
        return {
          ...order.toJSON(),
          shippingAddress: decryptedShippingAddress,
          billingAddress: decryptedBillingAddress,
        };
      });
  
      res.status(200).json({ message: 'Orders fetched successfully', orders: serializedOrders });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Error fetching orders', error });
    }
  };


// Get a specific order by ID for the authenticated user
const getOrderForUserById = async (req, res) => {
    try {
      const { orderId } = req.params;
  
      // Fetch the specific order
      const order = await Order.findOne({
        where: { id: orderId, userId: req.user.id }, // Ensure the order belongs to the user
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['username', 'email'], // Include User details
          },
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'thumbnail', 'price'], // Include Product details
              },
            ],
          },
        ],
        attributes: [
          'id',
          'shippingAddress',
          'billingAddress',
          'trackingNumber',
          'carrier',
          'total',
          'status',
          'createdAt',
          'updatedAt',
        ],
      });
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // Decrypt sensitive fields
      const decryptedShippingAddress = order.shippingAddress
        ? JSON.parse(decrypt(order.shippingAddress))
        : null;
      const decryptedBillingAddress = order.billingAddress
        ? JSON.parse(decrypt(order.billingAddress))
        : null;
  
      // Map and transform the order into the desired response format
      const items = order.items.map((orderItem) => ({
        productId: orderItem.product?.id || null,
        productName: orderItem.product?.name || 'Unknown',
        productImage: orderItem.product?.thumbnail
          ? `${process.env.BASE_URL}/uploads/${orderItem.product.thumbnail}` // Generate full URL
          : null, // Use null if no image
        quantity: orderItem.quantity,
        price: orderItem.product?.price || 0,
      }));
  
      const response = {
        id: order.id,
        username: order.user?.username || 'Unknown',
        email: order.user?.email || 'Unknown',
        shippingAddress: decryptedShippingAddress,
        billingAddress: decryptedBillingAddress,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items,
      };
  
      res.status(200).json({ message: 'Order fetched successfully', order: response });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ message: 'Error fetching order', error });
    }
  };
  

// Utility function to generate tracking link
const generateTrackingLink = (carrier, trackingNumber) => {
    let baseUrl;
    switch (carrier?.toLowerCase()) {
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
