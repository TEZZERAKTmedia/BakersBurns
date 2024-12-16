import React from 'react';
import { Link } from 'react-router-dom';
 // Create a CSS file for styling if needed

const Success = () => {
  return (
    <div className="success-container">
      <h1>Payment Successful!</h1>
      <p>Thank you for your purchase. Your order is confirmed.</p>
      <p>You can track your order using the link below.</p>
      
      <Link to="/orders" className="track-order-link">
        Track My Order
      </Link>
    </div>
  );
};

export default Success;
