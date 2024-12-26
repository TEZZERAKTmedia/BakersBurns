const Cart = require('../../models/cart');
const Product = require('../../models/product');
const User = require('../../models/user');

// Fetch Cart Items
// Fetch Cart Items
// cartController.js
const getCart = async (req, res) => {
  try {
    const userId = req.user.id; // Get the userId from the middleware (attached via the token)
    console.log('Fetching cart items for userId:', userId);

    const cartItems = await Cart.findAll({
      where: { userId },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['name', 'price', 'thumbnail']
      }]
    });

    if (!cartItems || cartItems.length === 0) {
      console.log('No cart items found for user:', userId);
    } else {
      console.log('Cart items fetched:', cartItems);
    }

    res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Error fetching cart items', error });
  }
};




// Add to Cart
const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;  // Get userId from req.user

  console.log('Adding to cart:', { userId, productId, quantity }); // Debug the input data

  try {
    // Find the product by ID
    const product = await Product.findByPk(productId);
    if (!product) {
      console.log('Product not found');
      return res.status(404).json({ message: 'Product not found' });
    }
    console.log('Product found:', product.name); // Log the product data

    // Check if the item is already in the cart
    const existingCartItem = await Cart.findOne({ where: { userId, productId } });
    if (existingCartItem) {
      console.log('Item already in cart:', existingCartItem); // Log if the item is already in the cart
      return res.status(400).json({ message: 'Item already in cart' });
    }

    // Add a new item to the cart
    const newCartItem = await Cart.create({ userId, productId, quantity });
    console.log('New cart item created:', newCartItem); // Debug the newly created cart item
    res.status(201).json(newCartItem);
  } catch (error) {
    console.error('Error adding item to cart:', error); // Log the error
    res.status(500).json({ message: 'Error adding item to cart', error });
  }
};




// Remove from Cart
const removeFromCart = async (req, res) => {
  const userId = req.user.id;  // Get userId from middleware
  const { productId } = req.params;  // productId should be from the Cart table

  console.log(`Trying to remove productId ${productId} for userId ${userId}`);

  try {
    const cartItem = await Cart.findOne({ where: { userId, productId } });

    if (!cartItem) {
      console.log(`Cart item not found for userId: ${userId} and productId: ${productId}`);
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    console.log(`Cart item found:`, cartItem);

    await cartItem.destroy();
    res.status(200).json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Error removing item from cart', error });
  }
};

const getProductDetails = async (req, res) => {
  const { productId } = req.params;

  try {
    // Fetch product by ID
    const product = await Product.findByPk(productId, {
      attributes: ['id', 'name', 'description', 'price', 'image', 'length', 'width', 'height', 'weight'], // Include necessary fields
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ message: 'Error fetching product details', error });
  }
};




module.exports = { getCart, addToCart, removeFromCart, getProductDetails };
