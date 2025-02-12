import React from "react";
import { useNavigate } from "react-router-dom";
import { registerApi } from "../../config/axios";

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
      // You might also send receiverZip, taxAmount, grandTotal if needed on your backend,
      // but for now we’re updating only the three fields.
      // timestamp can be added on the backend if needed.
    };

    try {
      // Retrieve the sessionId from local storage
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        throw new Error("Session ID not found.");
      }
      
      // Update shipping details in the database for the guest cart
      await registerApi.post("/register-cart/update-shipping", {
        sessionId,
        shippingDetails,
      });
      console.log("🚀 Shipping details stored in the database.");

      // Now, navigate to the checkout options page.
      navigate("/checkout-options");
    } catch (error) {
      console.error("Error saving shipping details:", error);
      alert("There was an error saving your shipping details. Please try again.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Order Summary</h2>
        <div className="summary-details">
          <h3>Items in Cart</h3>
          <ul>
            {cart.map((item) => (
              <li key={item.id}>
                {item.quantity}x {item.name} - ${item.price.toFixed(2)}
              </li>
            ))}
          </ul>
          <h3>Shipping Method</h3>
          <p>{selectedCarrier ? `${selectedCarrier} - ${selectedService}` : "Not Selected"}</p>
          <h3>Shipping Cost</h3>
          <p>${shippingCost ? shippingCost.toFixed(2) : "Not Selected"}</p>
          <h3>Tax</h3>
          <p>${taxAmount.toFixed(2)}</p>
          <h3>Grand Total</h3>
          <p><strong>${grandTotal.toFixed(2)}</strong></p>
        </div>
        <div className="modal-buttons">
          <button onClick={handleConfirmCheckout} className="proceed-checkout">
            Confirm & Proceed
          </button>
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;
