import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerApi } from "../../config/axios";
import UPSRates from "./upsRates";
import FedExRates from "./fedexRates";
import USPSRates from "./uspsRates";
import TrashIcon from "../../assets/Icons/trash.png";
import "./cart.css";

// Dummy tax rate lookup based on ZIP code prefix.
// (Update with your own logic or an API call if desired.)
const getTaxRateForZip = (zip) => {
  if (!zip || zip.length < 1) return 0;
  // For demonstration:
  // If ZIP starts with "9", assume CA tax: 7.25%
  // If ZIP starts with "1", assume NY tax: 8.875%
  // Otherwise, default to 6%
  if (zip.startsWith("9")) return 0.0725;
  if (zip.startsWith("1")) return 0.08875;
  return 0.06;
};

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [receiverZip, setReceiverZip] = useState("");
  const [shippingCost, setShippingCost] = useState(null);
  const [zipSubmitted, setZipSubmitted] = useState(false);
  // State to track which carrier dropdown is open: "UPS", "FedEx", "USPS", or null.
  const [openCarrier, setOpenCarrier] = useState(null);
  const navigate = useNavigate();

  const getSessionId = () => {
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("sessionId", sessionId);
    }
    return sessionId;
  };

  const sessionId = getSessionId();

  const saveShippingOption = (shippingData) => {
    const dataToStore = {
      shippingData,
      timestamp: Date.now(), // Optional: add a timestamp if you want to expire it later.
    };
    localStorage.setItem("shippingOption", JSON.stringify(dataToStore));
  };
  

  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      try {
        const response = await registerApi.post("/register-cart/items", { sessionId });
        const fetchedCart = response.data.cartDetails || [];
        setCart(fetchedCart);
        calculateTotal(fetchedCart);
      } catch (err) {
        console.error("❌ Error fetching cart items:", err);
        setError("Error loading cart items.");
      } finally {
        setLoading(false);
      }
    };
    fetchCartItems();
  }, [sessionId]);

  const calculateTotal = (cartItems) => {
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalPrice(total);
  };

  // Calculate Total Weight & Dimensions Dynamically
  const totalWeight = cart.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  const totalDimensions = cart.reduce(
    (dims, item) => ({
      length: dims.length + item.length * item.quantity,
      width: Math.max(dims.width, item.width),
      height: Math.max(dims.height, item.height),
    }),
    { length: 0, width: 0, height: 0 }
  );

  const handleQuantityChange = async (id, newQuantity) => {
    try {
      const updatedCart = cart.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
      );
      setCart(updatedCart);
      calculateTotal(updatedCart);
      await registerApi.post("/register-cart/add-guest-cart", {
        sessionId,
        productId: id,
        quantity: newQuantity,
      });
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError("Failed to update quantity.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await registerApi.post("/register-cart/delete-cart-item", {
        sessionId,
        productId: id,
        quantity: 0,
      });
      const updatedCart = cart.filter((item) => item.id !== id);
      setCart(updatedCart);
      calculateTotal(updatedCart);
    } catch (err) {
      console.error("Error deleting item:", err);
      setError("Failed to remove item.");
    }
  };

  const handleZipSubmit = () => {
    if (receiverZip.length === 5 && /^\d+$/.test(receiverZip)) {
      setZipSubmitted(true);
    } else {
      alert("Please enter a valid 5-digit ZIP code.");
    }
  };

  // Calculate tax rate, tax amount, and grand total if shippingCost is set.
  const taxRate = zipSubmitted ? getTaxRateForZip(receiverZip) : 0;
  const taxAmount = shippingCost ? (totalPrice + shippingCost) * taxRate : 0;
  const grandTotal = shippingCost ? totalPrice + shippingCost + taxAmount : totalPrice;

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

  return (
    <div className="form-section">
      <h2 className="cart-title">Your Cart</h2>
      {error && <p className="cart-error">{error}</p>}
      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <img
                src={`${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/${item.thumbnail}`}
                alt={item.name}
                className="cart-item-image"
              />
              <div className="cart-item-details">
                <h4 className="cart-item-name">{item.name}</h4>
                <p className="cart-item-price">${item.price.toFixed(2)}</p>
              </div>
              <img
                src={TrashIcon}
                style={{ height: "3vh", width: "auto", marginLeft: "50%" }}
                alt="Delete"
                className="delete-icon"
                onClick={() => handleDelete(item.id)}
              />
            </div>
            <div className="cart-item-quantity-control">
              <button className="blue-button" onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>-</button>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10))}
              />
              <button className="blue-button" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      {/* ZIP Code Entry */}
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
        <button className="blue-button" onClick={handleZipSubmit} disabled={zipSubmitted}>
          {zipSubmitted ? "ZIP Code Submitted" : "Submit ZIP Code"}
        </button>
      </div>

      {/* Carrier Rate Components */}
      {zipSubmitted && (
        <div className="carrier-buttons">
          <UPSRates
            receiverZip={receiverZip}
            totalWeight={totalWeight}
            totalDimensions={totalDimensions}
            onSelectRate={setShippingCost}
            isOpen={openCarrier === "UPS"}
            onToggle={() =>
              setOpenCarrier(openCarrier === "UPS" ? null : "UPS")
            }
          />
          <FedExRates
            receiverZip={receiverZip}
            totalWeight={totalWeight}
            totalDimensions={totalDimensions}
            onSelectRate={setShippingCost}
            isOpen={openCarrier === "FedEx"}
            onToggle={() =>
              setOpenCarrier(openCarrier === "FedEx" ? null : "FedEx")
            }
          />
          <USPSRates
            receiverZip={receiverZip}
            totalWeight={totalWeight}
            totalDimensions={totalDimensions}
            onSelectRate={setShippingCost}
            isOpen={openCarrier === "USPS"}
            onToggle={() =>
              setOpenCarrier(openCarrier === "USPS" ? null : "USPS")
            }
          />
        </div>
      )}

      {/* Display Selected Shipping Cost */}
      <div className="shipping-summary">
        <h3>Shipping Cost: {shippingCost ? `$${shippingCost.toFixed(2)}` : "Not Selected"}</h3>
        {shippingCost && (
          <>
            <h4>
              Tax ({(taxRate * 100).toFixed(2)}%): ${taxAmount.toFixed(2)}
            </h4>
            <h3>Grand Total: ${grandTotal.toFixed(2)}</h3>
          </>
        )}
      </div>

      {/* Checkout Button */}
      <Link
        
        to="/checkout-options"
        className={`proceed-checkout ${!shippingCost ? "disabled" : ""}`}
        onClick={(e) => {
          if (!shippingCost) {
            e.preventDefault();
            alert("Please select a shipping option before proceeding.");
          }
        }}
      >
        Proceed to Checkout
      </Link>
    </div>
  );
};

export default CartPage;
