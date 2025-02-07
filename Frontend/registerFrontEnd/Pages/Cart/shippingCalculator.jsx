import React, { useState, useEffect } from "react";
import { registerApi } from "../../config/axios";

const ShippingCalculator = ({ cart, receiverZip, setShippingCost }) => {
  const [shippingRates, setShippingRates] = useState(null);
  const [loading, setLoading] = useState(false);
  const shipperZip = "10001"; // Your warehouse ZIP code

  useEffect(() => {
    if (cart.length > 0 && receiverZip.length === 5 && /^\d+$/.test(receiverZip)) {
      calculateShippingCost(cart, receiverZip);
    }
  }, [cart, receiverZip]);

  const calculateTotalWeight = (cart) => {
    return cart.reduce((total, item) => total + (item.weight || 0) * item.quantity, 0);
  };

  const calculateTotalDimensions = (cart) => {
    return cart.reduce(
      (total, item) => ({
        length: Math.max(total.length, item.length || 0),
        width: Math.max(total.width, item.width || 0),
        height: total.height + (item.height || 0) * item.quantity,
      }),
      { length: 0, width: 0, height: 0 }
    );
  };

  const calculateShippingCost = async (cart, receiverZip) => {
    const totalWeight = calculateTotalWeight(cart);
    const dimensions = calculateTotalDimensions(cart);

    // ✅ Debugging logs
    console.log("🚀 Shipping Calculation Triggered");
    console.log("🛒 Cart Items:", cart);
    console.log("📍 Shipper ZIP:", shipperZip);
    console.log("📍 Receiver ZIP:", receiverZip);
    console.log("⚖️ Total Weight:", totalWeight);
    console.log("📦 Dimensions:", dimensions);

    setLoading(true);
    try {
      const response = await registerApi.post("/register-rates/all-rates", {
        shipperZip,
        receiverZip,
        weight: totalWeight,
        dimensions,
      });

      console.log("✅ API Response:", response.data);
      setShippingRates(response.data);
      setShippingCost(response.data.lowestCost); // ✅ Set lowest cost in parent
    } catch (error) {
      console.error("❌ Error fetching shipping rates:", error.response?.data || error.message);
      setShippingRates(null);
      setShippingCost(null);
    }
    setLoading(false);
  };

  return (
    <div className="shipping-calculator">
      <h3>Estimated Shipping Costs:</h3>
      {loading ? (
        <p>Calculating...</p>
      ) : shippingRates ? (
        <ul>
          {shippingRates.ups && <li>UPS: ${shippingRates.ups}</li>}
          {shippingRates.usps && <li>USPS: ${shippingRates.usps}</li>}
          {shippingRates.fedex && <li>FedEx: ${shippingRates.fedex}</li>}
          <li><strong>Lowest: ${shippingRates.lowestCost}</strong></li>
        </ul>
      ) : (
        <p>Enter ZIP Code to calculate shipping</p>
      )}
    </div>
  );
};

export default ShippingCalculator;
