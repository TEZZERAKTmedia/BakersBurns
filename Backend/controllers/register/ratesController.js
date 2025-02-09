const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

// Load environment variables
const UPS_CLIENT_ID = process.env.UPS_CLIENT_ID;
const UPS_CLIENT_SECRET = process.env.UPS_CLIENT_SECRET;
const FEDEX_CLIENT_ID = process.env.FEDEX_CLIENT_ID;
const FEDEX_CLIENT_SECRET = process.env.FEDEX_CLIENT_SECRET;

// UPS OAuth Token Cache
let upsTokenCache = null;
let upsTokenExpiry = null;

// USPS OAuth Token Cache
let uspsTokenCache = null;
let uspsTokenExpiry = null;

// FedEx OAuth Token Cache
let fedexTokenCache = null;
let fedexTokenExpiry = null;

// 🔹 Function to Get Shipping Rates from All Carriers
const getShippingRates = async (req, res) => {
  try {
    console.log("🚀 Incoming Shipping Rate Request");
    console.log("📡 Received Request Body:", req.body);

    const { shipperZip, receiverZip, weight, dimensions } = req.body;

    if (!shipperZip || !receiverZip || !weight || !dimensions) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const upsRate = await getUPSRates(shipperZip, receiverZip, weight, dimensions);
    const uspsRate = await getUSPSRates(shipperZip, receiverZip, weight, dimensions);
    const fedexRate = await getFedExRates(shipperZip, receiverZip, weight, dimensions);

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

// 🔹 Express Route Handler for UPS Rates
const getUPSRatesHandler = async (req, res) => {
  try {
    const { shipperZip, receiverZip, weight, dimensions } = req.body;
    if (!shipperZip || !receiverZip || !weight || !dimensions) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const upsRate = await getUPSRates(shipperZip, receiverZip, weight, dimensions);
    res.json({ ups: upsRate });
  } catch (error) {
    console.error("❌ Error fetching UPS rates:", error);
    res.status(500).json({ error: "Failed to fetch UPS rates" });
  }
};

// 🔹 Express Route Handler for USPS Rates
const getUSPSRatesHandler = async (req, res) => {
  try {
    const { shipperZip, receiverZip, weight, dimensions } = req.body;
    if (!shipperZip || !receiverZip || !weight || !dimensions) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const uspsRate = await getUSPSRates(shipperZip, receiverZip, weight, dimensions);
    res.json({ usps: uspsRate });
  } catch (error) {
    console.error("❌ Error fetching USPS rates:", error);
    res.status(500).json({ error: "Failed to fetch USPS rates" });
  }
};

// 🔹 Express Route Handler for FedEx Rates
const getFedExRatesHandler = async (req, res) => {
  try {
    const { shipperZip, receiverZip, weight, dimensions } = req.body;
    if (!shipperZip || !receiverZip || !weight || !dimensions) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const fedexRate = await getFedExRates(shipperZip, receiverZip, weight, dimensions);
    res.json({ fedex: fedexRate });
  } catch (error) {
    console.error("❌ Error fetching FedEx rates:", error);
    res.status(500).json({ error: "Failed to fetch FedEx rates" });
  }
};

// 🔹 Function to Get UPS Rates
const getUPSRates = async (shipperZip, receiverZip, weight, dimensions) => {
  try {
    const accessToken = await getUPSToken();
    if (!accessToken) return null;

    const upsRequestPayload = {
      RateRequest: {
        Request: { RequestOption: "Rate" },
        Shipment: {
          Shipper: { Address: { PostalCode: shipperZip, CountryCode: "US" } },
          ShipTo: { Address: { PostalCode: receiverZip, CountryCode: "US" } },
          ShipFrom: { Address: { PostalCode: shipperZip, CountryCode: "US" } },
          Service: { Code: "03" },
          Package: [
            {
              PackagingType: { Code: "02" },
              Dimensions: {
                UnitOfMeasurement: { Code: "IN" },
                Length: String(dimensions.length),
                Width: String(dimensions.width),
                Height: String(dimensions.height),
              },
              PackageWeight: { UnitOfMeasurement: { Code: "LBS" }, Weight: String(weight) },
            },
          ],
        },
      },
    };

    const response = await axios.post(
      "https://onlinetools.ups.com/api/rating/v2409/Rate",
      upsRequestPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data?.RateResponse?.RatedShipment?.map((service) => ({
      serviceName: service.Service.Code === "03" ? "UPS Ground" : "Other",
      cost: service.TotalCharges?.MonetaryValue || null,
    })) || [];
  } catch (error) {
    console.error("❌ UPS API Error:", error.response?.data || error.message);
    return null;
  }
};

// Export functions for modular use
module.exports = {
  getShippingRates,
  getUPSRatesHandler,
  getUSPSRatesHandler,
  getFedExRatesHandler,
};
