const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../../models/order');
const Product = require('../../models/product');
const Cart = require('../../models/cart');

// Handle Stripe Webhooks
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    // Log the entire event object for debugging
    console.log('Received Stripe event:', event);

    // Handle the checkout session completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata.userId;

      console.log('Checkout session completed for user:', userId);
      
      // Fetch cart items for the user and move them to an order
      const cartItems = await Cart.findAll({ where: { userId } });

      // Create a new order
      const order = await Order.create({
        userId,
        status: 'completed',
        totalAmount: session.amount_total / 100,  // Convert from cents to dollars
        paymentStatus: 'paid',
      });

      // Move cart items to the order and update product inventory
      await Promise.all(cartItems.map(async (cartItem) => {
        const product = await Product.findByPk(cartItem.productId);
        await order.addProduct(product, { through: { quantity: cartItem.quantity } });

        // Reduce product inventory (if applicable)
        product.stock -= cartItem.quantity;
        await product.save();

        // Remove cart items after they are added to the order
        await cartItem.destroy();
      }));

      console.log('Order created and cart items moved for user:', userId);
    }

    // Handle payment intent success
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const userId = paymentIntent.metadata.userId;

      console.log('Payment intent succeeded for user:', userId);

      // You could update the order or finalize other logic here
      await Order.update(
        { paymentStatus: 'paid' },
        { where: { userId, status: 'pending' } }  // Update relevant orders for the user
      );
    }

    // Handle charge success
    if (event.type === 'charge.succeeded') {
      const charge = event.data.object;
      const userId = charge.metadata.userId;

      console.log('Charge succeeded for user:', userId);

      // Mark the order as fully paid and trigger shipment if needed
      await Order.update(
        { paymentStatus: 'paid', status: 'ready_to_ship' },
        { where: { userId, paymentStatus: 'pending' } }
      );
    }

    // Handle charge failure (optional)
    if (event.type === 'charge.failed') {
      const charge = event.data.object;
      const userId = charge.metadata.userId;

      console.log('Charge failed for user:', userId);

      // Update the order status to failed
      await Order.update(
        { paymentStatus: 'failed', status: 'payment_failed' },
        { where: { userId, paymentStatus: 'pending' } }
      );

      // Notify the customer (optional)
      console.log(`Payment failed for user ${userId}, notification sent.`);
    }

    res.status(200).send('Webhook received');
  } catch (err) {
    console.error('Error in Stripe webhook:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

module.exports = { handleWebhook };
