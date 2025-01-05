const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../../models/order');
const Product = require('../../models/product');
const Cart = require('../../models/cart');
const OrderItem = require('../../models/orderItem'); // Assuming you have an OrderItem model
const {encrypt} = require('../../utils/encrypt');


const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    console.log('Webhook received, event type:', event.type);

    if (event.type === 'checkout.session.completed') {
      console.log('Processing checkout.session.completed event...');

      const session = event.data.object;

      // Extract metadata
      const userId = session.metadata?.userId;
      const productIds = session.metadata?.productIds;
      const total = session.amount_total / 100; // Convert to dollars

      if (!userId || !productIds) {
        console.error('Missing userId or productIds in session metadata.');
        return res.status(400).send('Webhook Error: Missing userId or productIds.');
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

      // Create an order in the database
      const order = await Order.create({
        userId,
        total,
        shippingAddress,
        billingAddress,
        status: 'processing',
      });

      console.log(`Order created with ID: ${order.id}`);

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

      console.log(`Order items created for order ID: ${order.id}`);
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
