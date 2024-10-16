import React, { useState, useEffect } from 'react';
import { adminApi } from '../config/axios';
import '../Pagecss/orders.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);  // Track editing mode
  const [newOrder, setNewOrder] = useState({
    userId: '',
    productId: '',
    quantity: '',
    shippingAddress: '',
    billingAddress: '',
    trackingNumber: '',
    carrier: '',
  });
  const fetchOrders = async () => {
    try {
      const response = await adminApi.get('/orders/get'); // Make an API call to fetch the orders
      console.log('API Response:', response.data.orders);
      setOrders(response.data.orders); // Assuming your API returns the orders inside a `data` object
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };
  // Fetch all orders


  
  

  // Create a new order
  const createOrder = async () => {
    try {
      await adminApi.post('/orders/create', newOrder);
      console.log(newOrder);

      setNewOrder({ userId: '', productId: '', quantity: '', shippingAddress: '', billingAddress: '' });
      fetchOrders();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  // Update an order (including tracking number and carrier)
  const updateOrder = async () => {
    try {
      await adminApi.post(`/orders/update/${selectedOrder.id}`, selectedOrder);
      fetchOrders();
      setSelectedOrder(null);
      setIsEditing(false);  // Exit editing mode after update
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  // Delete an order
  const deleteOrder = async (orderId) => {
    try {
      await adminApi.delete(`/orders/delete-order/${orderId}`);
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  // Open dialog for new order
  const handleNewOrderDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Handle input change for new and existing orders
  const handleInputChange = (e, isNew = false) => {
    const { name, value } = e.target;
    if (isNew) {
      setNewOrder((prev) => ({ ...prev, [name]: value }));
    } else {
      setSelectedOrder((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Copy Billing Address to Shipping Address
  const copyBillingToShipping = () => {
    if (selectedOrder) {
      setSelectedOrder((prev) => ({ ...prev, shippingAddress: prev.billingAddress }));
    } else {
      setNewOrder((prev) => ({ ...prev, shippingAddress: prev.billingAddress }));
    }
  };

  // Select an order to edit
  const selectOrderToEdit = (order) => {
    setSelectedOrder(order);  // Load order details into form
    setIsEditing(true);  // Enter editing mode
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
<h1>Order Management</h1>

{/* Orders Table */}
<table border="1" style={{ width: '100%', marginTop: '20px' }}>
    <thead>
    <tr>
      <th>Order ID</th>
      <th>Username</th>
      <th>Email</th>
      <th>Product Image</th> {/* Change from Product ID to Product Image */}
      <th>Quantity</th>
      <th>Shipping Address</th>
      <th>Billing Address</th>
      <th>Tracking Number</th>
      <th>Carrier</th>
      <th>Status</th>
      <th>Tracking Link</th>
    </tr>
  </thead>
  <tbody>
    {orders.map(order => (
      <tr key={order.id}>
        <td>{order.id}</td>
        <td>{order.username || 'Unknown'}
          {order.username && (
            <button onClick={() => copyToClipboard(order.username)}>Copy</button>
          )}
        </td>
        <td>{order.email || 'Unknown'}
          {order.email && (
            <button onClick={() => copyToClipboard(order.email)}>Copy</button>
          )}
        </td>
        <td>
        <img className="product-image" src={`http://localhost:3450/uploads/${order.productImage}`} alt={order.productName} />
        </td> {/* Display product image */}
        <td>{order.quantity}</td>
        <td>{order.shippingAddress}</td>
        <td>{order.billingAddress}</td>
        <td>{order.trackingNumber || 'No tracking available'}</td>
        <td>{order.carrier}</td>
        <td>{order.status}</td>
        <td>
          {order.trackingLink ? (
            <a href={order.trackingLink} target="_blank" rel="noopener noreferrer">
              Track your order
            </a>
          ) : (
            'No tracking available'
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>

      {/* Edit Order Dialog */}
      {selectedOrder && (
        <div style={{ marginTop: '20px' }}>
          <h2>Edit Order</h2>
          <div>
            <label>Status:</label>
            <input
              type="text"
              name="status"
              value={selectedOrder.status}
              onChange={(e) => handleInputChange(e)}
            />
          </div>
          <div>
            <label>Shipping Address:</label>
            <input
              type="text"
              name="shippingAddress"
              value={selectedOrder.shippingAddress}
              onChange={(e) => handleInputChange(e)}
            />
          </div>
          <div>
            <label>Billing Address:</label>
            <input
              type="text"
              name="billingAddress"
              value={selectedOrder.billingAddress}
              onChange={(e) => handleInputChange(e)}
            />
          </div>
          {/* Button to copy billing to shipping address */}
          <button onClick={copyBillingToShipping}>Use Billing Address for Shipping</button>
          <div>
            <label>Tracking Number:</label>
            <input
              type="text"
              name="trackingNumber"
              value={selectedOrder.trackingNumber || ''}
              onChange={(e) => handleInputChange(e)}
            />
          </div>
          <div>
            <label>Carrier:</label>
            <select
              name="carrier"
              value={selectedOrder.carrier || ''}
              onChange={(e) => handleInputChange(e)}
            >
              <option value="">Select Carrier</option>
              <option value="UPS">UPS</option>
              <option value="FedEx">FedEx</option>
              <option value="USPS">USPS</option>
              <option value="DHL">DHL</option>
            </select>
          </div>
          <button onClick={() => updateOrder(selectedOrder.id)}>Update Order</button>
          <button onClick={() => setSelectedOrder(null)}>Cancel</button>
        </div>
      )}

      {/* Create New Order Dialog */}
      {dialogOpen && (
        <div style={{ marginTop: '20px' }}>
          <h2>Create New Order</h2>
          <div>
            <label>User ID:</label>
            <input
              type="text"
              name="userId"
              value={newOrder.userId}
              onChange={(e) => handleInputChange(e, true)}
            />
          </div>
          <div>
            <label>Product ID:</label>
            <input
              type="text"
              name="productId"
              value={newOrder.productId}
              onChange={(e) => handleInputChange(e, true)}
            />
          </div>
          <div>
            <label>Quantity:</label>
            <input
              type="text"
              name="quantity"
              value={newOrder.quantity}
              onChange={(e) => handleInputChange(e, true)}
            />
          </div>
          <div>
            <label>Shipping Address:</label>
            <input
              type="text"
              name="shippingAddress"
              value={newOrder.shippingAddress}
              onChange={(e) => handleInputChange(e, true)}
            />
          </div>
          <div>
            <label>Billing Address:</label>
            <input
              type="text"
              name="billingAddress"
              value={newOrder.billingAddress}
              onChange={(e) => handleInputChange(e, true)}
            />
          </div>
          {/* Button to copy billing to shipping address for new orders */}
          <button onClick={copyBillingToShipping}>Use Billing Address for Shipping</button>
          <div>
            <label>Tracking Number:</label>
            <input
              type="text"
              name="trackingNumber"
              value={newOrder.trackingNumber || ''}
              onChange={(e) => handleInputChange(e, true)}
            />
          </div>
          <div>
            <label>Carrier:</label>
            <select
              name="carrier"
              value={newOrder.carrier || ''}
              onChange={(e) => handleInputChange(e, true)}
            >
              <option value="">Select Carrier</option>
              <option value="UPS">UPS</option>
              <option value="FedEx">FedEx</option>
              <option value="USPS">USPS</option>
              <option value="DHL">DHL</option>
            </select>
          </div>
          <button onClick={createOrder}>Create</button>
          <button onClick={handleCloseDialog}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
