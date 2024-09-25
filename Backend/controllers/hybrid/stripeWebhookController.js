const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../../models/order');
const Product = require('../../models/product');
const Cart = require('../../models/cart');

// Handle Stripe Webhooks
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET); 
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const { orderId, userId } = paymentIntent.metadata;

      try {
        // 1. Update the order status to 'Processing'
        const order = await Order.findByPk(orderId);
        if (order) {
          order.status = 'Processing';
          await order.save();
          console.log(`Order ${orderId} updated to Processing for user ${userId}`);
        }

        // 2. Mark product as unavailable
        const cartItems = await Cart.findAll({ where: { userId } });
        for (let item of cartItems) {
          const product = await Product.findByPk(item.productId);
          if (product && product.isAvailable) {
            product.isAvailable = 0; // Mark the product as unavailable
            await product.save();
            console.log(`Product ${product.id} marked as unavailable`);
          }
        }

        // 3. Remove cart items for the purchased products
        await Cart.destroy({ where: { userId } });
        console.log(`Cart items for user ${userId} have been removed`);

      } catch (error) {
        console.error('Error processing order and updating product/cart:', error);
        return res.status(500).json({ message: 'Error processing order', error });
      }
      break;
    }
    // Handle other Stripe events if necessary
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
};

module.exports = { handleWebhook };
