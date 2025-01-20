import React, { useState, useEffect } from 'react';
import './store.css';
import { userApi } from '../../config/axios';
import { Link } from 'react-router-dom';
import { useNotification } from '../../Components/notification/notification';



const Store = () => {
  const [products, setProducts] = useState([]);
  const [authError, setAuthError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false); // New loading state
  const { showNotification } = useNotification();
  const [media, setMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState('0')

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await userApi.get('/store');
      // Access `products` from the response object
      const { products } = response.data;
      console.log(response.data)
  
      setProducts(products || []); // Safeguard against undefined
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response && error.response.status === 401) {
        setAuthError(true);
        setErrorMessage("Your session may have expired or you may not have an account with us. Please click here to register or login.");
      }
    }
  };
  

  const openProductModal = async (product) => {
    setSelectedProduct(product);
    try {
      const response = await userApi.get(`/store/${product.id}/media`);
      const mediaData = response.data || [];
      setMedia([
        { id: "thumbnail", url: product.thumbnail, type: "image" }, // Start with the thumbnail
        ...mediaData,
      ]);
      setCurrentMediaIndex(0); // Reset carousel to the first media item
    } catch (error) {
      console.error("Error fetching product media:", error);
      setMedia([]); // Fallback to empty media
    }
  };
  const handleNextSlide = () => {
    if (currentMediaIndex < media.length - 1) {
      setCurrentMediaIndex((prev) => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex((prev) => prev - 1);
    }
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
  const [startX, setStartX] = useState(0);

const handleTouchStart = (e) => {
  setStartX(e.touches[0].clientX); // Store the initial touch position
};

const handleTouchMove = (e) => {
  const endX = e.touches[0].clientX; // Get the current touch position
  const diffX = startX - endX;

  if (diffX > 50) {
    // Swipe left (next slide)
    handleNextSlide();
  } else if (diffX < -50) {
    // Swipe right (previous slide)
    handlePrevSlide();
  }
};


  return (
    <div className="store-container" >
      <h2></h2>

      {authError ? (
        <div className="auth-error">
          <p>{errorMessage}</p>
          <Link to={`${import.meta.env.VITE_LOG_IN_REDIRECTION}`}>Click here to login or register</Link>
        </div>
      ) : (
        <div className="product-grid" style={{paddingBottom:'20%'}}>
          {products.map((product) => (
            <div className="product-tile" key={product.id} onClick={() => openProductModal(product)}>
              <div className="product-info">
                <img
                  src={`${import.meta.env.VITE_IMAGE_BASE_URL}/${product.thumbnail}`}
                  alt={product.name}
                  
                />
                <div className='tile-section'>
                <h3 style={{color:'black'}}>{product.name}</h3>
                </div>
                <div className='tile-section'>
                <p style={{color:'black'}}>{product.description}</p>
                </div>
                <div className='tile-section'>
                <p style={{color:'black'}}>${product.price}</p>
                </div>

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
                        <div
                          className="carousel"
                          onTouchStart={handleTouchStart}
                          onTouchMove={handleTouchMove}
                        >
                          <button
                            className="prev"
                            onClick={handlePrevSlide}
                            disabled={currentMediaIndex === 0}
                          >
                            &lt;
                          </button>

                          {media.length > 0 && (
                            <div className="carousel-slide">
                              {media[currentMediaIndex].type === "image" ? (
                                <img
                                  src={`${import.meta.env.VITE_IMAGE_BASE_URL}/${media[currentMediaIndex].url}`}
                                  alt={`Media ${currentMediaIndex + 1}`}
                                />
                              ) : (
                                <video
                                  src={`${import.meta.env.VITE_IMAGE_BASE_URL}/${media[currentMediaIndex].url}`}
                                  controls
                                />
                              )}
                            </div>
                          )}

                          <button
                            className="next"
                            onClick={handleNextSlide}
                            disabled={currentMediaIndex === media.length - 1}
                          >
                            &gt;
                          </button>
                        </div>

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
                        <div className="modal-descriptor">
              <h4>Dimensions:</h4>
              <div className="dimensions-container">
                <div className="dimensions-column">
                  <p><strong>Metric</strong></p>
                  <p>Length:</p>
                  <p>Width:</p>
                  <p>Height:</p>
                </div>
                <div className="dimensions-column">
                  <p><strong>IN:</strong></p>
                  <p>{selectedProduct.length} </p>
                  <p>{selectedProduct.width} </p>
                  <p>{selectedProduct.height}</p>
                </div>
                <div className="dimensions-column">
                  <p><strong>CM:</strong></p>
                  <p>{(selectedProduct.length * 2.54).toFixed(2)} </p>
                  <p>{(selectedProduct.width * 2.54).toFixed(2)} </p>
                  <p>{(selectedProduct.height * 2.54).toFixed(2)} </p>
                </div>
              </div>
            </div>
            <div className='modal-descriptor'>
              <h4>Weight</h4>
              <p >
                {selectedProduct.weight}
              </p>
            </div>
            <div className='modal-descriptor'>
              <h4>Quantity Available</h4>
              
              <p>
                {selectedProduct.quantity}
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
