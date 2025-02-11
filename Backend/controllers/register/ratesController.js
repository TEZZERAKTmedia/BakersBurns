const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

// Environment Variables for all carriers
const UPS_CLIENT_ID = process.env.UPS_CLIENT_ID;
const UPS_CLIENT_SECRET = process.env.UPS_CLIENT_SECRET;
const USPS_CLIENT_ID = process.env.USPS_CLIENT_ID;
const USPS_CLIENT_SECRET = process.env.USPS_CLIENT_SECRET;
const FEDEX_CLIENT_ID = process.env.FEDEX_CLIENT_ID;
const FEDEX_CLIENT_SECRET = process.env.FEDEX_CLIENT_SECRET;

// -----------------------
// Token Caching Variables
// -----------------------

// UPS Token Cache
let upsTokenCache = null;
let upsTokenExpiry = null;

// USPS Token Cache
let uspsTokenCache = null;
let uspsTokenExpiry = null;

// FedEx Token Cache
let fedexTokenCache = null;
let fedexTokenExpiry = null;

// -----------------------
// OAuth Token Retrieval Functions
// -----------------------

// UPS Token
const getUPSToken = async () => {
  const now = Date.now();
  if (upsTokenCache && upsTokenExpiry && now < upsTokenExpiry) {
    return upsTokenCache;
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

// USPS Token
const getUSPSToken = async () => {
  const now = Date.now();
  if (uspsTokenCache && uspsTokenExpiry && now < uspsTokenExpiry) {
    return uspsTokenCache;
  }
  try {
    const response = await axios.post(
      "https://apis.usps.com/oauth2/v3/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: USPS_CLIENT_ID,
        client_secret: USPS_CLIENT_SECRET,
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    uspsTokenCache = response.data.access_token;
    uspsTokenExpiry = now + 3600000;
    return uspsTokenCache;
  } catch (error) {
    console.error("USPS OAuth Error:", error.response?.data || error.message);
    return null;
  }
};

// FedEx Token
const getFedExToken = async () => {
  const now = Date.now();
  if (fedexTokenCache && fedexTokenExpiry && now < fedexTokenExpiry) {
    return fedexTokenCache;
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
    fedexTokenExpiry = now + 3600000;
    return fedexTokenCache;
  } catch (error) {
    console.error("FedEx OAuth Error:", error.response?.data || error.message);
    return null;
  }
};

// -----------------------
// Carrier Rate Functions (return arrays of options)
// -----------------------

// UPS – Returns an array of options
const getUPSRates = async (shipperZip, receiverZip, weight, dimensions) => {
    try {
        const accessToken = await getUPSToken();
        if (!accessToken) {
            console.error("❌ UPS Token Error: Unable to get UPS OAuth token");
            return [];
        }

        // UPS Service Code to Name Mapping
        const upsServiceMap = {
            "01": "UPS Next Day Air",
            "02": "UPS 2nd Day Air",
            "03": "UPS Ground",
            "07": "UPS Worldwide Express",
            "08": "UPS Worldwide Expedited",
            "11": "UPS Standard",
            "12": "UPS 3 Day Select",
            "13": "UPS Next Day Air Saver",
            "14": "UPS Next Day Air Early",
            "59": "UPS 2nd Day Air AM",
        };

        const serviceCodes = Object.keys(upsServiceMap);
        let allRates = [];

        for (const code of serviceCodes) {
            const ratingPayload = {
                RateRequest: {
                    Request: { RequestOption: "Rate" },
                    Shipment: {
                        Shipper: { Address: { PostalCode: shipperZip, CountryCode: "US" } },
                        ShipTo: { Address: { PostalCode: receiverZip, CountryCode: "US" } },
                        ShipFrom: { Address: { PostalCode: shipperZip, CountryCode: "US" } },
                        Service: { Code: code },
                        PickupType: { Code: "01" }, // Daily Pickup
                        Package: [
                            {
                                PackagingType: { Code: "02" },
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

            console.log(`🚀 Sending UPS Rate API Request for Service Code: ${code}`);

            try {
                const rateResponse = await axios.post(
                    "https://onlinetools.ups.com/api/rating/v2409/Rate",
                    ratingPayload,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                            transactionSrc: "BakersBurns",
                        },
                    }
                );

                console.log(`✅ UPS Rating API Response for ${code}:`, JSON.stringify(rateResponse.data, null, 2));

                const rateOptions = rateResponse.data?.RateResponse?.RatedShipment?.map(service => {
                    let deliveryEstimate = "N/A";

                    if (service.GuaranteedDelivery) {
                        if (service.GuaranteedDelivery.DeliveryByTime) {
                            deliveryEstimate = service.GuaranteedDelivery.DeliveryByTime;
                        } else if (service.GuaranteedDelivery.BusinessDaysInTransit) {
                            // Calculate estimated delivery date
                            let transitDays = parseInt(service.GuaranteedDelivery.BusinessDaysInTransit, 10);
                            let estimatedDate = new Date();
                            estimatedDate.setDate(estimatedDate.getDate() + transitDays);
                            deliveryEstimate = estimatedDate.toDateString(); // Format as readable date
                        }
                    }

                    // Default UPS Ground to 5 business days if no estimate is given
                    if (!service.GuaranteedDelivery && service.Service.Code === "03") {
                        let estimatedDate = new Date();
                        estimatedDate.setDate(estimatedDate.getDate() + 5);
                        deliveryEstimate = estimatedDate.toDateString();
                    }

                    return {
                        serviceCode: service.Service.Code,
                        serviceName: upsServiceMap[service.Service.Code] || `UPS Service (${code})`,
                        cost: parseFloat(service.TotalCharges?.MonetaryValue) || Infinity,
                        estimatedDeliveryDate: deliveryEstimate,
                    };
                }) || [];

                allRates = [...allRates, ...rateOptions];
            } catch (error) {
                console.error(`❌ UPS API Error for Service Code ${code}:`, JSON.stringify(error.response?.data || error.message, null, 2));
            }
        }

        if (allRates.length === 0) {
            console.warn("❌ No UPS Rate Options Found.");
            return [];
        }

        // ✅ Filter only 3 options: Cheapest, Medium speed, Fastest
        const cheapest = allRates.reduce((prev, curr) => (curr.cost < prev.cost ? curr : prev), allRates[0]);
        const fastest = allRates.reduce((prev, curr) => 
            (new Date(curr.estimatedDeliveryDate) < new Date(prev.estimatedDeliveryDate) ? curr : prev), allRates[0]);

        // Find a medium-speed option (Not the cheapest or fastest)
        const mediumSpeed = allRates
            .filter(rate => rate.serviceCode !== cheapest.serviceCode && rate.serviceCode !== fastest.serviceCode)
            .reduce((prev, curr) => (curr.cost < prev.cost ? curr : prev), allRates[0]);

        return [cheapest, mediumSpeed, fastest].filter(Boolean);
    } catch (error) {
        console.error("UPS API Unexpected Error:", error.message);
        return [];
    }
};


// 🔹 Function to Get USPS Rates (Using Shipping Options API)
const getUSPSRates = async (shipperZip, receiverZip, weight, dimensions) => {
    try {
        const accessToken = await getUSPSToken();
        if (!accessToken) {
            console.error("❌ USPS Token Error: Unable to get USPS OAuth token");
            return [];
        }

        console.log("📡 Fetching USPS Rates for Domestic Shipping");

        // USPS API Request Payload
        const uspsRequestPayload = {
            originZIPCode: shipperZip,
            destinationZIPCode: receiverZip,
            weight: weight,
            length: dimensions.length,
            width: dimensions.width,
            height: dimensions.height,
            mailClass: "PARCEL_SELECT",
            processingCategory: "NON_MACHINABLE",
            destinationEntryFacilityType: "NONE",
            rateIndicator: "DR",
            priceType: "RETAIL",
            accountType: "EPS",
            mailingDate: new Date().toISOString().split("T")[0],
        };

        console.log("📦 USPS API Request Payload:", JSON.stringify(uspsRequestPayload, null, 2));

        const response = await axios.post(
            "https://apis.usps.com/prices/v3/base-rates/search",
            uspsRequestPayload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        console.log("✅ USPS Rate API Response:", JSON.stringify(response.data, null, 2));

        // ✅ Extract ALL available rates
        const rates = response.data?.rates?.map(option => ({
            serviceCode: option.mailClass,
            serviceName: option.description,
            cost: parseFloat(option.price) || Infinity,
            estimatedDeliveryDate: "N/A",
        })) || [];

        return rates;
    } catch (error) {
        console.error("❌ USPS API Error:", JSON.stringify(error.response?.data || error.message, null, 2));
        return [];
    }
};



// FedEx – Returns an array of options (iterating over multiple rate details)
const getFedExRates = async (shipperZip, receiverZip, weight, dimensions) => {
  try {
    const accessToken = await getFedExToken();
    if (!accessToken) return [];

    const fedexRequestPayload = {
      requestedShipment: {
        shipper: { address: { postalCode: shipperZip } },
        recipient: { address: { postalCode: receiverZip } },
        packages: [
          {
            weight: { value: weight, units: "LB" },
            dimensions: {
              length: dimensions.length,
              width: dimensions.width,
              height: dimensions.height,
              units: "IN",
            },
          },
        ],
      },
    };

    const response = await axios.post(
      "https://apis.fedex.com/rate/v1/rates/quotes",
      fedexRequestPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const options = [];
    // Assuming rateReplyDetails is an array; adjust parsing based on actual response schema.
    if (Array.isArray(response.data?.rateReplyDetails)) {
      response.data.rateReplyDetails.forEach((detail) => {
        if (detail.ratedShipmentDetails && Array.isArray(detail.ratedShipmentDetails)) {
          detail.ratedShipmentDetails.forEach((shipment) => {
            options.push({
              serviceName: detail.serviceType || "FedEx Option",
              cost: parseFloat(shipment.totalNetCharge?.amount),
              deliveryDate: shipment.deliveryTimestamp, // if provided
            });
          });
        }
      });
    } else if (response.data?.rateReplyDetails) {
      // Fallback if rateReplyDetails is a single object
      const shipment = response.data.rateReplyDetails.ratedShipmentDetails;
      if (Array.isArray(shipment)) {
        shipment.forEach((sh) => {
          options.push({
            serviceName: response.data.rateReplyDetails.serviceType || "FedEx Option",
            cost: parseFloat(sh.totalNetCharge?.amount),
            deliveryDate: sh.deliveryTimestamp,
          });
        });
      } else {
        options.push({
          serviceName: response.data.rateReplyDetails.serviceType || "FedEx Option",
          cost: parseFloat(response.data.rateReplyDetails.ratedShipmentDetails?.totalNetCharge?.amount),
        });
      }
    }
    return options;
  } catch (error) {
    console.error("FedEx API Error:", error.response?.data || error.message);
    return [];
  }
};

// -----------------------
// Combined Shipping Rates Endpoint
// -----------------------

const getShippingRates = async (req, res) => {
  try {
    console.log("🚀 Incoming Shipping Rate Request");
    console.log("📡 Received Request Body:", req.body);

    const { shipperZip, receiverZip, weight, dimensions } = req.body;
    if (!shipperZip || !receiverZip || !weight || !dimensions) {
      return res.status(400).json({ error: "Missing required parameters", received: req.body });
    }

    // Get multiple options from each carrier.
    const upsOptions = await getUPSRates(shipperZip, receiverZip, weight, dimensions);
    const uspsOptions = await getUSPSRates(shipperZip, receiverZip, weight, dimensions);
    const fedexOptions = await getFedExRates(shipperZip, receiverZip, weight, dimensions);

    // (Optional) Compute overall lowest cost among all options.
    const allCosts = [
      ...upsOptions.map(o => o.cost),
      ...uspsOptions.map(o => o.cost),
      ...fedexOptions.map(o => o.cost)
    ].filter(cost => isFinite(cost));
    const overallLowest = allCosts.length > 0 ? Math.min(...allCosts) : null;

    const responseData = {
      ups: upsOptions,
      usps: uspsOptions,
      fedex: fedexOptions,
      lowestCost: overallLowest,
    };

    console.log("📦 Final Response to Client:", responseData);
    res.json(responseData);
  } catch (error) {
    console.error("Error fetching shipping rates:", error);
    res.status(500).json({ error: "Failed to fetch shipping rates" });
  }
};

// -----------------------
// Express Route Handlers for Each Carrier (if needed)
// -----------------------

const getUPSRatesHandler = async (req, res) => {
  try {
    const { shipperZip, receiverZip, weight, dimensions } = req.body;
    if (!shipperZip || !receiverZip || !weight || !dimensions) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    const options = await getUPSRates(shipperZip, receiverZip, weight, dimensions);
    res.json({ ups: options });
  } catch (error) {
    console.error("Error fetching UPS rates:", error);
    res.status(500).json({ error: "Failed to fetch UPS rates" });
  }
};

const getUSPSRatesHandler = async (req, res) => {
    try {
      const { shipperZip, receiverZip, weight, dimensions } = req.body;
      if (!shipperZip || !receiverZip || !weight || !dimensions) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
  
      const options = await getUSPSRates(shipperZip, receiverZip, weight, dimensions);
  
      console.log("📦 USPS Rates Sent to Frontend:", JSON.stringify({ usps: options }, null, 2));
      res.json({ usps: options });  // ✅ Send full list of options
  
    } catch (error) {
      console.error("Error fetching USPS rates:", error);
      res.status(500).json({ error: "Failed to fetch USPS rates" });
    }
  };
  

const getFedExRatesHandler = async (req, res) => {
  try {
    const { shipperZip, receiverZip, weight, dimensions } = req.body;
    if (!shipperZip || !receiverZip || !weight || !dimensions) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    const options = await getFedExRates(shipperZip, receiverZip, weight, dimensions);
    res.json({ fedex: options });
  } catch (error) {
    console.error("Error fetching FedEx rates:", error);
    res.status(500).json({ error: "Failed to fetch FedEx rates" });
  }
};

// -----------------------
// Export Functions for Use in Routes
// -----------------------

module.exports = {
  getShippingRates,
  getUPSRatesHandler,
  getUSPSRatesHandler,
  getFedExRatesHandler,
};
