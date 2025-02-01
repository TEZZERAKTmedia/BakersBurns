const axios = require("axios");
require("dotenv").config(); // Load environment variables

const UPS_TRACKING_API_URL = "https://onlinetools.ups.com/api/track/v2/details";
const UPS_AUTH_URL = "https://onlinetools.ups.com/security/v1/oauth/token";

/**
 * ✅ Fetch UPS OAuth token (required for API authentication)
 */
async function getUpsAuthToken() {
    try {
      const encodedAuth = Buffer.from(
        `${process.env.UPS_CLIENT_ID}:${process.env.UPS_CLIENT_SECRET}`
      ).toString("base64");
  
      console.log("🔐 Encoded Auth Header (masked):", encodedAuth.substring(0, 10) + "...[hidden]");
  
      const response = await axios.post(
        "https://onlinetools.ups.com/security/v1/oauth/token",
        "grant_type=client_credentials",
        {
          headers: {
            Authorization: `Basic ${encodedAuth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
  
      const { access_token, expires_in } = response.data;
      const expirationTime = new Date(Date.now() + expires_in * 1000).toISOString();
  
      console.log(`✅ UPS Auth Token Retrieved: ${access_token}`);
      console.log(`⏳ Token Expires At: ${expirationTime}`);
  
      return access_token;
    } catch (error) {
      console.error(`🔴 UPS Auth Token Error:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: JSON.stringify(error.response?.data, null, 2),
        headers: error.response?.headers,
      });
      throw new Error("Failed to fetch UPS authentication token.");
    }
  }
  
/**
 * ✅ Fetch UPS Bulk Tracking Data (Receives trackingNumbers from Cron Job)
 */
async function fetchUpsTracking(trackingNumbers, accessToken) {
    try {
      console.log("🚀 Sending Tracking Request to UPS...");
      console.log("Tracking Numbers:", trackingNumbers);
  
      let response;
  
      if (trackingNumbers.length === 1) {
        // ✅ Handle Single Tracking Number (GET request)
        const trackingNumber = trackingNumbers[0];
        console.log(`🔹 Using Single Tracking API for ${trackingNumber}`);
  
        response = await axios.get(
          `https://onlinetools.ups.com/api/track/v1/details/${trackingNumber}`, // ✅ Single Tracking API
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              transId: Math.floor(Math.random() * 1000000).toString(), // ✅ Required
              transactionSrc: "testing", // ✅ Required
            },
          }
        );
      } else {
        // ✅ Handle Bulk Tracking (POST request)
        console.log("🔹 Using Bulk Tracking API for Multiple Tracking Numbers");
  
        response = await axios.post(
          "https://onlinetools.ups.com/api/track/v2/details", // ✅ Bulk Tracking API
          {
            trackingInquiryNumber: trackingNumbers.map(num => ({ trackingNumber: num })), // ✅ Correct format
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              transId: Math.floor(Math.random() * 1000000).toString(), // ✅ Required
              transactionSrc: "testing", // ✅ Required
            },
          }
        );
      }
  
      console.log(`✅ UPS Tracking Data:`, JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error(`🔴 UPS Tracking API Error:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: JSON.stringify(error.response?.data, null, 2),
        headers: error.response?.headers,
      });
      throw new Error("Failed to fetch UPS tracking data.");
    }
  }
  

module.exports = { getUpsAuthToken, fetchUpsTracking };
