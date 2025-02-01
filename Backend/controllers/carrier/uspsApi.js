const axios = require("axios");
require("dotenv").config();

const USPS_TRACKING_API_URL = `${process.env.USPS_BASE_URL}/tracking/v1/details`;
const USPS_AUTH_URL = `${process.env.USPS_BASE_URL}/oauth/token`;

/**
 * ✅ Fetch USPS OAuth Token (Required for API authentication)
 */
async function getUspsAuthToken() {
  try {
    const encodedAuth = Buffer.from(
      `${process.env.USPS_CLIENT_ID}:${process.env.USPS_CLIENT_SECRET}`
    ).toString("base64");

    console.log("🔐 Encoded Auth Header (masked):", encodedAuth.substring(0, 10) + "...[hidden]");

    const response = await axios.post(
      USPS_AUTH_URL,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${encodedAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("✅ USPS Auth Token Retrieved:", response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error("🔴 USPS Auth Token Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    throw new Error("Failed to fetch USPS authentication token.");
  }
}

/**
 * ✅ Fetch USPS Tracking Information (Bulk Request Supported)
 */
async function fetchUspsTracking(trackingNumbers, accessToken) {
  try {
    console.log("🚀 Sending Bulk Tracking Request to USPS...");
    console.log("Tracking Numbers:", trackingNumbers);

    const response = await axios.post(
      USPS_TRACKING_API_URL,
      {
        trackIds: trackingNumbers, // USPS expects an array of tracking numbers
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          transId: Math.floor(Math.random() * 1000000).toString(),
          transactionSrc: "tracking-cronjob",
        },
      }
    );

    console.log("✅ USPS Tracking Data:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("🔴 USPS Bulk Tracking API Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    throw new Error("Failed to fetch USPS bulk tracking data.");
  }
}

module.exports = { getUspsAuthToken, fetchUspsTracking };
