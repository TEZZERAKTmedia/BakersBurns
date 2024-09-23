const Order = require('../../models/order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Cart = require('../../models/cart');
const Product = require('../../models/product');

// Function to generate a custom order number
function generateOrderNumber(orderId) {
  return `ORD-${orderId}-${Date.now()}`;
}

// Checkout session creation
const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId from middleware

    const cartItems = await Cart.findAll({
      where: { userId },
      include: [{ model: Product, as: 'product', attributes: ['name', 'price', 'image'] }]
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'No items in cart' });
    }

    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          images: [`http://localhost:3450/uploads/${item.product.image}`]  // Assuming you're hosting images
        },
        unit_amount: item.product.price * 100,  // Convert to cents
      },
      quantity: item.quantity
    }));

    // Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:4001/success',  // Change to your success URL
      cancel_url: 'http://localhost:4001/cancel',    // Change to your cancel URL
      metadata: { userId }  // Pass userId to metadata if needed
    });

    res.status(200).json({ sessionId: session.id });  // Return the sessionId to the frontend
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Failed to create checkout session', error: error.message });
  }
};


// Refund payment
const refundPayment = async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
    res.status(200).json({ message: 'Refund processed successfully', data: refund });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process refund', error: error.message });
  }
};

// Get Stripe events (optional for logging/debugging)
const getStripeEvents = async (req, res) => {
  try {
    const events = await StripeEvent.findAll(); // Assume you're storing events in a StripeEvent table
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve Stripe events', error: error.message });
  }
};

module.exports = { createCheckoutSession, refundPayment, getStripeEvents };
