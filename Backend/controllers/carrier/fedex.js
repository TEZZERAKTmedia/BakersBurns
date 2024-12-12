const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

const subscribeToFedEx = async (trackingNumber, webhookUrl) => {
    const url = 'https://apis.fedex.com/track/v1/notifications';
    const payload = {
        senderContactName: "Your Company Name",
        senderEMailAddress: "your-email@yourdomain.com",
        trackingEventNotificationDetail: {
            trackingNotifications: [
                {
                    trackingNumberInfo: {
                        trackingNumber,
                        carrierCode: "FDXE",
                    },
                    notificationEvents: ["ON_DELIVERY", "ON_EXCEPTION", "ON_TENDER"],
                },
            ],
            personalMessage: "Your package tracking updates from FedEx",
        },
    };

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FEDEX_SECRET_KEY}`,
        'x-locale': 'en_US',
        'x-customer-transaction-id': uuidv4(),
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error(`[FedEx Error]: ${error}`);
            throw new Error('FedEx Subscription failed');
        }

        const responseData = await response.json();
        console.log('[FedEx Success]:', responseData);
        return responseData;
    } catch (error) {
        console.error('Error in FedEx subscription:', error.message);
        throw error;
    }
};

module.exports = { subscribeToFedEx };
