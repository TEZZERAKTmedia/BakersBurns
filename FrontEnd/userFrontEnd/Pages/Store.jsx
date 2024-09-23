import React, { useState, useEffect, useContext } from 'react';
import '../Componentcss/store.css'; // Import the CSS file
import { userApi } from '../config/axios';
import { Link } from 'react-router-dom'; // Import Link for navigation

const Store = () => {
  const [products, setProducts] = useState([]);
  const [authError, setAuthError] = useState(false); // To track authentication errors
  const [errorMessage, setErrorMessage] = useState(''); // Error message for the user
  const [cartMessage, setCartMessage] = useState(''); // Message for cart-related actions

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

      {/* If there is an authentication error, show the message and link */}
      {authError ? (
        <div className="auth-error">
          <p>{errorMessage}</p>
          <Link to="http://localhost:3010/login">Click here to login or register</Link> {/* Register/Login link */}
        </div>
      ) : (
        <div className="product-grid">
          
          {products.map(product => (
            <div className="product-tile" key={product.id}>
              <div className="product-image">
                <img src={`http://localhost:3450/uploads/${product.image}`} alt={product.name} />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p>${product.price}</p>
                <button onClick={() => handleAddToCart(product.id)}>Add to Cart</button>
              </div>
              <div className="product-description">
                <p>{product.description}</p>
              </div>
            </div>
          ))}

          {/* Display cart message if there is one */}
          {cartMessage && (
            <div className="cart-message">
              <p>{cartMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Store;
