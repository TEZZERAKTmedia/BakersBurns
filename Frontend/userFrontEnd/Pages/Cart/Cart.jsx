import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../config/axios";
import { loadStripe } from "@stripe/stripe-js";
import "./cart.css";
import LoadingPage from "../../Components/loading";
import { useNotification } from "../../Components/notification/notification";
import CheckoutSummary from "./CheckoutSummary";
import UPSRates from "./upsRates";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const UserCart = () => {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const [receiverZip, setReceiverZip] = useState("");
  const [zipSubmitted, setZipSubmitted] = useState(false);
  const [shippingCost, setShippingCost] = useState(null);
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [openCarrier, setOpenCarrier] = useState(null);

  const navigate = useNavigate();

  // 1) Fetch cart from your API
  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await userApi.get("/cart");
      console.log("🛒 Cart API Response:", response.data); // Log API response
      setCart(response.data);
      calculateTotal(response.data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      showNotification("Error loading cart", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log("📦 UserCart - cart state:", cart);
  }, [cart]);
  

  // 2) Calculate total price from nested product data
  const calculateTotal = (items) => {
    const total = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    setTotalPrice(total);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Update quantity
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await userApi.patch(`/cart/${productId}`, { quantity: newQuantity });
      const updatedCart = cart.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      );
      setCart(updatedCart);
      calculateTotal(updatedCart);
    } catch (error) {
      console.error("Error updating quantity:", error);
      showNotification("Failed to update quantity", "error");
    }
  };

  // Remove from cart
  const handleDelete = async (productId) => {
    try {
      await userApi.delete(`/cart/${productId}`);
      const updatedCart = cart.filter((item) => item.product.id !== productId);
      setCart(updatedCart);
      calculateTotal(updatedCart);
      showNotification("Item removed from cart", "success");
    } catch (error) {
      console.error("Error deleting item:", error);
      showNotification("Failed to remove item", "error");
    }
  };

  // Zip code
  const handleZipSubmit = () => {
    if (receiverZip.length === 5 && /^\d+$/.test(receiverZip)) {
      setZipSubmitted(true);
    } else {
      showNotification("Please enter a valid 5-digit ZIP code", "error");
    }
  };

  // If you want to compute total dimensions, do so here
  const totalDimensions = cart.reduce(
    (dims, item) => ({
      length: dims.length + (item.product.length || 0) * item.quantity,
      width: Math.max(dims.width, item.product.width || 0),
      height: Math.max(dims.height, item.product.height || 0),
    }),
    { length: 0, width: 0, height: 0 }
  );

  // Compute tax & grand total
  const getTaxRateForZip = (zip) => {
    if (!zip || zip.length < 1) return 0;
    if (zip.startsWith("9")) return 0.0725;
    if (zip.startsWith("1")) return 0.08875;
    return 0.06;
  };

  const taxRate = zipSubmitted ? getTaxRateForZip(receiverZip) : 0;
  const taxAmount = shippingCost ? (totalPrice + shippingCost) * taxRate : 0;
  const grandTotal = shippingCost ? totalPrice + shippingCost + taxAmount : totalPrice;

  // Called when user selects shipping from UPS or fallback
  const handleSelectShipping = (carrier, serviceType, cost) => {
    setSelectedCarrier(carrier);
    setSelectedService(serviceType);
    setShippingCost(cost);
  };

  // Show summary modal
  const handleProceedToCheckout = () => {
    if (!shippingCost || !selectedCarrier) {
      showNotification("Please select a shipping option before proceeding", "error");
      return;
    }
    setShowSummaryModal(true);
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (cart.length === 0) {
    return (
      <div className="cart-container empty">
        <h2>Your cart is empty!</h2>
        <button onClick={() => navigate("/store")} className="cart-back-button">
          Back to Store
        </button>
      </div>
    );
  }

  // totalWeight if needed
  const totalWeight = cart.reduce(
    (sum, item) => sum + (item.product.weight || 0) * item.quantity,
    0
  );

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>

      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.product.id} className="cart-item">
            <div className="cart-item-info">
              <img
                src={`${import.meta.env.VITE_IMAGE_BASE_URL}/${item.product.thumbnail}`}
                alt={item.product.name}
                className="cart-item-image"
              />
              <div className="cart-item-details">
                <h4>{item.product.name}</h4>
                <p>Price: ${item.product.price.toFixed(2)}</p>
                <div className="quantity-control">
                  <button
                    onClick={() =>
                      handleQuantityChange(item.product.id, item.quantity - 1)
                    }
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        item.product.id,
                        parseInt(e.target.value, 10)
                      )
                    }
                  />
                  <button
                    onClick={() =>
                      handleQuantityChange(item.product.id, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                className="delete-button"
                onClick={() => handleDelete(item.product.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-total">
        <h3>Total: ${totalPrice.toFixed(2)}</h3>
      </div>

      {/* ZIP Entry */}
      <div className="shipping-section">
        <label htmlFor="zip">Enter ZIP Code:</label>
        <input
          type="text"
          id="zip"
          value={receiverZip}
          onChange={(e) => setReceiverZip(e.target.value)}
          placeholder="Enter your ZIP code"
          disabled={zipSubmitted}
        />
        <button onClick={handleZipSubmit} disabled={zipSubmitted}>
          {zipSubmitted ? "ZIP Code Submitted" : "Submit ZIP Code"}
        </button>
      </div>

      {/* Carrier Options */}
      {zipSubmitted && (
        <div className="carrier-options">
          <UPSRates
            receiverZip={receiverZip}
            totalWeight={totalWeight}
            totalDimensions={totalDimensions}
            onSelectRate={(serviceType, cost) =>
              handleSelectShipping("UPS", serviceType, cost)
            }
            isOpen={openCarrier === "UPS"}
            onToggle={() => setOpenCarrier(openCarrier === "UPS" ? null : "UPS")}
          />
        </div>
      )}

      {/* Shipping Summary */}
      {shippingCost && (
        <div className="shipping-summary">
          <h3>Shipping Cost: ${shippingCost.toFixed(2)}</h3>
          <h4>Tax ({(taxRate * 100).toFixed(2)}%): ${taxAmount.toFixed(2)}</h4>
          <h3>Grand Total: ${grandTotal.toFixed(2)}</h3>
        </div>
      )}

      <button onClick={handleProceedToCheckout} className="checkout-button">
        Proceed to Checkout
      </button>

      {/* Summary Modal */}
      {showSummaryModal && (
        <CheckoutSummary
          cart={cart}                  // pass the entire cart
          shippingCost={shippingCost}
          taxAmount={taxAmount}
          grandTotal={grandTotal}
          selectedCarrier={selectedCarrier}
          selectedService={selectedService}
          receiverZip={receiverZip}
          onClose={() => setShowSummaryModal(false)}
        />
      )}
    </div>
  );
};

export default UserCart;
