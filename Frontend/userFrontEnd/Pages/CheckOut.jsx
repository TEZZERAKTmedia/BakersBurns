// UserApp/src/pages/Checkout.jsx
import React, { useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { userApi } from 'axios';

const stripePromise = loadStripe('your-publishable-key-here');

const Checkout = () => {
  useEffect(() => {
    const createCheckoutSession = async () => {
      const response = await userApi.post('/api/payment/create-checkout-session', {
        cartItems: [
          // Example cart items
          { name: 'Product 1', price: 1000, quantity: 1 },
          { name: 'Product 2', price: 2000, quantity: 2 },
        ],
      });

      const { id } = response.data;
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: id });
    };

    createCheckoutSession();
  }, []);

  return (
    <div>
      <h2>Checkout</h2>
      <p>Redirecting to Stripe...</p>
    </div>
  );
};

export default Checkout;
