// controllers/storeController.js
const Product = require('../../models/product'); // Importing the Product model
const xss = require('xss'); // Sanitization for incoming data

// Function to get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();  // Fetch all products
    res.status(200).json(products);  // Return the list of products
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Failed to fetch products.' });
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
  addToCart,
  removeFromCart,
  createCheckoutSession,
  handleStripeWebhook,
};
