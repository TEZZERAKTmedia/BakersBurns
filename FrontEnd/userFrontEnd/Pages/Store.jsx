import React, { useState, useEffect, useContext } from 'react';
import '../Componentcss/store.css'; // Import the CSS file
import { userApi } from '../config/axios';
import { Link } from 'react-router-dom'; // Import Link for navigation

const Store = () => {
  const [products, setProducts] = useState([]);
  const [authError, setAuthError] = useState(false); // To track authentication errors
  const [errorMessage, setErrorMessage] = useState(''); // Error message for the user
  const [cartMessage, setCartMessage] = useState(''); // Message for cart-related actions
  const [selectedProduct, setSelectedProduct] = useState(null); // State for selected product

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await userApi.get('/store'); // Fetch products from store
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response && error.response.status === 401) {
        // If a 401 Unauthorized error is returned, set the auth error state
        setAuthError(true);
        setErrorMessage("Your session may have expired or you may not have an account with us. Please click here to register or login.");
      }
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product); // Set the selected product
  };

  const closeProductModal = () => {
    setSelectedProduct(null); // Clear the selected product to close modal
  };

  const handleAddToCart = async (productId) => {
    const userId = 'userIdFromContext';
    const token = 'tokenFromContext'; // Replace with actual token from AuthContext or state

    

    if (!userId) {
      console.error('User not authenticated');
      setAuthError(true);
      setErrorMessage("You need to log in to add products to your cart.");
      return;
    }

    try {
      const response = await userApi.post('/cart/add-to-cart', { userId, productId, quantity: 1 }, {
        headers: {
          'Authorization': `Bearer ${token}` // Include the token in the Authorization header
        }
      });
      console.log('Product added to cart');
      setCartMessage('Product added to cart successfully.');
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // Check if the error is due to the product already being in the cart
      if (error.response && error.response.status === 400 && error.response.data.message === 'Item already in cart') {
        setCartMessage('Item is already in the cart.');
      } else if (error.response && error.response.status === 401) {
        setAuthError(true);
        setErrorMessage("Your session may have expired or you may not have an account with us. Please click here to register or login.");
      } else {
        setCartMessage('An error occurred while adding the product to the cart.');
      }
    }
  };

  // Optionally clear the cart message after a few seconds
  useEffect(() => {
    if (cartMessage) {
      const timer = setTimeout(() => {
        setCartMessage('');
      }, 3000); // Clear message after 3 seconds
      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [cartMessage]);

  return (
    <div className="store-container">
      <h2>Store</h2>

      {authError ? (
        <div className="auth-error">
          <p>{errorMessage}</p>
          <Link to={`${import.meta.env.VITE_LOG_IN_REDIRECTION}`}>Click here to login or register</Link>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div className="product-tile" key={product.id} onClick={() => openProductModal(product)}>
              <div className="product-image">
                <img src={`${import.meta.env.VITE_IMAGE_BASE_URL}/${product.image}`} alt={product.name} />
              </div>
              <div className="product-info">
                <h3 style={{ fontFamily: '"Dancing Script", cursive', fontSize: '1.8rem' }}>{product.name}</h3>
              </div>
              <div className="product-description">
                <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '1rem', color: '#555' }}>{product.description}</p>
              </div>
              <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '1rem', color: 'white' }}>${product.price}</p>
              <button onClick={(e) => { e.stopPropagation(); handleAddToCart(product.id); }}>Add to Cart</button>
            </div>
          ))}

          {cartMessage && (
            <div className="cart-message">
              <p>{cartMessage}</p>
            </div>
          )}
        </div>
      )}

      {/* Modal for displaying selected product */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={closeProductModal} >
          <div style={{backgroundColor:'#555555ce'}} className="modal-content" onClick={(e) => e.stopPropagation()} >
            <span className="close-modal" onClick={closeProductModal}>&times;</span>
            <h3 style={{ fontFamily: '"Dancing Script", cursive', fontSize: '2.5rem', textAlign: 'center' }}>
              {selectedProduct.name}
            </h3>
            <img
              src={`${import.meta.env.VITE_IMAGE_BASE_URL}/${selectedProduct.image}`}
              alt={selectedProduct.name}
              style={{ width: '100%', borderRadius: '8px' }}
            />
            <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '1.2rem', color: 'white', margin: '15px 0' }}>
              {selectedProduct.description}
            </p>
            <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '1.5rem', color: 'white' ,textAlign: 'center' }}>
              ${selectedProduct.price}
            </p>
            <button
              style={{
                fontFamily: '"Dancing Script", cursive',
                fontSize: '1.2rem',
                color: '#fff',
                backgroundColor: '#ff6347',
                padding: '8px 16px',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                display: 'block',
                margin: '0 auto'
              }}
              onClick={() => handleAddToCart(selectedProduct.id)}
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;
