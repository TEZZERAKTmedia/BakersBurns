import React, { useState, useEffect } from 'react';
import { adminApi } from '../config/axios';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    userId: '',
    productId: '',
    quantity: '',
    shippingAddress: '',
    billingAddress: '',
    trackingNumber: '',
    carrier: '',
  });
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingOrder, setEditingOrder] = useState({});

  const fetchOrders = async () => {
    try {
      const response = await adminApi.get('/orders/get');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleInputChange = (e, isEditing = false) => {
    const { name, value } = e.target;
    if (isEditing) {
      setEditingOrder((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewOrder((prev) => ({ ...prev, [name]: value }));
    }
  };

  const createOrder = async () => {
    try {
      await adminApi.post('/orders/create', newOrder);
      setNewOrder({ userId: '', productId: '', quantity: '', shippingAddress: '', billingAddress: '', trackingNumber: '', carrier: '' });
      fetchOrders();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const updateOrder = async (orderId) => {
    try {
      await adminApi.put(`/orders/update/${orderId}`, editingOrder);
      setEditingOrderId(null);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  // Function to get the tracking URL based on the carrier and tracking number
  const getTrackingLink = (carrier, trackingNumber) => {
    switch (carrier) {
      case 'UPS':
        return `https://www.ups.com/track?tracknum=${trackingNumber}`;
      case 'FedEx':
        return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}`;
      case 'USPS':
        return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
      case 'DHL':
        return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
      default:
        return null;
    }
  };

  return (
    <div style={styles.fixedContainer}>
      <h1 style={styles.title}>Order Management</h1>

      <button onClick={() => setDialogOpen(true)} style={styles.addButton}>
        Add Order
      </button>

      {dialogOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Create New Order</h2>
            {['userId', 'productId', 'quantity', 'shippingAddress', 'billingAddress', 'trackingNumber'].map((field) => (
              <div style={styles.inputGroup} key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                <input
                  type="text"
                  name={field}
                  value={newOrder[field]}
                  onChange={(e) => handleInputChange(e)}
                  style={styles.input}
                />
              </div>
            ))}
            <div style={styles.inputGroup}>
              <label>Carrier:</label>
              <select
                name="carrier"
                value={newOrder.carrier}
                onChange={(e) => handleInputChange(e)}
                style={styles.input}
              >
                <option value="">Select Carrier</option>
                <option value="UPS">UPS</option>
                <option value="FedEx">FedEx</option>
                <option value="USPS">USPS</option>
                <option value="DHL">DHL</option>
              </select>
            </div>
            <div style={styles.buttonContainer}>
              <button onClick={() => setDialogOpen(false)} style={styles.closeButton}>Cancel</button>
              <button onClick={createOrder} style={styles.createButton}>Create Order</button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.ordersContainer}>
        {orders.map((order) => (
          <div key={order.id} style={styles.orderCard}>
            <div style={styles.orderSection}>
              {order.productImage ? (
                <img
                  src={`${import.meta.env.VITE_DEVELOPMENT}/uploads/${order.productImage}`}
                  alt="Order Product"
                  style={styles.image}
                />
              ) : (
                <p>No image available</p>
              )}
            </div>
            {editingOrderId === order.id ? (
              <div>
                {['userId', 'productId', 'quantity', 'shippingAddress', 'billingAddress', 'trackingNumber'].map((field) => (
                  <div style={styles.inputGroup} key={field}>
                    <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                    <input
                      type="text"
                      name={field}
                      value={editingOrder[field] || ''}
                      onChange={(e) => handleInputChange(e, true)}
                      style={styles.input}
                    />
                  </div>
                ))}
                <div style={styles.inputGroup}>
                  <label>Carrier:</label>
                  <select
                    name="carrier"
                    value={editingOrder.carrier || ''}
                    onChange={(e) => handleInputChange(e, true)}
                    style={styles.input}
                  >
                    <option value="">Select Carrier</option>
                    <option value="UPS">UPS</option>
                    <option value="FedEx">FedEx</option>
                    <option value="USPS">USPS</option>
                    <option value="DHL">DHL</option>
                  </select>
                </div>
                <div style={styles.buttonContainer}>
                  <button onClick={() => updateOrder(order.id)} style={styles.createButton}>Save</button>
                  <button onClick={() => setEditingOrderId(null)} style={styles.closeButton}>Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={styles.orderSection}>
                  <strong>Order ID:</strong> {order.id}
                </div>
                <div style={styles.orderSection}>
                  <strong>Quantity:</strong> {order.quantity || 'N/A'}
                </div>
                <div style={styles.orderSection}>
              <strong>Status:</strong> {order.status}
            </div>
                <div style={styles.orderSection}>
                  <strong>Tracking Number:</strong> {order.trackingNumber || 'No tracking available'}
                </div>
                <div style={styles.orderSection}>
                  {order.carrier && order.trackingNumber ? (
                    <a
                      href={getTrackingLink(order.carrier, order.trackingNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.link}
                    >
                      Track your order
                    </a>
                  ) : (
                    <p>No tracking available</p>
                  )}
                </div>
                <button onClick={() => { setEditingOrderId(order.id); setEditingOrder(order); }} style={styles.editButton}>Edit</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Styles for inline layout with image rendering
const styles = {
  fixedContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f0f0f0',
  },
  title: {
    color: 'black',
    marginTop: '50px',
    textAlign: 'center',
    fontSize: '2.5em',
  },
  addButton: {
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '100%',
  },
  ordersContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center',
    overflowY: 'auto',
    height: 'calc(100vh - 200px)',
    padding: '10px',
  },
  orderCard: {
    flex: '1 1 300px',
    maxWidth: '400px',
    padding: '15px',
    backgroundColor: 'black',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',

  },
  orderSection: {
    marginBottom: '10px',
    fontSize: '1em',
    color: '#333',
  },
  image: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    color: 'black',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
    padding: '20px',
    boxSizing: 'border-box',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  createButton: {
    padding: '10px 15px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    flex: 1,
  },
  closeButton: {
    backgroundColor: 'red',
    padding: '10px 15px',
    fontSize: '1rem',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    flex: 1,
  },
  editButton: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#ffc107',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '100%',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
};

export default OrderManagement;
