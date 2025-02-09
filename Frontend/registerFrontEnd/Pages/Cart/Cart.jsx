import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerApi } from "../../config/axios";
import UPSRates from "./upsRates";
import FedExRates from "./fedexRates";
import USPSRates from "./uspsRates";
import "./cart.css";

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [receiverZip, setReceiverZip] = useState("");
  const [shippingCost, setShippingCost] = useState(null);
  const [zipSubmitted, setZipSubmitted] = useState(false);
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
  }, []);

  const calculateTotal = (cartItems) => {
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalPrice(total);
  };

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
    <div className="cart-container">
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
            </div>
            <div className="cart-item-quantity-control">
              <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>-</button>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10))}
              />
              <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
            </div>
            <button onClick={() => handleDelete(item.id)} className="delete-button">Remove</button>
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
        <button onClick={handleZipSubmit} disabled={zipSubmitted}>
          {zipSubmitted ? "ZIP Code Submitted" : "Submit ZIP Code"}
        </button>
      </div>

      {/* Carrier Rate Components */}
      {zipSubmitted && (
        <div className="carrier-buttons">
          <UPSRates receiverZip={receiverZip} onSelectRate={setShippingCost} />
          <FedExRates receiverZip={receiverZip} onSelectRate={setShippingCost} />
          <USPSRates receiverZip={receiverZip} onSelectRate={setShippingCost} />
        </div>
      )}

      {/* Display Selected Shipping Cost */}
      <h3>Shipping Cost: {shippingCost ? `$${shippingCost.toFixed(2)}` : "Not Selected"}</h3>

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
