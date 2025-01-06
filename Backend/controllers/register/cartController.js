const Cart = require('../../models/cart');
const Product = require('../../models/product');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Get items in the cart
const getCartItems = async (req, res) => {
    const { items } = req.body; // Expecting an array of { productId, quantity }
  
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid input. Must send an array of items.' });
    }
  
    try {
      // Fetch all products by product IDs
      const productIds = items.map((item) => item.productId);
      const products = await Product.findAll({
        where: {
          id: productIds,
        },
      });
  
      // Build the response by combining product details and quantities
      const cartDetails = items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found.`);
        }
  
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          thumbnail: product.thumbnail,
          stock: product.stock,
          quantity: item.quantity,
          total: product.price * item.quantity,
        };
      });
  
      res.status(200).json({ cartDetails });
    } catch (error) {
      console.error('Error fetching cart items:', error);
      res.status(500).json({ error: error.message });
    }
  };

// Lock inventory for the cart items
const lockInventory = async (req, res, next) => {
    try {
      const { cartItems } = req.body;
  
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }
  
      for (const cartItem of cartItems) {
        const product = await Product.findByPk(cartItem.id);
  
        if (!product) {
          return res.status(404).json({ message: `Product with ID ${cartItem.id} not found` });
        }
  
        if (product.stock < cartItem.quantity) {
          return res.status(400).json({ message: `Not enough stock for ${product.name}` });
        }
  
        product.stock -= cartItem.quantity; // Reduce stock
        await product.save();
      }
  
      next();
    } catch (error) {
      console.error('Error locking inventory:', error);
      res.status(500).json({ message: 'Error locking inventory' });
    }
  };
  const unlockInventory = async (cartItems) => {
    try {
      for (const cartItem of cartItems) {
        const product = await Product.findByPk(cartItem.id);
        if (product) {
          product.stock += cartItem.quantity; // Add back stock
          await product.save();
        }
      }
    } catch (error) {
      console.error('Error unlocking inventory:', error);
    }
  };

// Create a Stripe checkout session
const createCheckoutSession = async (req, res) => {
    try {
      const { cartItems } = req.body;
  
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }
  
      const lineItems = await Promise.all(
        cartItems.map(async (cartItem) => {
          const product = await Product.findByPk(cartItem.id);
  
          if (!product) {
            throw new Error(`Product with ID ${cartItem.id} not found`);
          }
  
          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: product.name,
                images: [`${process.env.BASE_URL}/uploads/${product.thumbnail}`],
              },
              unit_amount: Math.round(product.price * 100),
            },
            quantity: cartItem.quantity,
          };
        })
      );
  
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.REGISTER_FRONTEND}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.REGISTER_FRONTEND}/cancel`,
      });
  
      res.status(200).json({ url: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ message: 'Error creating checkout session' });
    }
  };


module.exports = {
    getCartItems,
    lockInventory,
    createCheckoutSession,
    unlockInventory
}