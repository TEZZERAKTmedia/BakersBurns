import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../../config/axios';
import SimpleProductUploader from './simpleProductForm';
import './add_order_form.css'; // Import the CSS file

const AddOrderForm = ({ onClose, onOrderCreated }) => {
  const [users, setUsers] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [newOrder, setNewOrder] = useState({
    username: '',
    shippingAddress: '',
    trackingNumber: '',
    carrier: '',
    orderItems: [],
  });
  const productBoxRef = useRef(null);
  const addProductFormRef = useRef(null);
  const [showAddProductButton, setShowAddProductButton] = useState(true);
  const [isAddProductFormOpen, setIsAddProductFormOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchProducts();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminApi.get('/orders/get-users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await adminApi.get('/products');
      setProductOptions(
        response.data.map((product) => ({
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          thumbnail: product.thumbnail,
        }))
      );
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrder((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectProduct = (product) => {
    setSelectedProducts((prev) => [...prev, { ...product, quantity: 1 }]);
    setProductOptions((prev) => prev.filter((item) => item.id !== product.id));
  };

  const handleRemoveProduct = (product) => {
    setSelectedProducts((prev) => prev.filter((item) => item.id !== product.id));
    setProductOptions((prev) => [...prev, product]);
  };

  const handleIncreaseQuantity = (productId) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, quantity: (product.quantity || 1) + 1 }
          : product
      )
    );
  };

  const handleDecreaseQuantity = (productId) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === productId && product.quantity > 1
          ? { ...product, quantity: product.quantity - 1 }
          : product
      )
    );
  };

  const createOrder = async () => {
    try {
      const orderData = {
        ...newOrder,
        orderItems: selectedProducts.map((product) => ({
          productId: product.id,
          quantity: product.quantity,
        })),
        total: calculateTotal(),
      };
      await adminApi.post('/orders/create', orderData);
      onOrderCreated();
      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const calculateTotal = () => {
    return selectedProducts.reduce(
        (total, product ) => total + product.price * (product.quantity || 1),
        0
    )
  }

  const calculateGrandTotal = () => {
    const productTotal = calculateTotal();
    const additionalCosts = 0;
    return productTotal + additionalCosts;
  }

  const handleScroll = () => {
    if (productBoxRef.current) {
      const scrollTop = productBoxRef.current.scrollTop;
      setShowAddProductButton(scrollTop > 0);
    }
  };

  const scrollToAddProductForm = () => {
    if (addProductFormRef.current) {
      addProductFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="add-order-modal-overlay">
      <div className="add-order-modal">
        <h2>Create New Order</h2>
        <div className="add-order-input-container">
          <div className="add-order-form-section">
            <label>Username:</label>
            <select
              name="username"
              value={newOrder.username}
              onChange={handleInputChange}
              className="add-order-select"
            >
              <option value="">Select a User</option>
              {users.map((user) => (
                <option key={`${user.id}-${user.username}`} value={user.username}>
                    {user.username}
                </option>
                ))}
            </select>
          </div>

          <div className="add-order-form-section">
            <label>Tracking Number:</label>
            <input
              type="text"
              name="trackingNumber"
              value={newOrder.trackingNumber}
              onChange={handleInputChange}
              className="add-order-input"
            />
          </div>

          <div className="add-order-form-section">
            <label>Carrier:</label>
            <select
              name="carrier"
              value={newOrder.carrier}
              onChange={handleInputChange}
              className="add-order-select"
            >
              <option value="">Select a Carrier</option>
              <option value="UPS">UPS</option>
              <option value="FedEx">FedEx</option>
              <option value="USPS">USPS</option>
              <option value="DHL">DHL</option>
            </select>
          </div>

          <div className="add-order-form-section">
            <label>Shipping Address:</label>
            <textarea
              name="shippingAddress"
              value={newOrder.shippingAddress}
              onChange={handleInputChange}
              className="add-order-textarea"
            />
          </div>
        </div>

        <div className="add-order-box-container">
          {showAddProductButton && (
            <button
              onClick={() => setIsAddProductFormOpen(true)}
              className="add-order-floating-button"
            >
              +
            </button>
          )}

          <div
            className="add-order-box"
            onScroll={handleScroll}
            ref={productBoxRef}
          >
            <h3 className="add-order-box-header">Existing Products</h3>
            <div className="add-order-product-list">
              {productOptions.map((product) => (
                <div
                  key={product.id}
                  className="add-order-product-tile"
                  onClick={() => handleSelectProduct(product)}
                >
                  <div className="add-order-existing-products">
                    <img
                      src={`${import.meta.env.VITE_BACKEND}/uploads/${product.thumbnail}`}
                      alt={product.name}
                      className="add-order-product-image"
                    />
                    <p>{product.name}</p>
                    <p>${product.price}</p>
                  </div>
                </div>
              ))}
            </div>
            <div ref={addProductFormRef}>
              {isAddProductFormOpen && (
                <SimpleProductUploader
                  onProductAdded={(newProduct) => {
                    fetchProducts();
                    setIsAddProductFormOpen(false);
                  }}
                  onClose={() => setIsAddProductFormOpen(false)}
                />
              )}
            </div>
          </div>

          <div className="add-order-box">
            <h3 className="add-order-box-header">Selected Items</h3>
            <div className="add-order-product-list">
              {selectedProducts.map((product) => (
                <div key={product.id} className="add-order-product-tile">
                     <button
                        className="add-order-remove-button"
                        onClick={() => handleRemoveProduct(product)} // Move product back to existing
                        title="Remove Product" // Tooltip for accessibility
                        >
                        remove{/* "X" symbol for the remove button */}
                        </button>
                  <div className="add-order-existing-products">
                    <img
                      src={`${import.meta.env.VITE_BACKEND}/uploads/${product.thumbnail}`}
                      alt={product.name}
                      className="add-order-product-image"
                    />
                    <p>{product.name}</p>
                    <p>${product.price}</p>
                    <div className="add-order-quantity-controls">
                      <button
                        onClick={() => handleDecreaseQuantity(product.id)}
                        className="add-order-quantity-button"
                      >
                        -
                      </button>
                      <span>{product.quantity}</span>
                      <button
                        onClick={() => handleIncreaseQuantity(product.id)}
                        className="add-order-quantity-button"
                      >
                        +
                      </button>
                     
                    </div>
                  </div>
                  <div className="add-order-total">
                        <h3>Total: ${calculateTotal().toFixed(2)}</h3>
                </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="add-order-total">
            <h3>Grand Total: ${calculateGrandTotal().toFixed(2)}</h3>
        </div>

        <div className="add-order-button-container">
          <button onClick={onClose} className="add-order-close-button">
            Cancel
          </button>
          <button onClick={createOrder} className="add-order-create-button">
            Create Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOrderForm;
