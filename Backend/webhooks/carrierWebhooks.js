const { sendEmailNotification } = require('./utils/statusEmail');

app.post('/api/carrier-webhook', async (req, res) => {
  const { tracking_number, status, carrier } = req.body;

  const statusMap = {
    ups: { in_transit: 'Shipped', delivered: 'Delivered' },
    fedex: { in_transit: 'Shipped', delivered: 'Delivered' },
    usps: { in_transit: 'Shipped', delivered: 'Delivered' },
    dhl: { in_transit: 'Shipped', delivered: 'Delivered' }
};


  const newStatus = statusMap[carrier][status] || 'Unknown';

  try {
    const order = await Order.findOne({ where: { trackingNumber: tracking_number } });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await Order.update(
      { status: newStatus },
      { where: { trackingNumber: tracking_number } }
    );

    // Send email notification if the order is delivered
    if (newStatus === 'Delivered') {
      await sendEmailNotification(order.userEmail, tracking_number, newStatus);
    }

    res.status(200).json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
});
this 