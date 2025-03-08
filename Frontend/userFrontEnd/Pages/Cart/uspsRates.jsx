import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { userApi } from "../../config/axios";
import LoadingPage from "../../Components/loading";

const USPSRates = ({
  receiverZip,
  onSelectRate,
  totalWeight,
  totalDimensions,
  isOpen,    // optional controlled prop
  onToggle,  // optional controlled prop
}) => {
  // Local state for uncontrolled mode
  const [localOpen, setLocalOpen] = useState(false);
  const [uspsRates, setUspsRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);
  const shipperZip = import.meta.env.VITE_SHIPPER_ZIP || "10001";

  // Determine if the component is controlled or not.
  const isControlled = typeof isOpen === "boolean";
  const actualOpen = isControlled ? isOpen : localOpen;

  const fetchUSPSRates = async () => {
    setLoading(true);
    try {
      const response = await userApi.post("/register-rates/usps-rates", {
        shipperZip,
        receiverZip,
        weight: totalWeight,
        dimensions: { 
          length: totalDimensions.length, 
          width: totalDimensions.width, 
          height: totalDimensions.height 
        }
      });
      console.log("📡 USPS Rates Response:", JSON.stringify(response.data, null, 2));
      setUspsRates(response.data.usps || []);
    } catch (error) {
      console.error("❌ Error fetching USPS rates:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    if (isControlled) {
      if (onToggle) onToggle();
      if (!isOpen) fetchUSPSRates();
    } else {
      setLocalOpen((prev) => {
        const newState = !prev;
        if (newState) {
          fetchUSPSRates();
        }
        return newState;
      });
    }
  };

  const handleSelectRate = (rate) => {
    setSelectedRate(rate.serviceCode);
    onSelectRate(rate.cost);
  };

  return (
    <div className="form-section">
      <motion.button
        onClick={toggleDropdown}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="usps-button"
      >
        USPS Rates
      </motion.button>

      {actualOpen && (
        <div className="usps-rate-dropdown">
          {loading ? (
            <LoadingPage />
          ) : uspsRates.length ? (
            <AnimatePresence>
              {uspsRates.map((rate, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSelectRate(rate)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`usps-rate-option ${selectedRate === rate.serviceCode ? "selected" : ""}`}
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
                    animate={{ width: selectedRate === rate.serviceCode ? "100%" : "0%" }}
                    transition={{ duration: 0.4 }}
                    className="absolute top-0 left-0 h-full bg-red-600 opacity-20"
                  />
                  {/* Two-column layout */}
                  <div
                    className="usps-rate-option-content"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      position: "relative",
                      zIndex: 1, // Ensure content appears above the fill animation
                    }}
                  >
                    {/* Left Column: Price */}
                    <div
                      className="usps-rate-price"
                      style={{
                        fontWeight: "bold",
                        fontSize: "1.2em",
                      }}
                    >
                      ${rate.cost ? rate.cost.toFixed(2) : "N/A"}
                    </div>
                    {/* Right Column: Service Name and Delivery Details */}
                    <div
                      className="usps-rate-details"
                      style={{
                        textAlign: "right",
                        lineHeight: 1.2,
                      }}
                    >
                      <div
                        className="usps-rate-name"
                        style={{
                          fontSize: "1em",
                          marginBottom: "4px",
                        }}
                      >
                        {rate.serviceName}
                      </div>
                      <div
                        className="usps-rate-delivery"
                        style={{
                          fontSize: "0.9em",
                          color: "#555",
                        }}
                      >
                        {rate.estimatedDeliveryDate && rate.estimatedDeliveryDate !== "N/A"
                          ? `Est. Delivery: ${rate.estimatedDeliveryDate} (${rate.approxDays || "3-5 days"})`
                          : "Est. Delivery Not Available"}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          ) : (
            <motion.p className="usps-no-rates" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              No USPS rates available
            </motion.p>
          )}
        </div>
      )}
    </div>
  );
};

export default USPSRates;
