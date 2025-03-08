import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { userApi } from "../../config/axios";
import LoadingPage from "../../Components/loading";

// Helper function to compute fallback rates based on ZIP difference
function computeFallbackRates(receiverZip, adminZip) {
  const userZipNum = parseInt(receiverZip, 10);
  const adminZipNum = parseInt(adminZip, 10);

  // If parsing fails, return static fallback options
  if (isNaN(userZipNum) || isNaN(adminZipNum)) {
    return [
      { serviceName: "Ground", cost: 15.0, estimatedDelivery: "3-5 days" },
      { serviceName: "2-Day", cost: 25.0, estimatedDelivery: "2 days" },
      { serviceName: "Overnight", cost: 40.0, estimatedDelivery: "1 day" },
    ];
  }

  const zipDifference = Math.abs(userZipNum - adminZipNum);

  // Define fallback tiers with a base fee and multiplier for cost calculation
  const fallbackOptions = [
    {
      serviceName: "Fallback Ground",
      baseFee: 10.0,
      multiplier: 0.00015,
      estimatedDelivery: "3-5 days",
    },
    {
      serviceName: "Fallback 2-Day",
      baseFee: 15.0,
      multiplier: 0.0002,
      estimatedDelivery: "2 days",
    },
    {
      serviceName: "Fallback Overnight",
      baseFee: 25.0,
      multiplier: 0.0003,
      estimatedDelivery: "1 day",
    },
  ];

  return fallbackOptions.map((opt) => {
    const estimatedCost = opt.baseFee + zipDifference * opt.multiplier;
    return {
      serviceName: opt.serviceName,
      cost: parseFloat(estimatedCost.toFixed(2)),
      estimatedDelivery: opt.estimatedDelivery,
    };
  });
}

const UPSRates = ({
  receiverZip,
  onSelectRate,
  totalWeight,
  totalDimensions,
  isOpen,       // optional controlled prop
  onToggle,     // optional controlled prop
  onError,      // callback prop to notify parent if UPS fails
}) => {
  // Local state for uncontrolled mode
  const [localOpen, setLocalOpen] = useState(false);
  const [upsRates, setUpsRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);
  const [error, setError] = useState(false);

  // Ensure shipperZip is set from env variables
  const shipperZip = import.meta.env.VITE_SHIPPER_ZIP;

  // Determine controlled/uncontrolled mode
  const isControlled = typeof isOpen === "boolean";
  const actualOpen = isControlled ? isOpen : localOpen;

  const fetchUPSRates = async () => {
    setLoading(true);
    setError(false);

    // Log the parameters being sent to the server for debugging
    console.log("UPS Rates -> Sending parameters:", {
      shipperZip,
      receiverZip,
      weight: totalWeight,
      dimensions: {
        length: totalDimensions.length,
        width: totalDimensions.width,
        height: totalDimensions.height,
      },
    });

    try {
      const response = await userApi.post("/register-rates/ups-rates", {
        shipperZip,
        receiverZip,
        weight: totalWeight,
        dimensions: {
          length: totalDimensions.length,
          width: totalDimensions.width,
          height: totalDimensions.height,
        },
      });
      setUpsRates(response.data.ups || []);
    } catch (err) {
      console.error("❌ Error fetching UPS rates:", err);
      setError(true);

      // If fetching UPS rates fails, compute fallback rates using ZIP comparison
      const fallbackData = computeFallbackRates(receiverZip, shipperZip);
      setUpsRates(fallbackData);

      // Notify the parent that UPS fetching failed
      if (onError) onError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRate = (rate) => {
    setSelectedRate(rate.serviceName);
    onSelectRate(rate.serviceName, rate.cost);
  };

  const toggleDropdown = () => {
    if (isControlled) {
      if (onToggle) onToggle();
      if (!isOpen) fetchUPSRates();
    } else {
      setLocalOpen((prev) => {
        const newState = !prev;
        if (newState) {
          fetchUPSRates();
        }
        return newState;
      });
    }
  };

  return (
    <div className="form-section">
      <motion.button 
        onClick={toggleDropdown}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="ups-button"
      >
        UPS Rates
      </motion.button>

      {actualOpen && (
        <div className="rate-dropdown">
          {loading ? (
            <LoadingPage />
          ) : upsRates.length ? (
            <AnimatePresence>
              {upsRates.map((rate, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSelectRate(rate)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`rate-option ${selectedRate === rate.serviceName ? "selected" : ""}`}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    width: "100%",
                    padding: "8px",
                    border: "none",
                    background: "transparent",
                  }}
                >
                  {/* Background fill animation */}
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: selectedRate === rate.serviceName ? "100%" : "0%" }}
                    transition={{ duration: 0.4 }}
                    className="absolute top-0 left-0 h-full bg-blue-600 opacity-20"
                  />
                  {/* Layout: left block for price, right block for details */}
                  <div
                    className="rate-option-content"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {/* Left Column: Price */}
                    <div
                      className="rate-price"
                      style={{
                        fontWeight: "bold",
                        fontSize: "1.2em",
                      }}
                    >
                      ${rate.cost ? rate.cost.toFixed(2) : "N/A"}
                    </div>
                    {/* Right Column: Service Name and Delivery Details */}
                    <div
                      className="rate-details"
                      style={{
                        textAlign: "right",
                        lineHeight: 1.2,
                      }}
                    >
                      <div
                        className="rate-name"
                        style={{
                          fontSize: "1em",
                          marginBottom: "4px",
                        }}
                      >
                        {rate.serviceName}
                      </div>
                      <div
                        className="rate-delivery"
                        style={{
                          fontSize: "0.9em",
                          color: "#555",
                        }}
                      >
                        Est. Delivery: {rate.estimatedDelivery}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          ) : (
            <motion.p
              className="no-rates"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error
                ? "UPS not available. Fallback rates also unavailable."
                : "No UPS rates or fallback rates available."}
            </motion.p>
          )}
        </div>
      )}
    </div>
  );
};

export default UPSRates;
