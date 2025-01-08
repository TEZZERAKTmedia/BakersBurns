const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../../models/order');
const Product = require('../../models/product');
const User = require('../../models/user'); // Assuming you have a User model
const OrderItem = require('../../models/orderItem'); // Assuming you have an OrderItem model
const { encrypt } = require('../../utils/encrypt');

const handleGuestWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    console.log('Webhook received for guest, event type:', event.type);

    if (event.type === 'checkout.session.completed') {
      console.log('Processing guest checkout.session.completed event...');

      const session = event.data.object;

      // Extract metadata
      const productIds = session.metadata?.productIds;
      const total = session.amount_total / 100; // Convert to dollars
      const email = session.customer_email;

      if (!productIds || !email) {
        console.error('Missing productIds or email in session metadata.');
        return res.status(400).send('Webhook Error: Missing productIds or email.');
      }

      // Extract and encrypt shipping and billing details
      const shippingAddress = encrypt(JSON.stringify(session.shipping_details?.address || {}));
      const billingAddress = encrypt(JSON.stringify(session.customer_details?.address || {}));

      console.log('Encrypted Shipping Address:', shippingAddress);
      console.log('Encrypted Billing Address:', billingAddress);

      // Process the products
      const productIdArray = productIds.split(',').map((id) => parseInt(id.trim(), 10)).filter(Number.isInteger);

      if (productIdArray.length === 0) {
        console.error('Invalid or empty productIds in session metadata.');
        return res.status(400).send('Webhook Error: Invalid productIds.');
      }

      // Check if guest user already exists
      let guestUser = await User.findOne({ where: { email, role: 'guest' } });

      if (!guestUser) {
        // Create a guest user
        guestUser = await User.create({
          email,
          role: 'guest',
          guest: true,
          password: null, // No password for guest accounts
        });

        console.log(`Guest user created with ID: ${guestUser.id}`);
      }

      // Create an order in the database
      const order = await Order.create({
        userId: guestUser.id,
        total,
        shippingAddress,
        billingAddress,
        status: 'processing',
      });

      console.log(`Order created for guest user ID: ${guestUser.id} with Order ID: ${order.id}`);

      // Add order items based on productIds
      await Promise.all(
        productIdArray.map(async (productId) => {
          const product = await Product.findByPk(productId);

          if (!product) {
            console.error(`Product not found with ID: ${productId}`);
            return;
          }

          await OrderItem.create({
            orderId: order.id,
            productId: product.id,
            quantity: 1, // Adjust quantity based on your logic
            price: product.price,
          });

          // Update product stock
          product.stock -= 1; // Adjust based on your logic
          await product.save();
        })
      );

      console.log(`Order items created for guest order ID: ${order.id}`);
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).send('Guest webhook processed successfully');
  } catch (err) {
    console.error('Error in Stripe guest webhook handler:', err.message, err.stack);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

module.exports = { handleGuestWebhook };
