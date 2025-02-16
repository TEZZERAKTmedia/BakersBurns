import React, { useState, useEffect } from "react";
import QuantityModal from "../Cart/quantityModal";
import { useNavigate } from "react-router-dom";
import { registerApi } from "../../config/axios";
import "./product-modal.css"; // Import the external CSS file

const ProductModal = ({ product, onClose }) => {
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [media, setMedia] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [startX, setStartX] = useState(0);
  const navigate = useNavigate();
  const isDiscounted = product.isDiscounted;
  const discountPrice = isDiscounted
    ? parseFloat(product.discountPrice).toFixed(2)
    : null;
  const saleEndDate = isDiscounted
    ? new Date(product.discountEndDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await registerApi.get(
          `/register-store/products/${product.id}/media`
        );
        const mediaData = response.data || [];
        const orderedMedia = [
          { id: "thumbnail", url: product.thumbnail, type: "image", order: 0 },
          ...mediaData.sort((a, b) => a.order - b.order),
        ];
        setMedia(orderedMedia);
      } catch (error) {
        console.error("Error fetching media:", error);
        setMedia([{ id: "thumbnail", url: product.thumbnail, type: "image", order: 0 }]);
      } finally {
        setLoadingMedia(false);
      }
    };

    fetchMedia();
  }, [product.id, product.thumbnail]);

  const openQuantityModal = () => setShowQuantityModal(true);
  const closeQuantityModal = () => setShowQuantityModal(false);
  const handleNextSlide = () => currentMediaIndex < media.length - 1 && setCurrentMediaIndex((prev) => prev + 1);
  const handlePrevSlide = () => currentMediaIndex > 0 && setCurrentMediaIndex((prev) => prev - 1);
  const handleTouchStart = (e) => setStartX(e.touches[0].clientX);
  const handleTouchMove = (e) => {
    const diffX = startX - e.touches[0].clientX;
    if (diffX > 50) handleNextSlide();
    else if (diffX < -50) handlePrevSlide();
  };

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal-container" onClick={(e) => e.stopPropagation()}>
        {loadingMedia ? (
          <p className="product-modal-loading">Loading media...</p>
        ) : media.length > 0 ? (
          <div className="product-modal-carousel" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
            {currentMediaIndex > 0 && (
              <button className="product-modal-arrow left" onClick={handlePrevSlide}>
                &#8249;
              </button>
            )}
            <div className="product-modal-slide">
              {media[currentMediaIndex].type === "image" ? (
                <img
                  src={`${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/${media[currentMediaIndex].url}`}
                  alt={`Media ${currentMediaIndex + 1}`}
                  className="product-modal-media"
                />
              ) : (
                <video
                  src={`${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/${media[currentMediaIndex].url}`}
                  controls
                  className="product-modal-media"
                />
              )}
            </div>
            {currentMediaIndex < media.length - 1 && (
              <button className="product-modal-arrow right" onClick={handleNextSlide}>
                &#8250;
              </button>
            )}
          </div>
        ) : (
          <p className="product-modal-no-media">No media available.</p>
        )}

        <div className="product-modal-info">
          <h2 className="product-modal-title">{product.name}</h2>
          <div className="product-modal-price">
            {isDiscounted ? (
              <>
                <p className="product-modal-original-price">${parseFloat(product.price).toFixed(2)}</p>
                <p className="product-modal-discounted-price">${discountPrice}</p>
                <p className="product-modal-sale-end">Sale Ends: {saleEndDate}</p>
              </>
            ) : (
              <p className="product-modal-normal-price">${parseFloat(product.price).toFixed(2)}</p>
            )}
          </div>

          <div className="product-modal-details">
            <h4 className="product-modal-section-title">Description</h4>
            <p className="product-modal-description">{product.description}</p>
          </div>

          <div className="product-modal-dimensions">
            <h4 className="product-modal-section-title">Dimensions</h4>
            <div className="product-modal-dimension-content">
              <p>Length: {(product.length * 2.54).toFixed(2)} cm | {product.length} in</p>
              <p>Width: {(product.width * 2.54).toFixed(2)} cm | {product.width} in</p>
              <p>Height: {(product.height * 2.54).toFixed(2)} cm | {product.height} in</p>
            </div>
          </div>

          <div className="product-modal-weight">
            <h4 className="product-modal-section-title">Weight</h4>
            <p>{product.weight} lbs</p>
          </div>

          <div className="product-modal-quantity">
            <h4 className="product-modal-section-title">Quantity Available</h4>
            <p>{product.quantity}</p>
          </div>

          <button className="product-modal-purchase-button" onClick={openQuantityModal}>
            Purchase
          </button>
        </div>

        {showQuantityModal && (
          <QuantityModal
            product={product}
            maxQuantity={product.quantity}
            onClose={closeQuantityModal}
            onAddToCart={() => console.log("Added to cart!")}
            onViewCart={() => navigate("/cart")}
          />
        )}
      </div>
    </div>
  );
};

export default ProductModal;
