import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerApi } from "../config/axios";

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
    calculateTotal(storedCart);
  }, []);

  const calculateTotal = (cartItems) => {
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await registerApi.post('/register-cart/create-checkout-session', {
        cartItems: cart,
      });

      window.location.href = response.data.url; // Redirect to Stripe checkout
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to initiate checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Your cart is empty!</h2>
        <button
          onClick={() => navigate("/store")}
          style={{
            padding: "10px 20px",
            background: "linear-gradient(to right, #007bff, #0056b3)",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Back to Store
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Cart</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ marginTop: "20px" }}>
        {cart.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #ccc",
              padding: "10px 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={`${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/${item.thumbnail}`}
                alt={item.name}
                style={{ width: "80px", height: "80px", marginRight: "20px" }}
              />
              <div>
                <h4>{item.name}</h4>
                <p>${item.price.toFixed(2)}</p>
              </div>
            </div>
            <p>Quantity: {item.quantity}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "20px", textAlign: "right" }}>
        <h3>Total: ${totalPrice.toFixed(2)}</h3>
        <button
          onClick={handleCheckout}
          disabled={loading}
          style={{
            padding: "10px 20px",
            background: loading
              ? "grey"
              : "linear-gradient(to right, #28a745, #218838)",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {loading ? "Processing..." : "Proceed to Checkout"}
        </button>
      </div>
    </div>
  );
};

export default CartPage;
