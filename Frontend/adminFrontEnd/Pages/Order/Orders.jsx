import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../../config/axios';
import QuantitySelector from '../numberWheel';
import AddProduct from './simpleProductForm';
import StatusBanner from '../../Components/statusBanner';
import AddOrderForm from './AddOrderForm';
import TrackingNumber from './tracking';
import OrderDetailsModal from './OrderDetailsModal';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [users, setUsers] = useState([]); // State to hold the list of users
  const [productOptions, setProductOptions] = useState([]);


  const [showProductDropdown, setShowProductDropdown] = useState(false); // Toggle dropdown window


  const [newOrder, setNewOrder] = useState({
    username: '',
    shippingAddress: '',
    
    trackingNumber: '',
    carrier: '',
    total: '',
    orderItems: [
      { productId: '', quantity: '', price: '' }, // Initial item
    ],
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

    
    
  
    fetchProducts();
    fetchUsers();
    fetchOrders();
  }, []);
  const fetchProducts = async () => {
    try {
      const response = await adminApi.get('/products');
      console.log('Fetched products:', response.data);

      setProductOptions(
        response.data.map((product) => ({
          id: product.id,
          name: product.name,
          image: product.image || null, // Ensure image field is set correctly or null
          price: product.price,
        }))
      );
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleInputChange = (e, isEditing = false) => {
    const { name, value } = e.target;
    if (isEditing) {
      setEditingOrder((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewOrder((prev) => ({ ...prev, [name]: value }));
    }
  };
    //ITEM MANAGEMT

    

    const fetchUsers = async () => {
      try {
        const response = await adminApi.get('/orders/get-users');
        setUsers(response.data.users); // Store usernames in the state
      } catch (error) {
        console.error('Error fetching users:', error);
      } 
    };

  
    useEffect(() => {
      fetchProducts();
    }, []);


  const deleteOrder = async (orderId) => {
    try {
      await adminApi.delete(`/orders/delete/${orderId}`);
      fetchOrders(); // Refresh the orders list after deletion
    } catch (error) {
      console.error('Error deleting order:', error);
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
  const handleViewDetails = (orderId) => {
    console.log('Opening details for order:', orderId); // Debugging log
    setSelectedOrderId(orderId);
    setIsOrderDetailsOpen(true);
  };

  // Function to close the modal
  const closeOrderDetails = () => {
    setSelectedOrderId(null);
    setIsOrderDetailsOpen(false);
  };



  // Scroll to the Add Product form

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  return (
    <div style={styles.fixedContainer}>
   
      

          <button onClick={() => setDialogOpen(true)} style={styles.addButton}>
            Add Order
          </button>

          {dialogOpen && (
        <AddOrderForm
          onClose={() => setDialogOpen(false)}
          onOrderCreated={fetchOrders}
        />
      )}
      {isOrderDetailsOpen && selectedOrderId && (
                <OrderDetailsModal
                  orderId={selectedOrderId}
                  onClose={() => setIsOrderDetailsOpen(false)}
                />
              )}
          

      <div style={styles.ordersContainer}>
        {orders.map((order) => (
          <div key={order.id} style={styles.orderCard}  onClick={() => handleViewDetails(order.id)}>
            <div style={styles.orderSection}>
            <StatusBanner status={order.status} />
              {order.productImage ? (
                <img
                  src={`${import.meta.env.VITE_BACKEND}/uploads/${order.productImage}`}
                  alt="Order Product"
                  style={styles.image}
                />
              ) : (
                <p>No image available</p>
              )}
            </div>
            {editingOrderId === order.id ? (
              <div>
                {['userId', 'productId', 'quantity', 'shippingAddress', 'billingAddress', 'trackingNumber', 'total'].map((field) => (
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
                  <label style={styles.formLabel}>Carrier:</label>
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
                <button
                onClick={() => deleteOrder(order.id)}
                style={styles.closeButton}
              >
                Delete
              </button>
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
            <div style={{margin:'10px'}}>
  `          <TrackingNumber
              orderId={order.id}
              initialTrackingNumber={order.trackingNumber}
              initialCarrier={order.carrier}
              onTrackingUpdated={(newTrackingNumber, newCarrier) => {
                // Update the tracking number in the order state
                setOrders((prevOrders) =>
                  prevOrders.map((o) =>
                    o.id === order.id
                      ? { ...o, trackingNumber: newTrackingNumber, carrier: newCarrier }
                      : o
                  )
                );
              }}
            />
          </div>

          <div >
                <button onClick={() => { setEditingOrderId(order.id); setEditingOrder(order); }} style={styles.editButton}>Edit</button>
          </div>
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
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    display: 'flex', // Use flexbox
    flexDirection: 'column', // Align content vertically
    alignItems: 'center', // Center align items horizontally
    gap: '20px', // Add spacing between sections
    
   
  },
  title: {
    fontSize: '2rem',
    marginBottom: '20px',

  },
  addButton: {
    padding: '10px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    margin:'20px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Ensure it overlays above all content
  },
  modal: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    width: '80%',
    maxWidth: '800px',
    height:'70%',
    overflowY: 'auto', // Allow scrolling within the modal
    maxHeight: '90vh', // Ensure modal doesn't overflow the viewport
  },

  formSection: {
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
    padding: '10px',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
  },
  input: {
    padding: '8px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    width: '100%',
  },
  textarea: {
    padding: '8px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    height: '60px',
    width: '100%',
  },
  boxContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
  },
  box: {
    flex: 1,
    border: '1px solid #ccc',
    borderRadius: '10px',
    padding: '10px',
    overflowY: 'auto',
    maxHeight: '400px', // Limit height for scrolling
    width: '100%', // Full width of parent container
    maxWidth: '800px', // Explicit maximum width
    boxSizing: 'border-box', // Include padding in width
    margin: '0 auto', // Center horizontally
    
  },
  
  productList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '10px',
    padding: '10px',
    justifyContent: 'center', // Center grid items in the parent
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor:'black'
  },
  
  
  
  productTile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '10px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
    width: '100%', // Fit inside grid column
    maxWidth: '120px', // Prevent excessive width
    
    textAlign: 'center',
    boxSizing: 'border-box', // Include padding in width
  },

  
  productImage: {
    width: '50%', // Scale to container width
    height: 'auto', // Maintain aspect ratio
    maxHeight: '150px', // Prevent excessive height
    objectFit: 'contain', // Ensure image fits within tile
    borderRadius: '5px',
    padding: '5px',
  },
  
  productTileLabel: {
    backgroundColor:'black',
    padding: '5px',
    width: '100%',
    color: 'white',
    
  },

  closeButton: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    backgroundColor: 'red',
    color: '#fff',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  floatingButton: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "1.5rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
  },
  buttonContainer: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%'
  },
  createButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  closeButton: {
    padding: '10px 20px',
    backgroundColor: 'red',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    
  },
  ordersContainer: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxHeight: '70vh', // Limit height for scrolling
    overflowY: 'auto', // Enable vertical scrolling
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '10px',
    backgroundColor: '#f9f9f9', // Light background for readability
  },
  productList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', // Adjust column size for better spacing
    gap: '15px',
    padding: '10px',
  },
  productTile: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '10px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  orderCard: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column', // Stack content vertically
    gap: '10px',
    width: '100%', // Ensure card takes up full container width
  },
  productTile: {
    width: '100%', // Ensure full width inside parent
    maxWidth: '200px', // Limit individual tile size
    margin: '0 auto', // Center within the grid
  },
};


export default OrderManagement;
