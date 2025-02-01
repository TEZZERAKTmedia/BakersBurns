const axios = require("axios");


const UPS_TRACKING_API_URL = "https://onlinetools.ups.com/api/track/v1/details";
const UPS_AUTH_URL = "https://onlinetools.ups.com/security/v1/oauth/token";

/**
 * Fetch UPS OAuth token (required for API authentication)
 */
async function getUpsAuthToken() {
  try {
    const response = await axios.post(
      UPS_AUTH_URL,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.UPS_CLIENT_ID}:${process.env.UPS_CLIENT_SECRET}`
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error(
      "Error getting UPS OAuth token:",
      error.response?.data || error.message
    );
    throw new Error("Failed to retrieve UPS API token.");
  }
}

/**
 * Fetch UPS Tracking Information (Polling Fallback)
 * @param {string} trackingNumber
 */
async function fetchUpsTracking(trackingNumber) {
  try {
    const accessToken = await getUpsAuthToken();

    const response = await axios.get(`${UPS_TRACKING_API_URL}/${trackingNumber}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`UPS Tracking Data for ${trackingNumber}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching UPS tracking for ${trackingNumber}:`,
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch UPS tracking data.");
  }
}

/**
 * Poll UPS for tracking updates (use if webhooks are not supported)
 */
async function pollUpsTracking(trackingNumber, orderId) {
  try {
    const trackingData = await fetchUpsTracking(trackingNumber);

    const latestStatus = trackingData?.trackResponse?.shipment[0]?.package[0]?.activity[0]?.status?.description || "Unknown";
    console.log(`Latest Status for ${trackingNumber}: ${latestStatus}`);

    // Here, update your database or trigger a webhook event if needed
    // Example: await updateOrderStatus(orderId, latestStatus);

    return latestStatus;
  } catch (error) {
    console.error(`Error polling UPS tracking for ${trackingNumber}:`, error.message);
  }
}

module.exports = { fetchUpsTracking, pollUpsTracking };
