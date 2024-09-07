import React, { useState, useEffect, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { userApi } from '../config/axios';
import { AuthContext } from '../authProvider'; // Import the AuthContext
import '../Componentcss/cart.css'; // Import the CSS file for styling

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Cart = () => {
  const [cartItems, setCartItems] = useState([]); // array destructuring
  const { userId, token } = useContext(AuthContext); // object destructuring

  useEffect(() => {
    if (userId) {
      fetchCartItems();
    }
  }, [userId]);

  // Fetch cart items from the backend
  const fetchCartItems = async () => {
    try {
      if (!userId || !token) {
        console.error('User not authenticated');
        return;
      }
      const response = await userApi.get(`/api/cart/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}` // Correct use of template literals
        }
      });
      console.log('Cart items response:', response.data);
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  // Handle removing an item from the cart
  const handleRemoveFromCart = async (productId) => {
    try {
      if (!userId || !token) {
        console.error('User not authenticated');
        return;
      }
      await userApi.delete(`/api/cart/${userId}/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}` // Correct use of template literals
        }
      });
      fetchCartItems();
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  // Handle Stripe Checkout with only available items
  const handleCheckout = async () => {
    const availableItems = cartItems.filter(item => item.product.isAvailable); // Only include available items
    if (availableItems.length === 0) {
      console.error('No items available for checkout');
      return;
    }

    try {
      const stripe = await stripePromise;
      if (!userId || !token) {
        console.error('User not authenticated');
        return;
      }
      const response = await userApi.post('/api/checkout/create-checkout-session', { cartItems: availableItems }, {
        headers: {
          'Authorization': `Bearer ${token}` // Correct use of template literals
        }
      });
      const { id: sessionId } = response.data;
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        console.error('Error redirecting to Stripe checkout:', error);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

  return (
    <div className="cart-container">
      <h2>Cart</h2>
      <div className="cart-grid">
        {Array.isArray(cartItems) && cartItems.map(item => (
          <div key={item.id} className={`cart-item ${!item.product.isAvailable ? 'unavailable' : ''}`}>
            <div className="cart-item-details">
              <h3>{item.product.name}</h3>
              <div className="image-container">
                <img src={`http://localhost:3450/uploads/${item.product.image}`} alt={item.product.name} />
              </div>
              <p className="cart-text">Quantity: {item.quantity}</p>
              <p className="cart-text">Price: ${item.product.price}</p>
              {!item.product.isAvailable && (
                <p className="unavailable-message">Sorry, this item has just been purchased</p>
              )}
            </div>
            <button 
              onClick={() => handleRemoveFromCart(item.productId)} 
              className="cart-item-remove" 
              disabled={!item.product.isAvailable} // Disable the button for unavailable items
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button onClick={handleCheckout} className="cart-checkout">Checkout</button>
    </div>
  );
};

export default Cart;
