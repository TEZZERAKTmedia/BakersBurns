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
    const userId = req.user.id; // Assuming userId is attached by your auth middleware
    console.log(`Creating checkout session for userId: ${userId}`);

    // Fetch cart items for the user
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image'] }]
    });

    if (cartItems.length === 0) {
      console.log('No items in cart for userId:', userId);
      return res.status(400).json({ message: 'No items in cart' });
    }

    // Map cart items to Stripe line items and include product IDs
    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          images: [`http://localhost:3450/uploads/${item.product.image}`]
        },
        
        unit_amount: item.product.price * 100,  // Convert to cents
      },
      quantity: item.quantity
    }));

    // Prepare metadata to be passed to Stripe
    const metadata = {
      userId: `${userId}`,  // Ensure that userId is passed as a string
      productIds: cartItems.map(item => item.product.id).join(','), // Passing product IDs as a comma-separated string
    };

    // Log all the data being passed to Stripe
    console.log('Line items:', lineItems);
    console.log('Metadata:', metadata);

    // Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:4001/success',
      cancel_url: 'http://localhost:4001/cancel',
      payment_intent_data: {
        metadata: metadata,  // Attach metadata
      },
      // Collect shipping and billing address
      shipping_address_collection: {
        allowed_countries: ['US']
      },
      billing_address_collection: 'required',
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 500, currency: 'usd' },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
      ],
    });

    // Respond with the session ID to the frontend
    res.status(200).json({ sessionId: session.id });
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
