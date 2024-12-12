const Order = require('../../models/order');

// UPS Webhook Handler
const handleUPSWebhook = async (req, res) => {
    try {
        const { trackingNumber, activityStatus } = req.body;

        // Find the order associated with the tracking number
        const order = await Order.findOne({ where: { trackingNumber } });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update the order's status based on activityStatus
        let status;
        switch (activityStatus.type) {
            case 'D': // Delivered
                status = 'Delivered';
                break;
            case 'I': // In Transit
                status = 'In Transit';
                break;
            case 'X': // Exception
                status = 'Exception';
                break;
            default:
                status = 'Unknown';
        }

        await order.update({ status });
        res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        console.error('Error handling UPS webhook:', error.message);
        res.status(500).json({ message: 'Error processing UPS webhook', error: error.message });
    }
};

// FedEx Webhook Handler
const handleFedExWebhook = async (req, res) => {
    try {
        const { trackingNumber, eventStatus } = req.body;

        // Find the order associated with the tracking number
        const order = await Order.findOne({ where: { trackingNumber } });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update the order's status based on eventStatus
        let status;
        switch (eventStatus) {
            case 'DELIVERED':
                status = 'Delivered';
                break;
            case 'IN_TRANSIT':
                status = 'In Transit';
                break;
            case 'EXCEPTION':
                status = 'Exception';
                break;
            default:
                status = 'Unknown';
        }

        await order.update({ status });
        res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        console.error('Error handling FedEx webhook:', error.message);
        res.status(500).json({ message: 'Error processing FedEx webhook', error: error.message });
    }
};

// USPS Webhook Handler
const handleUSPSWebhook = async (req, res) => {
    try {
        const { trackingNumber, statusDescription } = req.body;

        // Find the order associated with the tracking number
        const order = await Order.findOne({ where: { trackingNumber } });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update the order's status based on statusDescription
        let status;
        if (statusDescription.includes('Delivered')) {
            status = 'Delivered';
        } else if (statusDescription.includes('In Transit')) {
            status = 'In Transit';
        } else if (statusDescription.includes('Exception')) {
            status = 'Exception';
        } else {
            status = 'Unknown';
        }

        await order.update({ status });
        res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        console.error('Error handling USPS webhook:', error.message);
        res.status(500).json({ message: 'Error processing USPS webhook', error: error.message });
    }
};

module.exports = {
    handleUPSWebhook,
    handleFedExWebhook,
    handleUSPSWebhook,
};
