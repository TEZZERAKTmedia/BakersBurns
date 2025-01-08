import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerApi } from "../../config/axios";
import "./cart.css";

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Function to get or generate the session ID
  const getSessionId = () => {
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("sessionId", sessionId);
    }
    return sessionId;
  };

  const sessionId = getSessionId();

  // Fetch cart items from the backend
  useEffect(() => {
    const fetchCartItems = async () => {
      // Ensure sessionId is available
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        console.error("Session ID is missing. Please initialize it.");
        setError("Session ID is missing. Please refresh the page.");
        return;
      }
  
      console.log('Session ID in localStorage:', sessionId);
  
      try {
        const response = await registerApi.post("/register-cart/items", { sessionId });
        console.log("Fetched cart items:", response.data.cartDetails); // Debugging log
        setCart(response.data.cartDetails || []);
        calculateTotal(response.data.cartDetails || []);
      } catch (err) {
        console.error("Error fetching cart items:", err);
        setError("Failed to fetch cart items. Please try again later.");
      }
    };
  
    fetchCartItems();
  }, []); // Dependency array includes sessionId only if it's derived from state/props
  

  const calculateTotal = (cartItems) => {
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  };

  const handleQuantityChange = async (id, newQuantity) => {
    try {
      const updatedCart = cart.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
      );
      setCart(updatedCart);
      calculateTotal(updatedCart);

      // Update the quantity in the backend
      await registerApi.post("/register-cart/add-guest-cart", {
        sessionId,
        productId: id,
        quantity: newQuantity,
      });
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError("Failed to update quantity. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      // Remove item from cart in the backend
      await registerApi.post("/register-cart/delete-cart-item", {
        sessionId,
        productId: id,
        quantity: 0, // Sending 0 removes the product from the cart
      });

      // Remove item locally
      const updatedCart = cart.filter((item) => item.id !== id);
      setCart(updatedCart);
      calculateTotal(updatedCart);
    } catch (err) {
      console.error("Error deleting item:", err);
      setError("Failed to remove item. Please try again.");
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await registerApi.post("/register-cart/create-checkout-session", {
        sessionId,
      });

      window.location.href = response.data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Failed to initiate checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-container empty" style={{backgroundColor:'#555555ce', borderRadius:'20px'}}>
        <h2 style={{ color: 'white'}}>Your cart is empty!</h2>
        <button
          onClick={() => navigate("/store")}
          className="cart-back-button"
        >
          Back to Store
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container" style={{backgroundColor:'#555555ce', borderRadius:'20px'}}>
      <h2 className="cart-title" style={{color:'white'}}>Your Cart</h2>
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
                <p className="cart-item-price" >${item.price.toFixed(2)}</p>
              </div>
            </div>
            <div className="cart-item-quantity-control">
              <button
                onClick={() =>
                  handleQuantityChange(item.id, item.quantity - 1)
                }
                className="quantity-button"
              >
                -
              </button>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleQuantityChange(item.id, parseInt(e.target.value, 10))
                }
                className="quantity-input"
              />
              <button
                onClick={() =>
                  handleQuantityChange(item.id, item.quantity + 1)
                }
                className="quantity-button"
              >
                +
              </button>
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              className="delete-button"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h3 style={{color:'white', padding: '10px'}}>Total: ${totalPrice.toFixed(2)}</h3>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="checkout-button"
        >
          {loading ? "Processing..." : "Proceed to Checkout"}
        </button>
      </div>
    </div>
  );
};

export default CartPage;
