const Order = require('../../models/order'); // Ensure this path is correct

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    // Fetch all orders using Sequelize
    const orders = await Order.findAll();
    res.status(200).json(orders); // Send the full list of orders
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
};

module.exports = {
  getAllOrders,
};
