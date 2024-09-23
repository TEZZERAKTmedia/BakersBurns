const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../../models/order');

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

      // Update the order status to 'Processing'
      try {
        const order = await Order.findByPk(orderId);
        if (order) {
          order.status = 'Processing';
          await order.save();
          console.log(`Order ${orderId} updated to Processing for user ${userId}`);
        }
      } catch (error) {
        console.error('Error updating order to Processing:', error);
        return res.status(500).json({ message: 'Error updating order to Processing', error });
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const { orderId, userId } = paymentIntent.metadata;

      // Update the order status to 'Failed'
      try {
        const order = await Order.findByPk(orderId);
        if (order) {
          order.status = 'Failed';
          await order.save();
          console.log(`Order ${orderId} updated to Failed for user ${userId}`);
        }
      } catch (error) {
        console.error('Error updating order to Failed:', error);
        return res.status(500).json({ message: 'Error updating order to Failed', error });
      }
      break;
    }
    // Handle other Stripe events as needed
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
};

module.exports = { handleWebhook };
