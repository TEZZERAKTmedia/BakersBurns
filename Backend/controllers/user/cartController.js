const Cart = require('../../models/cart');
const Product = require('../../models/product');
const User = require('../../models/user');


const getCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['name', 'price', 'image'] // Fetch only the necessary attributes
      }]
    });
    res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Error fetching cart items', error });
  }
};

const addToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  console.log('Request body:', req.body); // Log the request body

  try {
    // Ensure product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ensure user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the item already exists in the cart
    const existingCartItem = await Cart.findOne({ where: { userId, productId } });
    console.log('Existing cart item:', existingCartItem); // Log the existing cart item

    if (existingCartItem) {
      return res.status(400).json({ message: 'This item is already in your cart. Maximum quantity is 1.' });
    } else {
      // Add item to the cart
      const newCartItem = await Cart.create({ userId, productId, quantity });
      res.status(201).json(newCartItem);
    }
  } catch (error) {
    console.error('Error adding items to cart:', error); // Log the error in detail
    res.status(500).json({ message: 'Error adding items to cart', error });
  }
};

const removeFromCart = async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const cartItem = await Cart.findOne({ where: { userId, productId } });

    if (cartItem) {
      await cartItem.destroy();
      res.status(200).json({ message: 'Item removed from cart' });
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error removing item from cart' });
  }
};

module.exports = { getCart, addToCart, removeFromCart };
