import React, { useState } from "react";
import { registerApi } from "../../config/axios";

const USPSRates = ({ receiverZip, onSelectRate }) => {
  const [uspsRates, setUspsRates] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchUSPSRates = async () => {
    try {
      const response = await registerApi.post("/register-rates/usps-rates", {
        receiverZip,
      });
      setUspsRates(response.data.usps || []);
    } catch (error) {
      console.error("Error fetching USPS rates:", error);
    }
  };

  const handleToggle = () => {
    if (!open) fetchUSPSRates();
    setOpen(!open);
  };

  return (
    <div className="carrier-rate">
      <button onClick={handleToggle}>USPS Rates</button>
      {open && (
        <div className="rate-dropdown">
          {uspsRates.length ? (
            uspsRates.map((rate, index) => (
              <label key={index}>
                <input
                  type="radio"
                  name="shippingOption"
                  value={rate.cost}
                  onChange={() => onSelectRate(rate.cost)}
                />
                {rate.serviceName} - ${rate.cost.toFixed(2)}
              </label>
            ))
          ) : (
            <p>No USPS rates available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default USPSRates;
