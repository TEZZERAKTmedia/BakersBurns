import React, { useState, useEffect } from 'react';
import { userApi } from '../config/axios';
import '../Pagecss/orders.css';
import { motion } from 'framer-motion';

const Orders = () => {
  console.log('Orders component rendered'); // Root log

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState(null); // Optional: To display errors to users

  // Fetch all orders
  const fetchOrders = async () => {
    console.log('Fetching orders...'); // Log when fetch starts
    try {
      const response = await userApi.get('/user-orders/get-orders'); // Ensure this endpoint is correct
      console.log('API Response:', response.data.orders);
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error.response ? error.response.data : error.message);
      setError('Failed to fetch orders. Please try again later.');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="order-management-container">
      <h1 className="order-management-title">Order Management</h1>

      {error && <div className="error-message">{error}</div>} {/* Optional: Display error messages */}

      {/* Orders Grid */}
      <div className="orders-grid">
        {orders.length > 0 ? (
          orders.map(order => (
            <motion.div
              key={order.id}
              className="order-tile"
              onClick={() => fetchOrderDetails(order.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <h3>Order ID: {order.id}</h3>
              <p><strong>Username:</strong> {order.username || 'Unknown'}</p>
              <p><strong>Email:</strong> {order.email || 'Unknown'}</p>
              {order.productImage ? (
                <img
  className="product-image"
  src={`${import.meta.env.VITE_IMAGE_BASE_URL}/${order.productImage}`} 
  alt={order.productName}
/>

              ) : (
                <p>No image</p>
              )}
              <p><strong>Quantity:</strong> {order.quantity}</p>
              <p><strong>Status:</strong> {order.status || 'N/A'}</p>
              <p><strong>Tracking:</strong> {order.trackingNumber || 'No tracking available'}</p>
              <p><strong>Carrier:</strong> {order.carrier || 'N/A'}</p>
              <p>
                {order.trackingLink && order.trackingLink !== 'Tracking info not available' ? (
                  <a href={order.trackingLink} target="_blank" rel="noopener noreferrer">
                    Track your order
                  </a>
                ) : (
                  'No tracking available'
                )}
              </p>
            </motion.div>
          ))
        ) : (
          <p>No orders found.</p>
        )}
      </div>

      {/* Selected Order Details */}
      {selectedOrder && (
        <motion.div
          className="order-details"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Order Details</h2>
          <p><strong>Order ID:</strong> {selectedOrder.id}</p>
          <p><strong>Status:</strong> {selectedOrder.status}</p>
          <p><strong>Total:</strong> ${selectedOrder.total}</p>
          <p><strong>Shipping Address:</strong> {selectedOrder.shippingAddress}</p>
          <p><strong>Billing Address:</strong> {selectedOrder.billingAddress}</p>
          <p><strong>Tracking Number:</strong> {selectedOrder.trackingNumber || 'N/A'}</p>
          <p><strong>Carrier:</strong> {selectedOrder.carrier || 'N/A'}</p>
          <p><strong>Tracking Link:</strong> 
            {selectedOrder.trackingLink && selectedOrder.trackingLink !== 'Tracking info not available' 
              ? <a href={selectedOrder.trackingLink} target="_blank" rel="noopener noreferrer">Track Order</a> 
              : 'Tracking info not available'}
          </p>
          <h3>Products</h3>
          <ul>
            <li>
              <strong>{selectedOrder.productName}</strong> - {selectedOrder.productImage ? <img src={`http://localhost:3450/uploads/${selectedOrder.productImage}`} alt={selectedOrder.productName} /> : 'No image'}
            </li>
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default Orders;
