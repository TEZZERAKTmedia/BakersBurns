const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Cart = require('../../models/cart');
const Product = require('../../models/product');
const sequelize = require('../../config/database');


// Function to generate a custom order number
function generateOrderNumber(orderId) {
  return `ORD-${orderId}-${Date.now()}`;
}

// Checkout shoulsession creation
const createCheckoutSession = async (req, res) => {
  const transaction = await sequelize.transaction(); // Start a transaction

  try {
    const userId = req.user.id; // Assuming userId is attached by your auth middleware
    console.log(`Creating checkout session for userId: ${userId}`);

    // Fetch cart items for the user within the transaction
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'thumbnail', 'quantity'],
        },
      ],
      lock: transaction.LOCK.UPDATE, // Lock rows to prevent concurrent modifications
      transaction, // Ensure query runs within the transaction
    });

    if (cartItems.length === 0) {
      console.log('No items in cart for userId:', userId);
      await transaction.rollback();
      return res.status(400).json({ message: 'No items in cart' });
    }

    // Validate stock and lock inventory
    for (const cartItem of cartItems) {
      const product = cartItem.product;

      if (cartItem.quantity > product.quantity) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: `Insufficient stock for product: ${product.name}` });
      }

      // Reduce stock and save product within the transaction
      product.quantity -= cartItem.quantity;
      await product.save({ transaction });
    }

    // Map cart items to Stripe line items
    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          images: [`${process.env.USER_FRONTEND}/uploads/${item.product.thumbnail}`],
        },
        unit_amount: item.product.price * 100, // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.USER_FRONTEND}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.USER_FRONTEND}/cancel`,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      metadata: {
        userId: `${userId}`,
        productIds: cartItems.map((item) => item.product.id).join(','),
      },
    });

    // Commit the transaction to lock inventory
    await transaction.commit();

    // Respond with the session ID to the frontend
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    await transaction.rollback(); // Rollback transaction on error
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
