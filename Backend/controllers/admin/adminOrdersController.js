// controllers/adminOrdersController.js

const Order = require('../../models/order'); // Assuming this is your order model
const User = require('../../models/user');  // User model for contacting users
const OrderItem = require('../../models/orderItem');

// Get all active orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: 'items',  // This is where the alias 'items' is used
        }
      ]
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Get details of a specific order
exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: ['items'] });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order details', error: error.message });
  }
};

// Contact the user who placed the order
exports.contactUser = async (req, res) => {
  const { orderId, message } = req.body;
  try {
    const order = await Order.findByPk(orderId, { include: [User] });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const user = order.User;  // Get the user who placed the order

    // Here you would integrate an email or messaging service to contact the user
    // Assuming you have a sendEmail utility function
    await sendEmail(user.email, 'Order Query', message);

    res.status(200).json({ message: 'User contacted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to contact user', error: error.message });
  }
};
