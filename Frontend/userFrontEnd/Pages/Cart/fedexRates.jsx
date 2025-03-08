import React, { useState } from "react";
import { userApi } from "../../config/axios";

const FedExRates = ({ receiverZip, onSelectRate }) => {
  const [fedexRates, setFedexRates] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchFedExRates = async () => {
    try {
      const response = await userApi.post("/register-rates/fedex-rates", {
        receiverZip,
      });
      setFedexRates(response.data.fedex || []);
    } catch (error) {
      console.error("Error fetching FedEx rates:", error);
    }
  };

  const handleToggle = () => {
    if (!open) fetchFedExRates();
    setOpen(!open);
  };

  return (
    <div className="carrier-rate">
      <button onClick={handleToggle}>FedEx Rates</button>
      {open && (
        <div className="rate-dropdown">
          {fedexRates.length ? (
            fedexRates.map((rate, index) => (
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
            <p>No FedEx rates available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FedExRates;
