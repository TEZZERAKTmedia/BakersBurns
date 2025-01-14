import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { adminApi } from '../../config/axios';
import './order_details.css';
import TrackingNumber from './tracking';

const OrderDetails = ({ orderId, onClose }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await adminApi.get(`/orders/${orderId}/details`);
        setOrderDetails(response.data.order); // Adjust for new API response format
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="order-details__modal-overlay">
        <div className="order-details__modal-container">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="order-details__modal-overlay">
        <div className="order-details__modal-container">
          <p>Order details not found.</p>
        </div>
      </div>
    );
  }

  const {
    total,
    user,
    status,
    shippingAddress,
    billingAddress,
    carrier,
    trackingNumber,
    trackingLink,
    items,
  } = orderDetails;

  return (
    <div className="order-details__modal-overlay">
      <div className="order-details__modal-container">
        <div className="fo">
          <h2>Order Details</h2>
          <button onClick={onClose} className="order-details__close-button">
            Close
          </button>
        </div>

        <div className="order-details__content">
          {/* General Information Section */}
          <div className="form-section">
            <h3>General Information</h3>
            <p><strong>Order ID:</strong> {orderId}</p>
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Total:</strong> ${total}</p>
            <p><strong>User:</strong> {user.username} ({user.email})</p>
          </div>

          {/* Addresses Section */}
          <div className="form-section">
            <h3 className="order-details__subheader">Addresses</h3>
            <p><strong>Shipping Address:</strong></p>
            {shippingAddress ? (
              <div>
                <p>{shippingAddress.line1}</p>
                {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                <p>{`${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}`}</p>
                <p>{shippingAddress.country}</p>
              </div>
            ) : (
              <p>N/A</p>
            )}
            <p><strong>Billing Address:</strong></p>
            {billingAddress ? (
              <div>
                <p>{billingAddress.line1}</p>
                {billingAddress.line2 && <p>{billingAddress.line2}</p>}
                <p>{`${billingAddress.city}, ${billingAddress.state} ${billingAddress.postal_code}`}</p>
                <p>{billingAddress.country}</p>
              </div>
            ) : (
              <p>Same as shipping address.</p>
            )}
          </div>

          {/* Tracking Information Section */}
          <div className="form-section">
            <h3>Tracking</h3>
            <TrackingNumber
              orderId={orderId}
              initialTrackingNumber={trackingNumber}
              initialCarrier={carrier}
              onTrackingUpdated={(newTrackingNumber, newCarrier) => {
                // Update the tracking information in state
                setOrderDetails((prevDetails) => ({
                  ...prevDetails,
                  trackingNumber: newTrackingNumber,
                  carrier: newCarrier,
                }));
              }}
            />
          </div>

          {/* Order Items Section */}
          <div className="form-section">
            <h3>Order Items</h3>
            <table className="order-details__table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={`${item.product.id}-${orderId}`}>
                    <td>{item.product.name}</td>
                    <td>{item.quantity}</td>
                    <td>${item.product.price.toFixed(2)}</td>
                    <td>${(item.quantity * item.product.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

OrderDetails.propTypes = {
  orderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default OrderDetails;
