// controllers/storeController.js
const Product = require('../../models/product'); // Importing the Product model // Sanitization for incoming data
const Media  = require('../../models/media');
const { Op } = require('sequelize');

// Function to get all products
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
const getProductTypes = async (req, res) => {
  try {
    // Get unique product types where quantity > 0
    const productTypes = await Product.findAll({
      attributes: ['type'], // Only retrieve the 'type' attribute
      where: {
        quantity: {
          [Op.gt]: 0, // Ensure quantity is greater than 0
        },
      },
      group: ['type'], // Group by type to get unique types
    });

    // Extract the types from the result
    const types = productTypes.map((product) => product.type);

    res.status(200).json(types); // Return the product types
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product types', error });
  }
};


const getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await Product.findAll({
      where: {
        [Op.and]: [
          {
            type: {
              [Op.or]: [
                { [Op.like]: 'feature' },   // Search for 'feature'
                { [Op.like]: 'featured' }  // Search for 'featured'
              ]
            }
          },
          {
            quantity: {
              [Op.gt]: 0 // Fetch only products with quantity greater than 0
            }
          }
        ]
      }
    });

    res.status(200).json(featuredProducts); // Return the filtered featured products
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Failed to fetch featured products.' });
  }
};

// Function to add a product to the cart
const addToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;
  // Assuming you have a Cart model or logic to handle cart operations
  try {
    // Add the product to the cart logic
    // For example:
    // await Cart.addItem(userId, productId, quantity);
    res.status(201).json({ message: 'Product added to cart successfully' });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ message: 'Failed to add product to cart.' });
  }
};

// Function to remove a product from the cart
const removeFromCart = async (req, res) => {
  const { userId, productId } = req.params;
  // Assuming you have a Cart model or logic to handle cart operations
  try {
    // Remove product from the cart logic
    // For example:
    // await Cart.removeItem(userId, productId);
    res.status(200).json({ message: 'Product removed from cart successfully' });
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ message: 'Failed to remove product from cart.' });
  }
};

// Function to handle checkout (Stripe)
const createCheckoutSession = async (req, res) => {
  try {
    // Implement logic to create Stripe checkout session
    const session = {}; // Placeholder for the session object from Stripe
    res.status(200).json(session); // Respond with Stripe checkout session
  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ message: 'Failed to create checkout session.' });
  }
};
const getProductMedia = async (req, res) => {
  const { id } = req.params; // Product ID from the request parameters

  if (!id) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    // Fetch media associated with the product ID
    const mediaFiles = await Media.findAll({
      where: { productId: id }, // Filter by product ID
      attributes: ['id', 'url', 'type', 'order'], // Include media order
      order: [['order', 'ASC']], // Sort by order
    });

    if (!mediaFiles.length) {
      return res.status(200).json([]); // No media found, return empty array
    }

    res.status(200).json(mediaFiles); // Return media files as JSON
  } catch (error) {
    console.error(`Error fetching media for product ${id}:`, error);
    res.status(500).json({ message: 'Error fetching media', error });
  }
};

// Function to handle Stripe webhook events
const handleStripeWebhook = async (req, res) => {
  try {
    // Handle Stripe webhook events (e.g., payment success, payment failed)
    res.status(200).json({ message: 'Webhook received successfully' });
  } catch (err) {
    console.error('Error handling webhook:', err);
    res.status(500).json({ message: 'Failed to handle webhook.' });
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  addToCart,
  removeFromCart,
  createCheckoutSession,
  handleStripeWebhook,
  getProductMedia, 
  getProductTypes
  
};
