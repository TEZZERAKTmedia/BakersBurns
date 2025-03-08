import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { userApi } from "../../config/axios"; // or userApi if that's correct
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);


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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Called when user clicks “Confirm & Proceed”
  const handleConfirmCheckout = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const cartItems = cart.map((item) => ({
        productId: item.product?.id, // Ensure this exists
        quantity: item.quantity,
        price: item.product?.price,
        thumbnail: item.product?.thumbnail,
      }));
  
      console.log("📦 CheckoutSummary - cartItems being sent to backend:", cartItems);
  
      const shippingDetails = {
        selectedCarrier,
        selectedService,
        shippingCost,
        receiverZip,
        taxAmount,
        grandTotal,
      };
  
      console.log("🚀 CheckoutSummary - shippingDetails:", shippingDetails);
  
      if (!cartItems.length) {
        throw new Error("❌ Cart is empty. Cannot proceed.");
      }
      if (!shippingCost || !selectedCarrier || !selectedService) {
        throw new Error("❌ Shipping details are incomplete.");
      }
  
      const response = await userApi.post("/stripe/create-checkout-session", {
        cartItems,
        shippingDetails,
      });
  
      if (response.data?.sessionId) {
        console.log("✅ Redirecting to Stripe Checkout with sessionId:", response.data.sessionId);
  
        // Load Stripe and redirect to checkout
        const stripe = await stripePromise;
        await stripe.redirectToCheckout({ sessionId: response.data.sessionId });
      } else {
        console.error("❌ Error: No sessionId received. Redirecting to checkout options.");
        navigate("/checkout-options");
      }
    } catch (err) {
      console.error("❌ Error creating checkout session:", err);
      setError(err.message || "Failed to initiate checkout.");
    } finally {
      setLoading(false);
    }
  };
  
  
  

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Order Summary</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="summary-details">
          <h3>Items in Cart</h3>
          <ul>
            {cart.map((item) => (
              <li key={item.product.id}>
                {item.quantity}x {item.product.name} - $
                {item.product.price.toFixed(2)}
              </li>
            ))}
          </ul>

          <h3>Shipping Method</h3>
          <p>
            {selectedCarrier
              ? `${selectedCarrier} - ${selectedService}`
              : "Not Selected"}
          </p>
          <h3>Shipping Cost</h3>
          <p>${shippingCost ? shippingCost.toFixed(2) : "Not Selected"}</p>
          <h3>Tax</h3>
          <p>${taxAmount.toFixed(2)}</p>
          <h3>Grand Total</h3>
          <p><strong>${grandTotal.toFixed(2)}</strong></p>
        </div>

        <div className="modal-buttons">
          <button
            onClick={handleConfirmCheckout}
            className="proceed-checkout"
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm & Proceed"}
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
