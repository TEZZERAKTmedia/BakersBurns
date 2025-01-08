const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../../models/order');
const Product = require('../../models/product');
const Cart = require('../../models/cart');
const OrderItem = require('../../models/orderItem');
const User = require('../../models/user'); // Import User model
const GuestCart = require('../../models/guestCart'); // Import GuestCart model
const { encrypt } = require('../../utils/encrypt');

const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    console.log('Webhook received, event type:', event.type);

    if (event.type === 'checkout.session.completed') {
      console.log('Processing checkout.session.completed event...');

      const session = event.data.object;

      // Extract metadata and session details
      const sessionId = session.metadata?.sessionId;
      const userId = session.metadata?.userId;
      const metadataEmail = session.metadata?.email;
      const customerEmail = session.customer_details?.email; // Stripe-provided email
      const total = session.amount_total / 100; // Convert to dollars

      if (!sessionId && !userId) {
        console.error('Missing sessionId or userId in session metadata.');
        return res.status(400).send('Webhook Error: Missing sessionId or userId.');
      }

      // Determine email: use metadata email if available, otherwise use Stripe email
      const email = metadataEmail || customerEmail;

      if (!email) {
        console.error('Missing email from both metadata and Stripe session.');
        return res.status(400).send('Webhook Error: Missing email.');
      }

      console.log(`Email for checkout: ${email}`);

      // Handle guest checkout: create user account if userId is not provided
      let user;
      if (!userId) {
        user = await User.findOne({ where: { email } });
        if (!user) {
          // Create a guest user account
          user = await User.create({
            email,
            username: `guest_${Date.now()}`,
            isGuest: true, // Mark as guest user
          });
          console.log(`Guest user created with email: ${email}`);
        } else {
          console.log(`User already exists for email: ${email}`);
        }
      } else {
        user = await User.findByPk(userId);
        if (!user) {
          console.error(`User not found with ID: ${userId}`);
          return res.status(400).send('Webhook Error: Invalid userId.');
        }
      }

      // Handle cart items for guest users or registered users
      let cartItems;
      if (sessionId) {
        cartItems = await GuestCart.findAll({
          where: { sessionId },
          include: [{ model: Product, as: 'Product' }],
        });
      } else {
        cartItems = await Cart.findAll({
          where: { userId },
          include: [{ model: Product, as: 'product' }],
        });
      }

      if (!cartItems || cartItems.length === 0) {
        console.error('Cart is empty or invalid.');
        return res.status(400).send('Webhook Error: Cart is empty.');
      }

      // Extract and encrypt shipping and billing details
      const shippingAddress = encrypt(JSON.stringify(session.shipping_details?.address || {}));
      const billingAddress = encrypt(JSON.stringify(session.customer_details?.address || {}));

      console.log('Encrypted Shipping Address:', shippingAddress);
      console.log('Encrypted Billing Address:', billingAddress);

      // Create an order in the database
      const order = await Order.create({
        userId: user.id,
        total,
        shippingAddress,
        billingAddress,
        status: 'processing',
      });

      console.log(`Order created with ID: ${order.id}`);

      // Add order items and update inventory
      await Promise.all(
        cartItems.map(async (cartItem) => {
          const product = cartItem.Product || cartItem.product;

          if (!product) {
            console.error(`Product not found for cart item.`);
            return;
          }

          await OrderItem.create({
            orderId: order.id,
            productId: product.id,
            quantity: cartItem.quantity,
            price: product.price,
          });

          // Update product stock
          product.quantity -= cartItem.quantity;
          await product.save();
        })
      );

      console.log(`Order items created for order ID: ${order.id}`);

      // Clear guest cart if applicable
      if (sessionId) {
        await GuestCart.destroy({ where: { sessionId } });
        console.log(`Cleared guest cart for session ID: ${sessionId}`);
      }
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).send('Webhook received successfully');
  } catch (err) {
    console.error('Error in Stripe webhook handler:', err.message, err.stack);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};



// Cancel checkout session (moved outside `handleWebhook`)
const cancelCheckoutSession = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await Cart.findAll({
      where: { userId },
      include: [{ model: Product, as: 'product' }],
    });

    for (const cartItem of cartItems) {
      cartItem.product.stock += cartItem.quantity; // Restore stock
      await cartItem.product.save();
    }

    console.log(`Stock restored for userId: ${userId} after session cancellation.`);
    res.status(200).json({ message: 'Checkout session canceled, stock restored.' });
  } catch (error) {
    console.error('Error canceling checkout session:', error);
    res.status(500).json({ message: 'Failed to cancel checkout session.' });
  }
};

module.exports = { handleWebhook, cancelCheckoutSession };
