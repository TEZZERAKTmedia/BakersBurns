import React, { useEffect, useState } from 'react';
import { adminApi } from '../../config/axios';
import './order_summary.css'; // Import CSS file

const OrderSummary = ({ orderId }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        const response = await adminApi.get(`/orders/${orderId}/details`);
        console.log('Order details:', response.data.order); // Log full order details
        setOrderDetails(response.data.order); // Adjust for new API response format
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to fetch order details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (isLoading) {
    return <p>Loading order summary...</p>;
  }

  if (error) {
    return <p className="order-summary-error">{error}</p>;
  }

  if (!orderDetails) {
    return <p className="order-summary-no-details">No order details available.</p>;
  }

  return (
    <div className="order-summary">
      <h3 className="order-summary-title">Order Summary</h3>

      <div className="order-summary-items">
      {orderDetails.items.map((item) => (
        <div key={item.productId} className="order-summary-item">
          <div className="order-thumbnail-container">
            <img
              src={`${import.meta.env.VITE_BACKEND}/uploads/${item.product?.thumbnail}`}
              alt={item.product?.name || 'Product Image'}
              className="order-thumbnail"
            />
            <span className="quantity-overlay">{item.quantity}</span>
          </div>
          <div className="order-product-name">{item.product?.name}</div>
        </div>
      ))}
    </div>

    </div>
  );
};

export default OrderSummary;
