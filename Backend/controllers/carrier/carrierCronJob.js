const cron = require('node-cron');
const fetch = require('node-fetch');

const updateOrderStatuses = async () => {
    try {
        const activeOrders = await Order.findAll({ where: { status: { [Op.ne]: 'delivered' } } });

        for (const order of activeOrders) {
            const { trackingNumber, carrier } = order;
            let url, headers;

            switch (carrier.toLowerCase()) {
                case 'ups':
                    url = `https://wwwcie.ups.com/api/track/v1/details/${trackingNumber}`;
                    headers = {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${process.env.UPS_SECRET_KEY}`,
                    };
                    break;

                case 'fedex':
                    url = `https://apis.fedex.com/track/v1/trackingnumbers`;
                    headers = {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${process.env.FEDEX_SECRET_KEY}`,
                    };
                    break;

                case 'usps':
                    url = `https://api.usps.com/tracking/v3/tracking/${trackingNumber}`;
                    headers = { 'Content-Type': 'application/json' };
                    break;

                default:
                    console.log(`Unsupported carrier: ${carrier}`);
                    continue;
            }

            const response = await fetch(url, { method: 'GET', headers });
            if (!response.ok) {
                console.error(`Failed to fetch status for ${trackingNumber}`);
                continue;
            }

            const data = await response.json();
            const status = data.status; // Map this to your app's statuses

            // Update the database
            order.status = status;
            await order.save();
        }
    } catch (error) {
        console.error('Error updating order statuses:', error.message);
    }
};

// Schedule the cron job (every hour)
cron.schedule('0 * * * *', updateOrderStatuses);
