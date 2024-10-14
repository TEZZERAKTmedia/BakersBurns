import React, { useState, useEffect } from 'react';
import { userApi } from '../config/axios';
import { loadStripe } from '@stripe/stripe-js'; // Import loadStripe from Stripe
import '../Componentcss/cart.css'; // CSS for styling

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY); // Load Stripe instance

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0); // Track total amount

  useEffect(() => {
    getCart();
  }, []);

  // Fetch cart items from the backend
  const getCart = async () => {
    try {
      const response = await userApi.get('/cart'); // Fetch cart items from backend
      setCartItems(response.data);
      calculateTotal(response.data); // Calculate total when cart items are fetched
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  // Calculate the total amount of the cart
  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);
    setTotalAmount(total);
  };

  // Handle Stripe Checkout
  const handleCheckout = async () => {
    try {
      const stripe = await stripePromise;
      const cartData = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price, // Send price per item
      }));

      // Send a POST request to the backend to create a Stripe session
      const response = await userApi.post('/stripe-checkout/create-checkout-session', { cartItems: cartData, totalAmount });

      const { sessionId } = response.data;
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        console.error('Stripe checkout error:', error);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      <div className="cart-items">
        {cartItems.map(item => (
          <div key={item.id} className="cart-item">
            <h3>{item.product.name}</h3>
            <p>Price: ${item.product.price}</p>
            <p>Quantity: {item.quantity}</p>
          </div>
        ))}
      </div>
      <div className="cart-total">
        <h3>Total: ${totalAmount.toFixed(2)}</h3>
      </div>
      <button onClick={handleCheckout} className="checkout-button">
        Proceed to Checkout
      </button>
    </div>
  );
};

export default Cart;
