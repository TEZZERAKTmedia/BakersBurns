// Import the Order model
const Order = require('../models/order');

// UPS Webhook Handler
const handleUpsWebhook = async (req, res) => {
  try {
    const { tracking_number, status, status_description } = req.body; // Adjust based on UPS webhook payload structure

    // Find and update the order based on the tracking number
    const order = await Order.findOne({ where: { trackingNumber: tracking_number } });
    if (order) {
      await order.update({ status, status_description }); // Update status as per your schema
      res.status(200).send('Order updated from UPS webhook');
    } else {
      res.status(404).send('Order not found');
    }
  } catch (error) {
    console.error('Error in UPS webhook:', error);
    res.status(500).send('Internal Server Error');
  }
};

// FedEx Webhook Handler
const handleFedexWebhook = async (req, res) => {
  try {
    const { tracking_number, current_status } = req.body; // Adjust based on FedEx webhook payload structure

    const order = await Order.findOne({ where: { trackingNumber: tracking_number } });
    if (order) {
      await order.update({ status: current_status.description }); // Update based on FedEx status
      res.status(200).send('Order updated from FedEx webhook');
    } else {
      res.status(404).send('Order not found');
    }
  } catch (error) {
    console.error('Error in FedEx webhook:', error);
    res.status(500).send('Internal Server Error');
  }
};

// USPS Webhook Handler
const handleUspsWebhook = async (req, res) => {
  try {
    const { tracking_number, status } = req.body; // Adjust based on USPS webhook payload structure

    const order = await Order.findOne({ where: { trackingNumber: tracking_number } });
    if (order) {
      await order.update({ status }); // Update based on USPS status
      res.status(200).send('Order updated from USPS webhook');
    } else {
      res.status(404).send('Order not found');
    }
  } catch (error) {
    console.error('Error in USPS webhook:', error);
    res.status(500).send('Internal Server Error');
  }
};

// DHL Webhook Handler
const handleDhlWebhook = async (req, res) => {
  try {
    const { trackingNumber, eventStatus } = req.body; // Adjust based on DHL webhook payload structure

    const order = await Order.findOne({ where: { trackingNumber } });
    if (order) {
      await order.update({ status: eventStatus }); // Update based on DHL event status
      res.status(200).send('Order updated from DHL webhook');
    } else {
      res.status(404).send('Order not found');
    }
  } catch (error) {
    console.error('Error in DHL webhook:', error);
    res.status(500).send('Internal Server Error');
  }
};


module.exports = {
  handleDhlWebhook,
  handleFedexWebhook,
  handleUpsWebhook,
  handleUspsWebhook
}