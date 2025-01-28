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
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const [media, setMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await userApi.get('/store');
      const { products } = response.data;
      setProducts(products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response && error.response.status === 401) {
        setAuthError(true);
        setErrorMessage(
          'Your session may have expired or you may not have an account with us. Please click here to register or login.'
        );
      }
    }
  };

  const openProductModal = async (product) => {
    setSelectedProduct(product);
    try {
      const response = await userApi.get(`/store/${product.id}/media`);
      const mediaData = response.data || [];
      setMedia([
        { id: 'thumbnail', url: product.thumbnail, type: 'image' },
        ...mediaData,
      ]);
      setCurrentMediaIndex(0);
    } catch (error) {
      console.error('Error fetching product media:', error);
      setMedia([]);
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
    if (loading) return;
    setLoading(true);

    const userId = 'userIdFromContext';
    const token = 'tokenFromContext';

    if (!userId) {
      showNotification(
        'You need to log in to add products to your cart.',
        'error'
      );
      setLoading(false);
      return;
    }

    try {
      await userApi.post(
        '/cart/add-to-cart',
        { userId, productId, quantity: 1 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showNotification('Product added to cart successfully.', 'success');
      closeProductModal();
    } catch (error) {
      const errorMsg =
        error.response &&
        error.response.status === 400 &&
        error.response.data.message === 'Item already in cart'
          ? 'Item is already in the cart.'
          : 'An error occurred while adding the product to the cart.';

      showNotification(errorMsg, 'error');
      closeProductModal();
    } finally {
      setLoading(false);
    }
  };

  const [startX, setStartX] = useState(0);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    const endX = e.touches[0].clientX;
    const diffX = startX - endX;

    if (diffX > 50) {
      handleNextSlide();
    } else if (diffX < -50) {
      handlePrevSlide();
    }
  };

  return (
    <div className="store-container">
      {authError ? (
        <div className="auth-error">
          <p>{errorMessage}</p>
          <Link to={`${import.meta.env.VITE_LOG_IN_REDIRECTION}`}>
            Click here to login or register
          </Link>
        </div>
      ) : (
        <div className="product-grid" style={{ paddingBottom: '20%' }}>
          {products.map((product) => {
            const isDiscounted = product.isDiscounted;

            return (
              <div
                className="product-tile"
                key={product.id}
                onClick={() => openProductModal(product)}
              >
                <div className="product-info" style={{ position: 'relative' }}>
                  <img
                    src={`${import.meta.env.VITE_IMAGE_BASE_URL}/${product.thumbnail}`}
                    alt={product.name}
                  />
                  {isDiscounted && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        backgroundColor: '#ff4d4d',
                        color: '#fff',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {product.discountType === 'percentage'
                        ? `-${parseFloat(product.discountAmount).toFixed(2)}%`
                        : `-$${parseFloat(product.discountAmount).toFixed(2)}`}
                    </div>
                  )}
                  <div className="tile-section">
                    <h3 style={{ color: 'black' }}>{product.name}</h3>
                  </div>
                  <div className="tile-section">
                    <p style={{ color: 'black' }}>{product.description}</p>
                  </div>
                  <div className="tile-section">
                    {isDiscounted ? (
                      <div>
                        <p
                          style={{
                            textDecoration: 'line-through',
                            color: '#888',
                          }}
                        >
                          ${parseFloat(product.price).toFixed(2)}
                        </p>
                        <p style={{ color: '#e63946' }}>
                          ${parseFloat(product.discountPrice).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p style={{ color: 'black' }}>
                        ${parseFloat(product.price).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

{selectedProduct && (
  <div className="modal-overlay" onClick={closeProductModal}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <span className="close-modal" onClick={closeProductModal}>
        &times;
      </span>
      
      {/* Product Name */}
      <h3 style={{ color: 'black' }}>{selectedProduct.name}</h3>

      {/* Media Carousel */}
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
            {media[currentMediaIndex].type === 'image' ? (
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

      {/* Price Section */}
      <div className="modal-descriptor">
        <h4>Price:</h4>
        {selectedProduct.isDiscounted ? (
          <div>
            {/* Discount Tag */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                backgroundColor: '#ff4d4d',
                color: '#fff',
                padding: '5px 10px',
                borderRadius: '5px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
              }}
            >
              {selectedProduct.discountType === 'percentage'
                ? `-${parseFloat(selectedProduct.discountAmount).toFixed(2)}%`
                : `-$${parseFloat(selectedProduct.discountAmount).toFixed(2)}`}
            </div>
            <p style={{ textDecoration: 'line-through', color: '#888' }}>
              ${parseFloat(selectedProduct.price).toFixed(2)}
            </p>
            <p style={{ color: '#e63946' }}>
              ${parseFloat(selectedProduct.discountPrice).toFixed(2)}
            </p>
          </div>
        ) : (
          <p>${parseFloat(selectedProduct.price).toFixed(2)}</p>
        )}
      </div>

      {/* Product Details */}
      <div className="modal-descriptor">
        <h4>Description:</h4>
        <p>{selectedProduct.description}</p>
      </div>
      <div className="modal-descriptor">
        <h4>Dimensions:</h4>
        <div className="dimensions-container">
          <div className="dimensions-column">
            <p>
              <strong>Metric</strong>
            </p>
            <p>Length:</p>
            <p>Width:</p>
            <p>Height:</p>
          </div>
          <div className="dimensions-column">
            <p>
              <strong>IN:</strong>
            </p>
            <p>{selectedProduct.length} in</p>
            <p>{selectedProduct.width} in</p>
            <p>{selectedProduct.height} in</p>
          </div>
          <div className="dimensions-column">
            <p>
              <strong>CM:</strong>
            </p>
            <p>{(selectedProduct.length * 2.54).toFixed(2)} cm</p>
            <p>{(selectedProduct.width * 2.54).toFixed(2)} cm</p>
            <p>{(selectedProduct.height * 2.54).toFixed(2)} cm</p>
          </div>
        </div>
      </div>
      <div className="modal-descriptor">
        <h4>Weight:</h4>
        <p>{selectedProduct.weight} lbs</p>
      </div>
      <div className="modal-descriptor">
        <h4>Quantity Available:</h4>
        <p>{selectedProduct.quantity}</p>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={() => handleAddToCart(selectedProduct.id)}
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default Store;
