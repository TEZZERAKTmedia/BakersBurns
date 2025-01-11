const GuestCart = require('../../models/guestCart');
const Product = require('../../models/product');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Add to Guest Cart
const addToGuestCart = async (req, res) => {
  const { sessionId, productId, quantity } = req.body;

  if (!sessionId || !productId || !quantity) {
    return res.status(400).json({ message: 'Session ID, product ID, and quantity are required.' });
  }

  try {
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0
      await GuestCart.destroy({ where: { sessionId, productId } });
      return res.status(200).json({ message: 'Item removed from cart.' });
    }

    // Check if the product already exists in the guest cart
    const existingCartItem = await GuestCart.findOne({ where: { sessionId, productId } });

    if (existingCartItem) {
      existingCartItem.quantity = quantity;
      await existingCartItem.save();
    } else {
      await GuestCart.create({ sessionId, productId, quantity });
    }

    res.status(200).json({ message: 'Item added/updated in cart successfully.' });
  } catch (error) {
    console.error('Error adding item to guest cart:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to add item to cart.' });
  }
};

// Get Guest Cart Items
// Get Guest Cart Items
const getCartItems = async (req, res) => {
  const { sessionId } = req.body;

  console.log("Received session ID:", sessionId);

  if (!sessionId) {
    console.log("No session ID provided in the request.");
    return res.status(400).json({ message: 'Session ID is required.' });
  }

  try {
    // Fetch cart items associated with the session ID
    const cartItems = await GuestCart.findAll({
      where: { sessionId },
      include: [
        {
          model: Product,
          as: 'Product',
        },
      ],
    });

    console.log("Database query results:", cartItems);

    if (cartItems.length === 0) {
      console.log("No cart items found for session ID:", sessionId);
      return res.status(200).json({ cartDetails: [] });
    }

    // Build cart details response
    const cartDetails = cartItems.map((item) => ({
      id: item.productId,
      name: item.Product.name,
      price: item.Product.price,
      thumbnail: item.Product.thumbnail,
      stock: item.Product.quantity,
      quantity: item.quantity,
      total: item.Product.price * item.quantity,
    }));

    console.log("Cart details to be sent in response:", cartDetails);

    res.status(200).json({ cartDetails });
  } catch (error) {
    console.error('Error fetching cart items:', error.message);
    res.status(500).json({ error: error.message });
  }
};
const deleteCartItem = async (req, res) => {
  const { sessionId, productId } = req.body;

  if (!sessionId || !productId) {
    return res.status(400).json({ message: 'Session ID and product ID are required.' });
  }

  try {
    const deletedRows = await GuestCart.destroy({
      where: { sessionId, productId },
    });

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    res.status(200).json({ message: 'Cart item deleted successfully.' });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    res.status(500).json({ message: 'Failed to delete cart item.' });
  }
};


// Lock Inventory
const lockInventory = async (req, res, next) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ message: 'Session ID is required.' });
  }

  try {
    const cartItems = await GuestCart.findAll({ where: { sessionId }, include: [Product] });

    for (const cartItem of cartItems) {
      const product = cartItem.Product;

      if (!product) {
        return res.status(404).json({ message: `Product with ID ${cartItem.productId} not found` });
      }

      if (product.quantity < cartItem.quantity) {
        return res.status(400).json({ message: `Not enough quantity for ${product.name}` });
      }

      product.quantity -= cartItem.quantity;
      await product.save();
    }

    next();
  } catch (error) {
    console.error('Error locking inventory:', error.message, error.stack);
    res.status(500).json({ message: 'Error locking inventory' });
  }
};

// Unlock Inventory
const unlockInventory = async (cartItems) => {
  try {
    for (const cartItem of cartItems) {
      const product = await Product.findByPk(cartItem.productId);

      if (product) {
        product.quantity += cartItem.quantity;
        await product.save();
      }
    }
  } catch (error) {
    console.error('Error unlocking inventory:', error.message, error.stack);
  }
};

// Create Stripe Checkout Session
const createCheckoutSession = async (req, res) => {
  try {
    const { sessionId, metadata } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required.' });
    }

    // Validate metadata for acceptance of terms
    if (!metadata || !metadata.hasAcceptedPrivacy || !metadata.hasAcceptedTermsOfService) {
      return res.status(400).json({
        message: 'Must accept Terms and Conditions and Privacy Policy to proceed.',
        redirect: '/accept-privacy-terms', // Optional: Provide a link to redirect
      });
    }

    // Fetch cart items with the correct alias
    const cartItems = await GuestCart.findAll({
      where: { sessionId },
      include: [
        {
          model: Product,
          as: 'Product',
        },
      ],
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Lock inventory
    for (const cartItem of cartItems) {
      const product = cartItem.Product;

      if (!product) {
        return res.status(404).json({ message: `Product with ID ${cartItem.productId} not found` });
      }

      if (product.quantity < cartItem.quantity) {
        return res.status(400).json({ message: `Not enough quantity for ${product.name}` });
      }

      product.quantity -= cartItem.quantity;
      await product.save();
    }

    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.Product.name,
          images: [`${process.env.BASE_URL}/uploads/${item.Product.thumbnail}`],
        },
        unit_amount: Math.round(item.Product.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.REGISTER_FRONTEND}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.REGISTER_FRONTEND}/cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        sessionId,
        hasAcceptedPrivacy: metadata.hasAcceptedPrivacy, // Log for audit
        hasAcceptedTermsOfService: metadata.hasAcceptedTermsOfService, // Log for audit
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'], // Add or remove countries as needed
      },
      billing_address_collection: 'required', // Require billing address
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Error creating checkout session' });
  }
};



// Cancel Checkout Session
const cancelCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      console.error("No sessionId provided in request.");
      return res.status(400).json({ message: 'Session ID is required.' });
    }

    console.log("Received sessionId:", sessionId);

    const cartItems = await GuestCart.findAll({
      where: { sessionId },
      include: [{ model: Product, as: 'Product' }],
    });

    console.log("Cart Items Fetched:", cartItems);

    if (cartItems.length === 0) {
      console.error(`No cart items found for sessionId: ${sessionId}`);
      return res.status(400).json({ message: 'No cart data found for session' });
    }

    // Unlock inventory
    for (const cartItem of cartItems) {
      const product = cartItem.Product;
      if (product) {
        product.quantity += cartItem.quantity;
        await product.save();
        console.log(
          `Unlocked inventory for product: ${product.name}, quantity restored: ${cartItem.quantity}`
        );
      }
    }

    res.status(200).json({ message: 'Inventory unlocked successfully' });
  } catch (error) {
    console.error('Error unlocking inventory:', error);
    res.status(500).json({ message: 'Failed to unlock inventory' });
  }
};
const setPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    await User.update({ password: hashedPassword }, { where: { email: decoded.email } });

    res.status(200).json({ message: 'Password set successfully!' });
  } catch (err) {
    console.error('Error setting password:', err);
    res.status(400).json({ message: 'Invalid or expired token.' });
  }
};


module.exports = {
  addToGuestCart,
  getCartItems,
  lockInventory,
  unlockInventory,
  createCheckoutSession,
  cancelCheckoutSession,
  deleteCartItem,
  setPassword
};
