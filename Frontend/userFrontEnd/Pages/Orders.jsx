import React, { useState, useEffect } from 'react';
import { userApi } from '../config/axios';
import '../Pagecss/orders.css';
import { motion } from 'framer-motion';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await userApi.get('/user-orders/get-orders');

      setOrders(response.data.orders);
    } catch (error) {
      setError('Failed to fetch orders. Please try again later.');
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await userApi.get(`/user-orders/get-order-details/${orderId}`);
      
      const order = response.data.order;
  
      // Ensure that shipping and billing addresses are objects
      if (typeof order.shippingAddress === 'string') {
        order.shippingAddress = JSON.parse(order.shippingAddress);
      }
      if (typeof order.billingAddress === 'string') {
        order.billingAddress = JSON.parse(order.billingAddress);
      }
  
      setSelectedOrder(order);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      setError('Failed to fetch order details. Please try again later.');
    }
  };
  

  useEffect(() => {
    fetchOrders();
  }, []);

  const getTrackingLink = (carrier, trackingNumber) => {
    if (!carrier || !trackingNumber) return null;
    switch (carrier.toLowerCase()) {
      case 'ups':
        return `https://www.ups.com/track?tracknum=${trackingNumber}`;
      case 'fedex':
        return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}`;
      case 'usps':
        return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
      case 'dhl':
        return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
      default:
        return null;
    }
  };

  return (
    <div className="order-management-container">
      <h1 className="order-management-title">Order Management</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="orders-grid">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order.id}
              className="order-tile"
              onClick={() => fetchOrderDetails(order.id)}
            >
              <h3>Order ID: {order.id}</h3>
              <p>
                <strong>Username:</strong> {order.username || 'Unknown'}
              </p>
              <p>
                <strong>Email:</strong> {order.email || 'Unknown'}
              </p>
              <p>
                <strong>Tracking:</strong> {order.trackingNumber || 'No tracking available'}
              </p>
              <p>
                <strong>Carrier:</strong> {order.carrier || 'N/A'}
              </p>
              <p>
                {order.carrier && order.trackingNumber ? (
                  <a
                    href={getTrackingLink(order.carrier, order.trackingNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tracking-link-button"
                  >
                    Track your order
                  </a>
                ) : (
                  'No tracking available'
                )}
              </p>
            </div>
          ))
        ) : (
          <p>No orders found.</p>
        )}
      </div>

      {selectedOrder && (
  <>
    {/* Backdrop */}
    <button className="close-button" style={{backgroundColor:'#ff5050', color: 'white'}} onClick={() => setSelectedOrder(null)}>X</button>
    <div className="backdrop" onClick={() => setSelectedOrder(null)}>
  <motion.div
    className="order-details"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >

    <h2>Order Details</h2>

    {/* Details grouped into tiles */}

    <div className="detail-tile">
      <label><strong>Status:</strong></label>
      <p>{selectedOrder.status}</p>
    </div>


    <div className="detail-tile">
      <label><strong>Total:</strong></label>
      <p>${Number(selectedOrder.total).toFixed(2)}</p>
    </div>
    <div className="detail-tile">
      <label><strong>Shipping Address:</strong></label>
      <p>
        {selectedOrder.shippingAddress.line1}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
      </p>
    </div>



    <div className="detail-tile">
      <label><strong>Tracking Link:</strong></label>
      <p>
        {selectedOrder.carrier && selectedOrder.trackingNumber ? (
          <a
            href={getTrackingLink(selectedOrder.carrier, selectedOrder.trackingNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="tracking-link-button"
          >
            Track Order
          </a>
        ) : (
          'Tracking info not available'
        )}
      </p>
    </div>

    <h3>Products</h3>
    <ul>
      {selectedOrder.items.map((item) => (
        <div className="detail-tile" key={item.productName} style={{marginTop:'10px'}}>
          <label><strong>{item.productName}:</strong></label>
          <img
            className="product-image"
            src={item.productImage || 'https://via.placeholder.com/100'}
            alt={item.productName}
          />
          <p>{item.quantity} x ${item.price.toFixed(2)}</p>
        </div>
      ))}
    </ul>
  </motion.div>
</div>

  </>
)}

    </div>
  );
};

export default Orders;
