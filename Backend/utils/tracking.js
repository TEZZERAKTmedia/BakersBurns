// utils/trackingUtils.js

// Function to generate the tracking link based on carrier and tracking number
const generateTrackingLink = (carrier, trackingNumber) => {
    let baseUrl;
    
    switch (carrier.toLowerCase()) {
        case 'ups':
            baseUrl = `https://wwwapps.ups.com/WebTracking/track?track=yes&trackNums=${trackingNumber}`;
            break;
        case 'fedex':
            baseUrl = `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
            break;
        case 'usps':
            baseUrl = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
            break;
        case 'dhl':
            baseUrl = `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}&brand=DHL`;
            break;
        default:
            throw new Error('Unsupported carrier');
    }

    return baseUrl;
};

module.exports = { generateTrackingLink };
