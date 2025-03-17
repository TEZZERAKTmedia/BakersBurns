import React, { useState, useEffect } from 'react';
import { registerApi } from '../../config/axios';

const GuestCheckout = () => {
  const [cartItems, setCartItems] = useState([]); // Items with full details from the backend
  const [guestEmail, setGuestEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    line1: '',
    city: '',
    state: '',
    postal_code: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart items from localStorage and send their IDs/quantities to the backend
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        // Retrieve cart from localStorage
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];

        // Prepare the array of product IDs and quantities
        const itemsToFetch = storedCart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        }));

        if (itemsToFetch.length === 0) {
          setCartItems([]); // If no items in cart, set empty cart
          return;
        }

        // Send to the backend
        const response = await registerApi.post('/register-cart/items', {
          items: itemsToFetch, // Backend expects an array of { productId, quantity }
        });

        setCartItems(response.data.cartDetails || []);
      } catch (err) {
        console.error('Failed to fetch cart items:', err);
        setError('Failed to fetch cart items. Please try again.');
      }
    };

    fetchCartItems();
  }, []);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!guestEmail || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postal_code) {
      setError('Please fill out all the fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await registerApi.post('/register-cart/create-checkout-session', {
        cartItems,
        guestEmail,
        shippingAddress,
      });

      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to initiate checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="privacy-terms-container">
      <h2>Guest Checkout</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleCheckout}>
        <label>Email:</label>
        <input
          type="email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />

        <label>Shipping Address:</label>
        <input
          type="text"
          placeholder="Street Address"
          value={shippingAddress.line1}
          onChange={(e) =>
            setShippingAddress({ ...shippingAddress, line1: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="City"
          value={shippingAddress.city}
          onChange={(e) =>
            setShippingAddress({ ...shippingAddress, city: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="State"
          value={shippingAddress.state}
          onChange={(e) =>
            setShippingAddress({ ...shippingAddress, state: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="Postal Code"
          value={shippingAddress.postal_code}
          onChange={(e) =>
            setShippingAddress({
              ...shippingAddress,
              postal_code: e.target.value,
            })
          }
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </form>

      <div className="cart-summary">
        <h3>Cart Summary</h3>
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <p>
                <strong>{item.name}</strong> x {item.quantity}
              </p>
              <p>${(item.price / 100).toFixed(2)}</p>
            </div>
          ))
        ) : (
          <p>Your cart is empty.</p>
        )}
      </div>
    </div>
  );
};

export default GuestCheckout;
