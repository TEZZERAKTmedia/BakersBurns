const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require('../../models/product');
const Cart = require('../../models/cart');
require('dotenv').config();

// Function to create a Stripe checkout session
const createCheckoutSession = async (req, res) => {
  const { userId, items } = req.body;

  try {
    // Create the checkout session logic here...
    const cartItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findOne({ where: { id: item.productId } });
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              images: [`${process.env.USER_FRONTEND}/uploads/${product.image}`],
            },
            unit_amount: product.price * 100,
          },
          quantity: item.quantity,
        };
      })
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cartItems,
      mode: 'payment',
      success_url: `${process.env.USER_FRONTEND}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.USER_FRONTEND}/cancel`,
      automatic_tax: { enabled: true },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session', error);
    res.status(500).json({ message: 'Error creating checkout session' });
  }
};

// Function to handle Stripe webhook events
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.sendStatus(400);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const items = session.display_items;

      for (const item of items) {
        await Product.update({ isAvailable: false }, { where: { name: item.product.name } });
        await Cart.update({ isAvailable: false }, { where: { productId: item.product.id } });
      }

      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// Export the controller functions
module.exports = {
  createCheckoutSession,
  handleStripeWebhook
};
