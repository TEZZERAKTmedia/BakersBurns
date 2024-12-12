import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../config/axios';
import QuantitySelector from './numberWheel';
import AddProduct from '../Components/addProductForm';
import StatusBanner from '../Components/statusBanner';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [users, setUsers] = useState([]); // State to hold the list of users
  const [selectedProducts, setSelectedProducts] = useState([]); // Products added to the order
  const [productOptions, setProductOptions] = useState([]); // Dropdown product list
  const [products, setProducts] = useState([]); // Ensure this is declared
  const addProductFormRef = useRef(null); // Ref for Add Product Form
  const productBoxRef = useRef(null); //
  const [showAddProductButton, setShowAddProductButton] = useState(false);

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
      const response = await adminApi.get('/api/products/');
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
    
    const handleSelectProduct = (product) => {
      setSelectedProducts((prev) => [...prev, product]);
      setProductOptions((prev) => prev.filter((item) => item.id !== product.id));
    };
  
    const handleRemoveProduct = (product) => {
      setProductOptions((prev) => [...prev, product]);
      setSelectedProducts((prev) => prev.filter((item) => item.id !== product.id));
    };
    

    const fetchUsers = async () => {
      try {
        const response = await adminApi.get('/orders/get-users');
        setUsers(response.data.users); // Store usernames in the state
      } catch (error) {
        console.error('Error fetching users:', error);
      } 
    };

    const createOrder = async () => {
      try {
        const orderData = {
          ...newOrder,
          orderItems: selectedProducts.map((product) => ({
            productId: product.id,
            quantity: newOrder.quantity,
          })),
        };
        await adminApi.post('/orders/create', orderData)
        fetchOrders();
        setDialogOpen(false);
        console.log('Order Created:', orderData);
      } catch (error) {
        console.error('Error creating order:', error);
      }
    };


  
    const handleProductAdded = async (newProduct) => {
      try {
        setProducts((prev) => [...prev, newProduct]); // Optimistic update
        await fetchProducts(); // Refresh product list
      } catch (error) {
        console.error('Error fetching updated product list:', error);
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
  const handleScroll = () => {
    if (productBoxRef.current) {
      const scrollTop = productBoxRef.current.scrollTop;
      setShowAddProductButton(scrollTop > 0); // Show button if scrolled down
    }
  };

  // Scroll to the Add Product form
  const scrollToAddProductForm = () => {
    if (addProductFormRef.current) {
      addProductFormRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <div style={styles.fixedContainer}>
      <h1 style={styles.title}>Order Management</h1>

          <button onClick={() => setDialogOpen(true)} style={styles.addButton}>
            Add Order
          </button>


          <AddProduct onProductAdded={handleProductAdded}/>

      <div style={styles.ordersContainer}>
        {orders.map((order) => (
          <div key={order.id} style={styles.orderCard}>
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
    overflowY: 'auto', // Add vertical scrolling
    maxHeight: '400px', // Limit height for scrollable area
    width: '100%',
    boxSizing: 'border-box', // Ensure padding is included in width/height
  },
  productList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '10px',
    padding: '10px',
    width:'50%',
    marginLeft: '0px',
  },
  productTile: {
    position: 'relative',
    border: '1px solid #ddd',
    borderRadius: '50px',
    width: '70%',
    padding: '10px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#f9f9f9',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',

  },
  productTileLabel: {
    backgroundColor:'black',
    padding: '5px',
    width: '100%',
    color: 'white',
    
  },
  productImage: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '20px',
    padding:'5px',

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
    maxWidth: '1200px', // Limit max width
    margin: '0 auto', // Center align in the page
    display: 'flex',
    flexDirection: 'column',
    gap: '20px', // Space between orders
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
