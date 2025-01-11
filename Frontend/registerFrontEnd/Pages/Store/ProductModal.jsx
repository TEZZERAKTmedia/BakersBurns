import React, { useState, useEffect } from 'react';
import QuantityModal from '../Cart/quantityModal';
import { useNavigate } from 'react-router-dom';
import { registerApi } from '../../config/axios';

const ProductModal = ({ product, onClose }) => {
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0); // Track the current media index
  const [media, setMedia] = useState([]); // Store media data
  const [loadingMedia, setLoadingMedia] = useState(true); // Loading state for media
  const [startX, setStartX] = useState(0); // For touch gesture
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await registerApi.get(`/register-store/products/${product.id}/media`);
        const mediaData = response.data || [];
        console.log('Media fetched:', mediaData); // Debugging log to check the response data

        // Always place the thumbnail at the first position, followed by ordered media
        const orderedMedia = [
          { id: 'thumbnail', url: product.thumbnail, type: 'image', order: 0 },
          ...mediaData.sort((a, b) => a.order - b.order),
        ];

        setMedia(orderedMedia);
      } catch (error) {
        console.error('Error fetching media:', error);
        // Fallback to thumbnail only
        setMedia([{ id: 'thumbnail', url: product.thumbnail, type: 'image', order: 0 }]);
      } finally {
        setLoadingMedia(false);
      }
    };

    fetchMedia();
  }, [product.id, product.thumbnail]);

  const openQuantityModal = () => setShowQuantityModal(true);
  const closeQuantityModal = () => setShowQuantityModal(false);

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

  const handleTouchStart = (e) => setStartX(e.touches[0].clientX);
  const handleTouchMove = (e) => {
    const diffX = startX - e.touches[0].clientX;
    if (diffX > 50) handleNextSlide(); // Swipe left
    else if (diffX < -50) handlePrevSlide(); // Swipe right
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#555555ce',
          borderRadius: '20px',
          width: '80%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          padding: '20px',
        }}
      >
        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '2rem', color: 'black' }}>{product.name}</h2>
        </div>

        {/* Media Carousel */}
        {loadingMedia ? (
          <p>Loading media...</p>
        ) : media.length > 0 ? (
          <div
            className="carousel"
            style={{ position: 'relative', marginBottom: '20px' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            <button
              className="prev"
              onClick={handlePrevSlide}
              disabled={currentMediaIndex === 0}
              style={{
                position: 'absolute',
                top: '50%',
                left: '0px',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                fontSize: '2rem',
                cursor: 'pointer',
                height:'100%',
                zIndex: 2,
                backgroundColor:'black',
              }}
            >
              &lt;
            </button>

            <div className="carousel-slide" style={{ textAlign: 'center' }}>
              {media[currentMediaIndex].type === 'image' ? (
                <img
                  src={`${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/${media[currentMediaIndex].url}`}
                  alt={`Media ${currentMediaIndex + 1}`}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '10px',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                  }}
                />
              ) : (
                <video
                  src={`${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/${media[currentMediaIndex].url}`}
                  controls
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '10px',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                  }}
                />
              )}
            </div>

            <button
              className="next"
              onClick={handleNextSlide}
              disabled={currentMediaIndex === media.length - 1}
              style={{
                position: 'absolute',
                top: '50%',
                right: '0px',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                fontSize: '2rem',
                cursor: 'pointer',
                zIndex: 2,
                backgroundColor:'black',
                height:'100%'
              }}
            >
              &gt;
            </button>
          </div>
        ) : (
          <p>No media available.</p>
        )}

        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "2rem",
              color: "white",
              marginBottom: "10px",
            }}
          >
            {product.name}
          </h2>
        </div>

        {/* Product Image */}
        

        {/* Product Price */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          <p
            style={{
              fontSize: "1.5rem",
              color: "#555",
              backgroundColor:'white',
              padding: '10px',
              border:'solid 2px white',
              borderRadius:'20px'
            }}
          >
            ${product.price}
          </p>
        </div>

        {/* Modal Body */}
        <div>
          {/* Description Section */}
          <div
            style={{
              background: "linear-gradient(to bottom, #e0e0e0, #f9f9f9)", // Gradient section
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
              borderRadius: "20px",
              padding: "20px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <h4
              style={{
                fontSize: "1.2rem",
                color: "#555",
                marginBottom: "10px",
              }}
            >
              Description:
            </h4>
            <p style={{ fontSize: "1rem", color: "#333" }}>{product.description}</p>
          </div>

          {/* Dimensions Section */}
          <div
            style={{
              background: "linear-gradient(to bottom, #e0e0e0, #f9f9f9)",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
              borderRadius: "20px",
              padding: "20px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <h4
              style={{
                fontSize: "1.2rem",
                color: "#555",
                marginBottom: "10px",
              }}
            >
              Dimensions:
            </h4>
            <div
              style={{
                display: "flex",
                gap: "20px",
                justifyContent: "space-between",
              }}
            >
              <div style={{ flex: "1", fontSize: "0.9rem", color: "#444" }}>
                <p><strong>Metric (CM):</strong></p>
                <p>Length: {(product.length * 2.54).toFixed(2)} cm</p>
                <p>Width: {(product.width * 2.54).toFixed(2)} cm</p>
                <p>Height: {(product.height * 2.54).toFixed(2)} cm</p>
              </div>
              <div style={{ flex: "1", fontSize: "0.9rem", color: "#444" }}>
                <p><strong>Imperial (IN):</strong></p>
                <p>Length: {product.length} in</p>
                <p>Width: {product.width} in</p>
                <p>Height: {product.height} in</p>
              </div>
            </div>
          </div>

          {/* Weight Section */}
          <div
            style={{
              background: "linear-gradient(to bottom, #e0e0e0, #f9f9f9)",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
              borderRadius: "20px",
              padding: "20px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <h4
              style={{
                fontSize: "1.2rem",
                color: "#555",
                marginBottom: "10px",
              }}
            >
              Weight:
            </h4>
            <p style={{ fontSize: "1rem", color: "#333" }}>{product.weight} lbs</p>
          </div>

          {/* Quantity Section */}
          <div
            style={{
              background: "linear-gradient(to bottom, #e0e0e0, #f9f9f9)",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
              borderRadius: "20px",
              padding: "20px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <h4
              style={{
                fontSize: "1.2rem",
                color: "#555",
                marginBottom: "10px",
              }}
            >
              Quantity Available:
            </h4>
            <p style={{ fontSize: "1rem", color: "#333" }}>{product.quantity}</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(to right, #007bff, #0056b3)',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background 0.3s ease',
            }}
            onClick={openQuantityModal}
          >
            Purchase
          </button>
          {showQuantityModal && (
            <QuantityModal
              product={product}
              maxQuantity={product.quantity}
              onClose={closeQuantityModal}
              onAddToCart={() => console.log('Added to cart!')}
              onViewCart={() => navigate('/cart')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
