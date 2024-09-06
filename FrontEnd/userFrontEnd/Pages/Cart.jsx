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

  const handleCheckout = async (cartItems) => {
    try {
      const stripe = await stripePromise;
      if (!userId || !token) {
        console.error('User not authenticated');
        return;
      }
      const response = await userApi.post('/api/payment/create-checkout-session', { cartItems }, {
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
          <div key={item.id} className="cart-item">
            <div className="cart-item-details">
              <h3>{item.product.name}</h3>
              <div className="image-container">
              <img src={`http://localhost:3450/uploads/${item.product.image}`} alt={item.product.name} />
              </div>
              <p className="cart-text">Quantity: {item.quantity}</p>
              <p className="cart-text">Price: ${item.product.price}</p>
              
            </div>
            <button onClick={() => handleRemoveFromCart(item.productId)} className="cart-item-remove"> Remove </button>
          </div>
        ))}
      </div>
      <button onClick={() => handleCheckout(cartItems)} className="cart-checkout">Checkout</button>
    </div>
  );
};

export default Cart;
