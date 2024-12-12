// controllers/registerStoreController.js
const { Op } = require('sequelize');

const Product = require('../../models/product'); // Assuming a Product model exists
const TempCart = require('../../models/tempCart'); // Temporary Cart model for unregistered users

// Get all available products
const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        quantity: {
          [Op.gt]: 0, // Fetch only products where quantity is greater than 0
        },
      },
    });

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};


// Add an item to the temporary cart for unregistered users
const addToCart = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    // Generate a session ID or use an identifier for the unregistered user (e.g., guest session)
    let sessionId = req.sessionID; // Assuming express-session is used

    if (!sessionId) {
      sessionId = Date.now().toString(); // Fallback to a simple timestamp-based session ID
    }

    // Add the item to the temporary cart
    const newCartItem = await TempCart.create({
      sessionId, // Use the session ID to identify the user's cart
      itemId,
      quantity,
    });

    res.status(201).json({ message: 'Item added to cart', cartItem: newCartItem });
  } catch (error) {
    res.status(500).json({ message: 'Error adding item to cart', error });
  }
};

module.exports = {
  getProducts,
  addToCart,
};
