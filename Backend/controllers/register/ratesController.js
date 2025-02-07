const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

// Load environment variables
const UPS_CLIENT_ID = process.env.UPS_CLIENT_ID;
const UPS_CLIENT_SECRET = process.env.UPS_CLIENT_SECRET;
const USPS_USER_ID = process.env.USPS_USER_ID;
const FEDEX_CLIENT_ID = process.env.FEDEX_CLIENT_ID;
const FEDEX_CLIENT_SECRET = process.env.FEDEX_CLIENT_SECRET;

let upsTokenCache = null;
let upsTokenExpiry = null;
let fedexTokenCache = null;
let fedexTokenExpiry = null;

// 🔹 Function to Get Shipping Rates from All Carriers
const getShippingRates = async (req, res) => {
    try {
      console.log("🚀 Incoming Shipping Rate Request");
      console.log("📡 Received Request Body:", req.body);
  
      const { shipperZip, receiverZip, weight, dimensions } = req.body;
  
      // ✅ Check if any required parameter is missing
      if (!shipperZip || !receiverZip || !weight || !dimensions) {
        console.error("❌ Missing Parameters:", { shipperZip, receiverZip, weight, dimensions });
        return res.status(400).json({ error: "Missing required parameters", received: req.body });
      }
  
      // Fetch rates from different carriers
      const upsRate = await getUPSRates(shipperZip, receiverZip, weight, dimensions);
      const uspsRate = await getUSPSRates(shipperZip, receiverZip, weight);
      const fedexRate = await getFedExRates(shipperZip, receiverZip, weight, dimensions);
  
      // ✅ Log the API responses
      console.log("✅ UPS Rate:", upsRate);
      console.log("✅ USPS Rate:", uspsRate);
      console.log("✅ FedEx Rate:", fedexRate);
  
      // ✅ Construct response
      const response = {
        ups: upsRate,
        usps: uspsRate,
        fedex: fedexRate,
        lowestCost: Math.min(upsRate || Infinity, uspsRate || Infinity, fedexRate || Infinity),
      };
  
      console.log("📦 Final Response to Client:", response);
      res.json(response);
    } catch (error) {
      console.error("❌ Error fetching shipping rates:", error);
      res.status(500).json({ error: "Failed to fetch shipping rates" });
    }
  };
  

// 🔹 Function to Get UPS OAuth Token
const getUPSToken = async () => {
  const now = Date.now();
  if (upsTokenCache && upsTokenExpiry && now < upsTokenExpiry) {
    return upsTokenCache; // Return cached token
  }

  try {
    const response = await axios.post(
      "https://onlinetools.ups.com/security/v1/oauth/token",
      new URLSearchParams({ grant_type: "client_credentials" }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        auth: { username: UPS_CLIENT_ID, password: UPS_CLIENT_SECRET },
      }
    );

    upsTokenCache = response.data.access_token;
    upsTokenExpiry = now + 3600000; // Cache for 1 hour
    return upsTokenCache;
  } catch (error) {
    console.error("UPS OAuth Error:", error.response?.data || error.message);
    return null;
  }
};

// 🔹 Function to Get UPS Rates
const getUPSRates = async (shipperZip, receiverZip, weight, dimensions) => {
  try {
    const accessToken = await getUPSToken();
    if (!accessToken) return null;

    const response = await axios.post(
      "https://onlinetools.ups.com/api/rating/v1/Shop",
      {
        RateRequest: {
          Shipment: {
            Shipper: { Address: { PostalCode: shipperZip } },
            ShipTo: { Address: { PostalCode: receiverZip } },
            Package: {
              Dimensions: { Length: dimensions.length, Width: dimensions.width, Height: dimensions.height },
              PackageWeight: { Weight: weight },
            },
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data?.RateResponse?.RatedShipment?.TotalCharges?.MonetaryValue || null;
  } catch (error) {
    console.error("UPS API Error:", error.response?.data || error.message);
    return null;
  }
};

// 🔹 Function to Get USPS Rates
const getUSPSRates = async (shipperZip, receiverZip, weight) => {
  try {
    const response = await axios.get(
      `https://secure.shippingapis.com/ShippingAPI.dll?API=RateV4&XML=
      <RateV4Request USERID="${USPS_USER_ID}">
        <Package ID="1ST">
          <Service>PRIORITY</Service>
          <ZipOrigination>${shipperZip}</ZipOrigination>
          <ZipDestination>${receiverZip}</ZipDestination>
          <Pounds>${Math.floor(weight)}</Pounds>
          <Ounces>${(weight % 1) * 16}</Ounces>
          <Container></Container>
          <Size>REGULAR</Size>
        </Package>
      </RateV4Request>`
    );

    return parseUSPSRate(response.data);
  } catch (error) {
    console.error("USPS API Error:", error.response?.data || error.message);
    return null;
  }
};

// 🔹 Function to Get FedEx OAuth Token
const getFedExToken = async () => {
  const now = Date.now();
  if (fedexTokenCache && fedexTokenExpiry && now < fedexTokenExpiry) {
    return fedexTokenCache; // Return cached token
  }

  try {
    const response = await axios.post(
      "https://apis.fedex.com/oauth/token",
      new URLSearchParams({ grant_type: "client_credentials" }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        auth: { username: FEDEX_CLIENT_ID, password: FEDEX_CLIENT_SECRET },
      }
    );

    fedexTokenCache = response.data.access_token;
    fedexTokenExpiry = now + 3600000; // Cache for 1 hour
    return fedexTokenCache;
  } catch (error) {
    console.error("FedEx OAuth Error:", error.response?.data || error.message);
    return null;
  }
};

// 🔹 Function to Get FedEx Rates
const getFedExRates = async (shipperZip, receiverZip, weight, dimensions) => {
  try {
    const accessToken = await getFedExToken();
    if (!accessToken) return null;

    const response = await axios.post(
      "https://apis.fedex.com/rate/v1/rates/quotes",
      {
        requestedShipment: {
          shipper: { address: { postalCode: shipperZip } },
          recipient: { address: { postalCode: receiverZip } },
          packages: [
            {
              weight: { value: weight, units: "LB" },
              dimensions: { length: dimensions.length, width: dimensions.width, height: dimensions.height, units: "IN" },
            },
          ],
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data?.rateReplyDetails?.ratedShipmentDetails?.totalNetCharge?.amount || null;
  } catch (error) {
    console.error("FedEx API Error:", error.response?.data || error.message);
    return null;
  }
};

// 🔹 Function to Parse USPS Rate Response
const parseUSPSRate = (xmlData) => {
  const match = xmlData.match(/<Rate>(\d+\.\d+)<\/Rate>/);
  return match ? parseFloat(match[1]) : null;
};

// Export functions for modular use
module.exports = {
  getShippingRates,
  getUPSRates,
  getUSPSRates,
  getFedExRates,
};
