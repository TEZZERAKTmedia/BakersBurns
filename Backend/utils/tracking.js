// utils/tracking.js

const carrierTrackingUrls = {
    'UPS': 'https://www.ups.com/track?tracknum=',
    'FedEx': 'https://www.fedex.com/fedextrack/?trknbr=',
    'USPS': 'https://tools.usps.com/go/TrackConfirmAction_input?qtc_tLabels1=',
    'DHL': 'https://www.dhl.com/en/express/tracking.html?AWB=',
    // Add other carriers as needed
};

const generateTrackingLink = (carrier, trackingNumber) => {
    const baseUrl = carrierTrackingUrls[carrier];
    if (baseUrl) {
        return `${baseUrl}${trackingNumber}`;
    } else {
        throw new Error('Unknown carrier');
    }
};

module.exports = { generateTrackingLink };
