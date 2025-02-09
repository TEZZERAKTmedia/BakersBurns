import React, { useState } from "react";
import { registerApi } from "../../config/axios";

const UPSRates = ({ receiverZip, onSelectRate }) => {
  const [upsRates, setUpsRates] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchUPSRates = async () => {
    try {
      const response = await registerApi.post("/register-rates/ups-rates", {
        receiverZip,
      });
      setUpsRates(response.data.ups || []);
    } catch (error) {
      console.error("Error fetching UPS rates:", error);
    }
  };

  const handleToggle = () => {
    if (!open) fetchUPSRates();
    setOpen(!open);
  };

  return (
    <div className="carrier-rate">
      <button onClick={handleToggle}>UPS Rates</button>
      {open && (
        <div className="rate-dropdown">
          {upsRates.length ? (
            upsRates.map((rate, index) => (
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
            <p>No UPS rates available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UPSRates;
