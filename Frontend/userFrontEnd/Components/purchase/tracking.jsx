import React, { useState } from 'react';
import { userApi } from '../config/axios'; // Assuming this is set up for API requests

const Tracking = () => {
  const [orderId, setOrderId] = useState('');
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [error, setError] = useState(null);

  const handleTrackOrder = async () => {
    try {
      const response = await userApi.get(`/orders/track/${orderId}`);
      setTrackingInfo(response.data);
      setError(null); // Clear any previous errors
    } catch (err) {
      setTrackingInfo(null); 
      setError('Order not found or invalid ID.');
    }
  };

  return (
    <div className="tracking-container">
      <h1>Track Your Order</h1>
      <input 
        type="text" 
        placeholder="Enter your Order ID" 
        value={orderId} 
        onChange={(e) => setOrderId(e.target.value)} 
      />
      <button onClick={handleTrackOrder}>Track Order</button>

      {trackingInfo && (
        <div className="tracking-info">
          <h3>Tracking Information</h3>
          <p>Order Status: {trackingInfo.status}</p>
          <p>Order Number: {trackingInfo.orderNumber}</p>
          {/* Add other tracking details */}
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Tracking;
