const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../../models/order');
const Product = require('../../models/product');
const Cart = require('../../models/cart');
const OrderItem = require('../../models/orderItem');
const Thread = require('../../models/threads');
const Message = require('../../models/messages');
const User = require('../../models/user'); // Import User model

const GuestCart = require('../../models/guestCart'); // Import GuestCart model
const { encrypt } = require('../../utils/encrypt');
const { sendOrderEmail } = require('../../utils/orderEmail');
const {unlockInventory} = require('../register/cartController');
const { v4: uuidv4 } = require('uuid');

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
      const customerEmail = session.customer_details?.email;
      const total = session.amount_total / 100;

      if (!customerEmail) {
        console.error('Missing email from Stripe session.');
        return res.status(400).send('Webhook Error: Missing email.');
      }

      console.log(`Email for checkout: ${customerEmail}`);

      // Check if the user exists by email
      let user = await User.findOne({ where: { email: customerEmail } });

      const isNewGuest = !user;
      if (isNewGuest) {
        // Create a guest user account if no user exists
        user = await User.create({
          email: customerEmail,
          username: customerEmail,
          isGuest: true,
          hasAcceptedPrivacyPolicy: true,
          privacyPolicyAcceptedAt: new Date(),
          hasAcceptedTermsOfService: true,
          termsAcceptedAt: new Date(),
          role: 'user',
        });
        console.log(`Guest user created with email: ${customerEmail}`);

        // Create a thread and an initial message for the new user
        const threadId = uuidv4();
        const thread = await Thread.create({
          threadId,
          senderEmail: customerEmail,
          receiverEmail: null,
          adminId: null,
        });
        console.log(`Thread created with ID: ${thread.threadId}`);

        await Message.create({
          threadId: thread.threadId,
          senderUsername: null,
          receiverUsername: user.username,
          messageBody: 'Welcome to BakersBurns! If you have any questions, feel free to ask.',
          createdAt: new Date(),
        });
        console.log(`Initial message created for thread: ${thread.threadId}`);
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
          where: { userId: user.id },
          include: [{ model: Product, as: 'product' }],
        });
      }

      if (!cartItems || cartItems.length === 0) {
        console.error('Cart is empty or invalid.');
        return res.status(400).send('Webhook Error: Cart is empty.');
      }

      const shippingAddress = encrypt(JSON.stringify(session.shipping_details?.address || {}));
      const billingAddress = encrypt(JSON.stringify(session.customer_details?.address || {}));

      console.log('Encrypted Shipping Address:', shippingAddress);
      console.log('Encrypted Billing Address:', billingAddress);

      // Create an order
      const order = await Order.create({
        userId: user.id,
        total,
        shippingAddress,
        billingAddress,
        status: 'processing',
      });

      console.log(`Order created with ID: ${order.id}`);

      // Add order items
      await Promise.all(
        cartItems.map(async (cartItem) => {
          const product = cartItem.Product || cartItem.product;

          if (!product) {
            console.error('Product not found for cart item.');
            return;
          }

          await OrderItem.create({
            orderId: order.id,
            productId: product.id,
            quantity: cartItem.quantity,
            price: product.price,
          });
        })
      );

      console.log(`Order items created for order ID: ${order.id}`);

      // Clear guest cart if applicable
      if (sessionId) {
        await GuestCart.destroy({ where: { sessionId } });
        console.log(`Cleared guest cart for session ID: ${sessionId}`);
      }

      // Send email notification to the user
      const orderItems = cartItems.map(cartItem => ({
        name: cartItem.Product?.name || cartItem.product?.name,
        quantity: cartItem.quantity,
        price: cartItem.Product?.price || cartItem.product?.price,
      }));

      // Send user email based on guest or existing user
      await sendOrderEmail(
        isNewGuest ? 'newGuest' : 'existingUser',
        customerEmail,
        {
          total,
          orderItems,
          orderUrl: `${process.env.ORDER_URL}/${order.id}`,
        }
      );

      console.log(`User email sent to ${customerEmail}.`);

      // Send admin notification email
      const admins = await User.findAll({ where: { role: 'admin' } });
      const adminEmails = admins.map(admin => admin.email).filter(email => email);

      if (adminEmails.length > 0) {
        await sendOrderEmail('adminNotification', adminEmails.join(','), {
          total,
          orderItems,
          status: 'processing',
        });
        console.log('Admin notification email sent.');
      } else {
        console.warn('No admin emails found to send admin notification.');
      }

      console.log('Webhook processing completed.');
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
