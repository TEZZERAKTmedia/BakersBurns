import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { registerApi } from "../../config/axios";
import LoadingPage from "../../Components/loading"; 

const UPSRates = ({
  receiverZip,
  onSelectRate,
  totalWeight,
  totalDimensions,
  isOpen,    // optional controlled prop
  onToggle,  // optional controlled prop
}) => {
  // Local state for uncontrolled mode
  const [localOpen, setLocalOpen] = useState(false);
  const [upsRates, setUpsRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);
  const shipperZip = import.meta.env.VITE_SHIPPER_ZIP;

  // Determine if the component is controlled or not.
  const isControlled = typeof isOpen === "boolean";
  const actualOpen = isControlled ? isOpen : localOpen;

  const fetchUPSRates = async () => {
    setLoading(true);
    try {
      const response = await registerApi.post("/register-rates/ups-rates", {
        shipperZip,
        receiverZip,
        weight: totalWeight,
        dimensions: { 
          length: totalDimensions.length, 
          width: totalDimensions.width, 
          height: totalDimensions.height 
        }
      });
      setUpsRates(response.data.ups || []);
    } catch (error) {
      console.error("❌ Error fetching UPS rates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRate = (rate) => {
    setSelectedRate(rate.serviceName);  // ✅ Use serviceName for human-readable selection
    onSelectRate(rate.serviceName, rate.cost);  // ✅ Ensure function receives both values
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
                      zIndex: 1, // ensure content is above the fill animation
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
            <motion.p className="no-rates" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              No UPS rates available
            </motion.p>
          )}
        </div>
      )}
    </div>
  );
};

export default UPSRates;
