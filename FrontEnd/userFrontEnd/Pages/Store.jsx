import React, { useState, useEffect } from 'react';
import '../Componentcss/store.css';
import { userApi } from '../config/axios';
import { Link } from 'react-router-dom';
import { useNotification } from '../Components/notification/notification';


const Store = () => {
  const [products, setProducts] = useState([]);
  const [authError, setAuthError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false); // New loading state
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await userApi.get('/store');
      // Access `products` from the response object
      const { products } = response.data;
  
      setProducts(products || []); // Safeguard against undefined
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response && error.response.status === 401) {
        setAuthError(true);
        setErrorMessage("Your session may have expired or you may not have an account with us. Please click here to register or login.");
      }
    }
  };
  

  const openProductModal = (product) => {
    setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  const handleAddToCart = async (productId) => {
    if (loading) return; // Prevent further clicks if already loading
    setLoading(true); // Set loading state to true

    const userId = 'userIdFromContext';
    const token = 'tokenFromContext';

    if (!userId) {
      showNotification("You need to log in to add products to your cart.", "error");
      setLoading(false); // Reset loading state
      return;
    }

    try {
      await userApi.post('/cart/add-to-cart', { userId, productId, quantity: 1 }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      showNotification('Product added to cart successfully.', 'success');
      closeProductModal();
    } catch (error) {
      const errorMsg = error.response && error.response.status === 400 && error.response.data.message === 'Item already in cart'
        ? 'Item is already in the cart.'
        : 'An error occurred while adding the product to the cart.';
      
      showNotification(errorMsg, 'error');
      closeProductModal();
      
    } finally {
      setLoading(false); // Reset loading state
    }
  };

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
              <div className="product-info">
                <img
                  src={`${import.meta.env.VITE_IMAGE_BASE_URL}/${product.image}`}
                  alt={product.name}
                  
                />
                <h3 >{product.name}</h3>
                <p >${product.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for displaying selected product */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={closeProductModal}>
          <div  className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-modal" onClick={closeProductModal}>&times;</span>
            <h3 style={{ color: 'black'}}>
              {selectedProduct.name}
            </h3>
            <img
              src={`${import.meta.env.VITE_IMAGE_BASE_URL}/${selectedProduct.image}`}
              alt={selectedProduct.name}
              
            />
            <div className='modal-descriptor'>
              <h4 >Description:</h4>
              <p >
                {selectedProduct.description}
              </p>
            </div>
            <div className='modal-descriptor'>
              <h4>Price: USD</h4>
              <p >
                ${selectedProduct.price}
              </p>
            </div>
            <button
             
              onClick={() => handleAddToCart(selectedProduct.id)}
              disabled={loading} // Disable button when loading
            >
              {loading ? "Adding..." : "Add to Cart"} {/* Show loading state */}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;
