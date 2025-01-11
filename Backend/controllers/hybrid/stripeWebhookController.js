const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../../models/order');
const Product = require('../../models/product');
const Cart = require('../../models/cart');
const OrderItem = require('../../models/orderItem');
const User = require('../../models/user'); // Import User model
const GuestCart = require('../../models/guestCart'); // Import GuestCart model
const { encrypt } = require('../../utils/encrypt');
const { sendOrderEmail } = require('../../utils/orderEmail');
const {unlockInventory} = require('../register/cartController');

const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    console.log('Webhook received, event type:', event.type);

    if (event.type === 'checkout.session.completed') {
      console.log('Processing checkout.session.completed event...');

      const session = event.data.object;

      // Extract metadata and session details
      const sessionId = session.metadata?.sessionId; // For guest users
      const customerEmail = session.customer_details?.email; // Stripe-provided email
      const total = session.amount_total / 100; // Convert to dollars

      if (!customerEmail) {
        console.error('Missing email from Stripe session.');
        return res.status(400).send('Webhook Error: Missing email.');
      }

      console.log(`Email for checkout: ${customerEmail}`);

      // Check if user exists by email
      let user = await User.findOne({ where: { email: customerEmail } });

      const isNewGuest = !user;
      if (isNewGuest) {
        // Create a guest user account if no user exists
        user = await User.create({
          email: customerEmail,
          username: `guest_${Date.now()}`,
          isGuest: true, // Mark as guest user
          hasAcceptedPrivacyPolicy: true, // Assume they accepted during checkout
          privacyPolicyAcceptedAt: new Date(),
          hasAcceptedTermsOfService: true,
          termsAcceptedAt: new Date(),
        });
        console.log(`Guest user created with email: ${customerEmail}`);
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

      // Send email notifications
      const orderItems = cartItems.map(cartItem => ({
        name: cartItem.Product?.name || cartItem.product?.name,
        quantity: cartItem.quantity,
        price: cartItem.Product?.price || cartItem.product?.price,
      }));

      // Send user email
      await sendOrderEmail(isNewGuest ? 'newGuest' : 'existingUser', customerEmail, {
        total,
        orderItems,
        orderUrl: `${process.env.ORDER_URL}/${order.id}`,
      });

      // Send admin notification email
      const admins = await User.findAll({ where: { role: 'admin' } });
      const adminEmails = admins.map(admin => admin.email).filter(email => email);

      if (adminEmails.length > 0) {
        await sendOrderEmail('adminNotification', adminEmails.join(','), {
          total,
          orderItems,
          status: 'processing',
        });
      } else {
        console.warn('No admin emails found to send admin notification.');
      }
    } else if (event.type === 'checkout.session.expired') {
      console.log('Processing checkout.session.expired event...');
    
      const session = event.data.object;
      const sessionId = session.metadata?.sessionId;
    
      if (sessionId) {
        // Fetch cart items for the expired session
        const guestCartItems = await GuestCart.findAll({
          where: { sessionId },
          include: [{ model: Product, as: 'Product' }],
        });
    
        if (guestCartItems && guestCartItems.length > 0) {
          // Use the unlockInventory function to restore quantities
          await unlockInventory(guestCartItems);
          console.log(`Inventory unlocked for session ID: ${sessionId}`);
        } else {
          console.warn(`No cart items found for expired session ID: ${sessionId}`);
        }
    
        // Clear guest cart for the expired session
        await GuestCart.destroy({ where: { sessionId } });
        console.log(`Cleared guest cart for expired session ID: ${sessionId}`);
      }
    
      // Additional logic (if needed)
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
