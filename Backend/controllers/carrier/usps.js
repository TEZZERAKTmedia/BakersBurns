const fetch = require('node-fetch');
const { Order } = require('../../models/order'); // Import your Order model

// Function to create a tracking subscription
const addTrackingNumberController = async (req, res) => {
  try {
    const { trackingNumber, secret, listenerURL, orderId } = req.body;

    if (!trackingNumber || !secret || !listenerURL || !orderId) {
      return res.status(400).json({
        message: 'Missing required fields: trackingNumber, secret, listenerURL, orderId',
      });
    }

    const uspsSubscriptionUrl = 'https://api.usps.com/v1/subscriptions';
    const subscriptionPayload = {
      listenerURL,
      secret,
      adminNotification: [{ email: 'admin@example.com' }],
      filterProperties: {
        trackingNumber,
        trackingEventTypes: ['DELIVERED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'],
      },
    };

    const response = await fetch(uspsSubscriptionUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer YOUR_USPS_API_KEY`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionPayload),
    });

    const responseData = await response.json();

    if (response.status === 201) {
      const order = await Order.findOne({ where: { id: orderId } });
      if (order) {
        await order.update({
          status: 'IN_TRANSIT',
          trackingNumber,
        });
      } else {
        return res.status(404).json({ message: 'Order not found' });
      }

      return res.status(201).json({
        message: 'Tracking subscription created successfully',
        subscriptionId: responseData.subscriptionId,
      });
    } else {
      return res.status(response.status).json({
        message: 'Failed to create subscription',
        error: responseData,
      });
    }
  } catch (error) {
    console.error('Error creating USPS subscription:', error.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Webhook handler for USPS tracking updates
const uspsWebhookHandler = async (req, res) => {
  try {
    const { trackingNumber, status, eventTime } = req.body;

    // Validate the webhook payload
    if (!trackingNumber || !status) {
      return res.status(400).json({ message: 'Invalid webhook payload' });
    }

    // Find the order by tracking number
    const order = await Order.findOne({ where: { trackingNumber } });
    if (order) {
      // Update the order's status and optionally log the event time
      await order.update({
        status: status.toUpperCase(), // Ensure the status matches your database values
        lastUpdate: eventTime || new Date(), // Optional: log the event time
      });
      return res.status(200).json({ message: 'Order status updated successfully' });
    } else {
      return res.status(404).json({ message: 'Order not found for tracking number' });
    }
  } catch (error) {
    console.error('Error handling USPS webhook:', error.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = {
  addTrackingNumberController,
  uspsWebhookHandler,
};
