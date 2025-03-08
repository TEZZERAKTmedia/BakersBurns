import React from "react";
import { useNavigate } from "react-router-dom";
import { registerApi } from "../../config/axios";
import "./checkout_summary.css"; // Import the external CSS file

const CheckoutSummary = ({ 
  cart, 
  receiverZip, 
  shippingCost, 
  taxAmount, 
  grandTotal, 
  selectedCarrier, 
  selectedService, 
  onClose 
}) => {
  const navigate = useNavigate();

  const handleConfirmCheckout = async () => {
    console.log("✅ Confirm Checkout Clicked!");

    const shippingDetails = {
      selectedCarrier,
      selectedService,
      shippingCost,
    };

    try {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        throw new Error("Session ID not found.");
      }
      
      await registerApi.post("/register-cart/update-shipping", {
        sessionId,
        shippingDetails,
      });

      console.log("🚀 Shipping details stored in the database.");
      navigate("/checkout-options");
    } catch (error) {
      console.error("Error saving shipping details:", error);
      alert("There was an error saving your shipping details. Please try again.");
    }
  };

  return (
    <div className="cksm-modal-overlay">
      <div className="cksm-modal-content">
        <h2 className="cksm-title">Order Summary</h2>

        <div className="cksm-summary-details">
          <div className="cksm-detail-row">
            <span className="cksm-detail-label">Items in Cart:</span>
            <span className="cksm-detail-value">
              {cart.map((item) => (
                <div key={item.id}>
                  {item.quantity}x {item.name} - ${item.price.toFixed(2)}
                </div>
              ))}
            </span>
          </div>
          <div className="cksm-detail-row">
            <span className="cksm-detail-label">Shipping Method:</span>
            <span className="cksm-detail-value">
              {selectedCarrier ? `${selectedCarrier} - ${selectedService}` : "Not Selected"}
            </span>
          </div>
          <div className="cksm-detail-row">
            <span className="cksm-detail-label">Shipping Cost:</span>
            <span className="cksm-detail-value">
              ${shippingCost ? shippingCost.toFixed(2) : "Not Selected"}
            </span>
          </div>
          <div className="cksm-detail-row">
            <span className="cksm-detail-label">Tax:</span>
            <span className="cksm-detail-value">
              ${taxAmount.toFixed(2)}
            </span>
          </div>
          <div className="cksm-detail-row">
            <span className="cksm-detail-label">Grand Total:</span>
            <span className="cksm-detail-value">
              <strong>${grandTotal.toFixed(2)}</strong>
            </span>
          </div>
        </div>

        <div className="cksm-modal-buttons">
          <button onClick={handleConfirmCheckout} className="cksm-proceed-checkout">
            Confirm & Proceed
          </button>
          <button onClick={onClose} className="cksm-cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;
