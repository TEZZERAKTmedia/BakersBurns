const fetch = require('node-fetch');

const subscribeToUPS = async (trackingNumber, webhookUrl) => {
    const url = 'https://wwwcie.ups.com/api/track/v1/subscription/standard/package';
    const payload = {
        locale: 'en_US',
        countryCode: 'US',
        trackingNumberList: [trackingNumber],
        destination: {
            url: webhookUrl,
            credentialType: 'Bearer',
            credential: process.env.UPS_SECRET_KEY,
        },
    };

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.UPS_ACCESS_TOKEN}`, // Use UPS OAuth token
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error(`[UPS Error]: ${error}`);
            throw new Error('UPS Subscription failed');
        }

        const responseData = await response.json();
        console.log('[UPS Success]:', responseData);
        return responseData;
    } catch (error) {
        console.error('Error in UPS subscription:', error.message);
        throw error;
    }
};

module.exports = { subscribeToUPS };
