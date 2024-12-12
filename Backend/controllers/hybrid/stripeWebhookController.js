const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../../models/order');
const Product = require('../../models/product');
const Cart = require('../../models/cart');
const OrderItem = require('../../models/orderItem'); // Assuming you have an OrderItem model


const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    console.log('Received Stripe event:', event);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const userId = session.metadata.userId;
      const total = session.amount_total ? session.amount_total / 100 : null; // Convert to dollars

      if (!total) {
        console.error('Total amount is missing in the session.');
        return res.status(400).send('Webhook Error: Total amount missing in the session.');
      }

      const cartItems = await Cart.findAll({
        where: { userId },
        include: [{ model: Product, as: 'product' }],
      });

      if (cartItems.length === 0) {
        console.error(`No cart items found for userId: ${userId}`);
        return res.status(400).send('No cart items found for this user.');
      }

      const shippingAddress = session.shipping_details?.address
        ? JSON.stringify(session.shipping_details.address)
        : null;
      const billingAddress = session.customer_details?.address
        ? JSON.stringify(session.customer_details.address)
        : null;

      const order = await Order.create({
        userId,
        total,
        billingAddress,
        shippingAddress,
        status: 'processing',
      });

      console.log(`Order created with ID: ${order.id}`);

      await Promise.all(
        cartItems.map(async (cartItem) => {
          await OrderItem.create({
            orderId: order.id,
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            price: cartItem.product.price,
          });

          cartItem.product.stock -= cartItem.quantity;
          await cartItem.product.save();

          await cartItem.destroy();
        })
      );

      console.log(`Cart items moved to order for userId: ${userId}`);
    }

    res.status(200).send('Webhook received successfully');
  } catch (err) {
    console.error('Error in Stripe webhook:', err);
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
