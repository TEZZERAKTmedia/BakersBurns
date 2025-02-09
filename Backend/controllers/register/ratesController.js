const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

// Load environment variables
const UPS_CLIENT_ID = process.env.UPS_CLIENT_ID;
const UPS_CLIENT_SECRET = process.env.UPS_CLIENT_SECRET;
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
      const uspsRate = await getUSPSRates(shipperZip, receiverZip, weight, dimensions);
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
      if (!accessToken) {
        console.error("❌ UPS Token Error: Unable to get UPS OAuth token");
        return null;
      }
  
      const upsRequestPayload = {
        RateRequest: {
          Request: {
            RequestOption: "Rate",  // Use "Shop" for all services
          },
          Shipment: {
            Shipper: {
              Address: { PostalCode: shipperZip, CountryCode: "US" },
            },
            ShipTo: {
              Address: { PostalCode: receiverZip, CountryCode: "US" },
            },
            ShipFrom: {
              Address: { PostalCode: shipperZip, CountryCode: "US" },
            },
            Service: { Code: "03" }, // 03 = UPS Ground
            Package: [
              {
                PackagingType: { Code: "02" }, // 02 = Customer Supplied Package
                Dimensions: {
                  UnitOfMeasurement: { Code: "IN" },
                  Length: String(dimensions.length),
                  Width: String(dimensions.width),
                  Height: String(dimensions.height),
                },
                PackageWeight: {
                  UnitOfMeasurement: { Code: "LBS" },
                  Weight: String(weight),
                },
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
  
      return response.data?.RateResponse?.RatedShipment?.[0]?.TotalCharges?.MonetaryValue || null;
    } catch (error) {
      if (error.response) {
        console.error("❌ UPS API Error:", JSON.stringify(error.response.data, null, 2));
      } else {
        console.error("❌ UPS API Unexpected Error:", error.message);
      }
      return null;
    }
  };
  
//USPS
// 🔹 Function to Get USPS OAuth Token (Your Working Version)
const getUSPSToken = async () => {
    try {
        const response = await axios.post(
            "https://apis.usps.com/oauth2/v3/token",
            new URLSearchParams({
                grant_type: "client_credentials",
                client_id: process.env.USPS_CLIENT_ID,
                client_secret: process.env.USPS_CLIENT_SECRET
            }).toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        console.log("✅ USPS OAuth Response:", response.data);
        return response.data.access_token;
    } catch (error) {
        console.error("❌ USPS OAuth Error:", error.response?.data || error.message);
        return null;
    }
};



// 🔹 Function to Get USPS Rates (Using Shipping Options API)
const getUSPSRates = async (shipperZip, receiverZip, weight, dimensions) => {
    try {
        const accessToken = await getUSPSToken();
        if (!accessToken) {
            console.error("❌ USPS Token Error: Unable to get USPS OAuth token");
            return null;
        }

        console.log("🔎 Dimensions Inside USPS Function:", dimensions);

        const uspsRequestPayload = {
            originZIPCode: shipperZip,
            destinationZIPCode: receiverZip,
            destinationEntryFacilityType: "NONE",
            packageDescription: {
                weight: weight,
                length: dimensions.length,
                width: dimensions.width,
                height: dimensions.height,
                mailClass: "PRIORITY_MAIL"
            },
            pricingOptions: [
                {
                    priceType: "RETAIL",
                    shippingFilter: "PRICE"
                }
            ]
        };

        console.log("📡 USPS Shipping Options Request Payload:", uspsRequestPayload);

        const response = await axios.post(
            "https://apis.usps.com/shipments/v3/options/search",
            uspsRequestPayload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        console.log("🔍 USPS Shipping Options API Response:", response.data);

        // ✅ Extract the lowest rate
        let lowestRate = null;
        if (response.data?.pricingOptions?.length) {
            const shippingOptions = response.data.pricingOptions[0].shippingOptions;
            if (shippingOptions?.length) {
                const rateOptions = shippingOptions[0].rateOptions;
                if (rateOptions?.length) {
                    lowestRate = rateOptions[0].totalBasePrice;
                }
            }
        }

        console.log("✅ Extracted USPS Rate:", lowestRate);
        return lowestRate || null; // Ensure the frontend receives only a number
    } catch (error) {
        console.error("❌ USPS Shipping Options API Error:", error.response?.data || error.message);
        return null;
    }
};



// 🔹 Example Usage
(async () => {
    const shipperZip = "10001";
    const receiverZip = "80030";
    const weight = 3;
    const dimensions = { length: 10, width: 10, height: 30 };

    const uspsRate = await getUSPSRates(shipperZip, receiverZip, weight, dimensions);
    console.log("Final USPS Shipping Rate:", uspsRate);
})();


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
