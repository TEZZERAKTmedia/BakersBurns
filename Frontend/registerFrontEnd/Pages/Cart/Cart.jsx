import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerApi } from "../../config/axios";
import ShippingCalculator from "./shippingCalculator";
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
      try {
        const response = await registerApi.post("/register-cart/items", { sessionId });
        const fetchedCart = response.data.cartDetails || [];
  
        // ✅ Ensure all cart items have required fields
        fetchedCart.forEach(item => {
          if (!item.weight || !item.length || !item.width || !item.height) {
            console.error(`❌ Missing Data in Item ${item.id}:`, item);
            throw new Error(`Item ${item.name} is missing weight or dimensions.`);
          }
        });
  
        console.log("🛒 Cart Items (Verified):", fetchedCart);
        setCart(fetchedCart);
        calculateTotal(fetchedCart);
      } catch (err) {
        console.error("❌ Error fetching cart items:", err);
        setError("Error: Some items in your cart are missing required data.");
      }
    };
  
    fetchCartItems();
  }, []);
  

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
  const handleZipSubmit = () => {
    if (receiverZip.length === 5 && /^\d+$/.test(receiverZip)) {
      setZipSubmitted(true);
    } else {
      alert("Please enter a valid 5-digit ZIP code.");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-container empty" style={{ backgroundColor: "#555555ce", borderRadius: "20px" }}>
        <h2 style={{ color: "white" }}>Your cart is empty!</h2>
        <button onClick={() => navigate("/store")} className="cart-back-button">
          Back to Store
        </button>
      </div>
    );
  }

  

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

      {/* Shipping Calculator */}
      {zipSubmitted && (
        <ShippingCalculator cart={cart} receiverZip={receiverZip} setShippingCost={setShippingCost} />
      )}

      {/* Checkout Button (Disabled until ZIP is entered & shipping cost is retrieved) */}
      <div className="cart-summary">
        <h3 style={{ color: "white", padding: "10px" }}>Total: ${totalPrice.toFixed(2)}</h3>
        <Link
          to="/checkout-options"
          className={`proceed-checkout ${!zipSubmitted || !shippingCost ? "disabled" : ""}`}
          onClick={(e) => {
            if (!zipSubmitted || !shippingCost) {
              e.preventDefault();
              alert("Please enter ZIP code and calculate shipping before proceeding.");
            }
          }}
        >
          {loading ? "Processing..." : "Proceed to Checkout"}
        </Link>
      </div>
    
    </div>
  );
};

export default CartPage;
