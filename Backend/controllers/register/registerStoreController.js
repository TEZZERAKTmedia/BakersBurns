// controllers/registerStoreController.js
const { Op } = require('sequelize');
const Media = require('../../models/media');
const Product = require('../../models/product'); // Assuming a Product model exists
const TempCart = require('../../models/tempCart'); // Temporary Cart model for unregistered users
const Sequelize = require('../../config/database')

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
const getProductMedia = async (req, res) => {
  const { productId } = req.params;

  try {
    // Check if the product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Fetch all media related to the product
    const media = await Media.findAll({
      where: { productId },
      attributes: ['id', 'url', 'type', 'isDefault', 'order'], // Fetch relevant fields
      order: [['order', 'ASC']], // Sort media by `order` field
    });

    if (media.length === 0) {
      return res.status(404).json({ message: 'No media found for this product.' });
    }

    res.status(200).json(media);
  } catch (error) {
    console.error('Error fetching product media:', error);
    res.status(500).json({ message: 'Failed to fetch product media.' });
  }
};
const getProductTypes = async (req, res) => {
  try {
    // First, fetch distinct product types
    const productTypesResult = await Product.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('type')), 'type']],
      where: {
        type: {
          [Op.not]: null,
        },
      },
    });

    // Map to get an array of types
    const types = productTypesResult.map((product) => product.get('type'));

    // For each type, fetch the 4 most recent product thumbnails
    const result = await Promise.all(
      types.map(async (type) => {
        const products = await Product.findAll({
          where: { type },
          attributes: ['thumbnail'],
          order: [['createdAt', 'DESC']],
          limit: 4,
        });
        const thumbnails = products.map((product) => product.thumbnail);
        return { type, thumbnails };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching product types:', error);
    res.status(500).json({ message: 'Error fetching product types', error });
  }
};




module.exports = {
  getProducts,
  addToCart,
  getProductMedia,
  getProductTypes
};
