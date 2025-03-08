import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingPage from "../../Components/loading"; 

// 1) Compute your fallback rates here.
//    This example returns multiple options—Ground, 2-Day, Overnight.
function computeFallbackRates(receiverZip, adminZip) {
  const userZipNum = parseInt(receiverZip, 10);
  const adminZipNum = parseInt(adminZip, 10);

  // If we can't parse ZIP codes, just return some static fallback rates:
  if (isNaN(userZipNum) || isNaN(adminZipNum)) {
    return [
      { serviceName: "Fallback Ground", cost: 15.0, estimatedDelivery: "3-5 days" },
      { serviceName: "Fallback 2-Day", cost: 25.0, estimatedDelivery: "2 days" },
      { serviceName: "Fallback Overnight", cost: 40.0, estimatedDelivery: "1 day" },
    ];
  }

  const zipDifference = Math.abs(userZipNum - adminZipNum);

  // Adjust these values to get more expensive or cheaper shipping.
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

const FallbackRates = ({
  receiverZip,
  adminZip,
  onSelectRate,
  isOpen,      // optional controlled prop (similar to UPSRates)
  onToggle,    // optional controlled prop (similar to UPSRates)
}) => {
  // Local state for "uncontrolled" mode
  const [localOpen, setLocalOpen] = useState(false);
  const [fallbackRates, setFallbackRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);

  // Determine if we're in controlled mode (props) or not
  const isControlled = typeof isOpen === "boolean";
  const actualOpen = isControlled ? isOpen : localOpen;

  // 2) Simulate an async "fetch" of fallback rates
  const fetchFallbackRates = async () => {
    setLoading(true);
    try {
      // Simulate a small delay for loading
      setTimeout(() => {
        const rates = computeFallbackRates(receiverZip, adminZip);
        setFallbackRates(rates);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error("Error fetching fallback rates:", error);
      setLoading(false);
    }
  };

  // 3) When user picks a rate
  const handleSelectRate = (rate) => {
    setSelectedRate(rate.serviceName);
    onSelectRate(rate.serviceName, rate.cost);
  };

  // 4) Open/close the dropdown
  const toggleDropdown = () => {
    if (isControlled) {
      // If controlled, call the parent's toggle and fetch if we're about to open
      if (onToggle) onToggle();
      if (!isOpen) {
        fetchFallbackRates();
      }
    } else {
      setLocalOpen((prev) => {
        const newState = !prev;
        if (newState) {
          fetchFallbackRates();
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
        className="ups-button" // Reuse the same class as UPS for consistent styling
      >
        Fallback Rates
      </motion.button>

      {actualOpen && (
        <div className="rate-dropdown">
          {loading ? (
            <LoadingPage />
          ) : fallbackRates.length ? (
            <AnimatePresence>
              {fallbackRates.map((rate, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSelectRate(rate)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`rate-option ${
                    selectedRate === rate.serviceName ? "selected" : ""
                  }`}
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
                    animate={{
                      width: selectedRate === rate.serviceName ? "100%" : "0%",
                    }}
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
              No fallback rates available
            </motion.p>
          )}
        </div>
      )}
    </div>
  );
};

export default FallbackRates;
