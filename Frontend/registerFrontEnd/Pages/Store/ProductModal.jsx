import React, { useState, useEffect } from "react";
import QuantityModal from "../Cart/quantityModal";
import { useNavigate } from "react-router-dom";
import { registerApi } from "../../config/axios";

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
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#555555ce",
          borderRadius: "20px",
          width: "80%",
          maxWidth: "600px",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          padding: "20px",
        }}
      >
        {/* Media Carousel */}
        {loadingMedia ? (
          <p>Loading media...</p>
        ) : media.length > 0 ? (
          <div
            className="carousel"
            style={{
              position: "relative",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            {currentMediaIndex > 0 && (
              <button
                onClick={handlePrevSlide}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "10px",
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                &#8249;
              </button>
            )}

            <div
              className="carousel-slide"
              style={{
                textAlign: "center",
                width: "100%",
                maxHeight: "400px",
                overflow: "hidden",
              }}
            >
              {media[currentMediaIndex].type === "image" ? (
                <img
                  src={`${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/${media[currentMediaIndex].url}`}
                  alt={`Media ${currentMediaIndex + 1}`}
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "10px",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                  }}
                />
              ) : (
                <video
                  src={`${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/${media[currentMediaIndex].url}`}
                  controls
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "10px",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                  }}
                />
              )}
            </div>

            {currentMediaIndex < media.length - 1 && (
              <button
                onClick={handleNextSlide}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                &#8250;
              </button>
            )}
          </div>
        ) : (
          <p>No media available.</p>
        )}

        {/* Product Name */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "2rem", color: "white", marginBottom: "10px" }}>
            {product.name}
          </h2>
        </div>

        {/* Product Price */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          {isDiscounted ? (
            <div>
              <p
                style={{
                  fontSize: "1rem",
                  textDecoration: "line-through",
                  color: "#ccc",
                }}
              >
                ${parseFloat(product.price).toFixed(2)}
              </p>
              <p
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#ff4d4d",
                }}
              >
                ${discountPrice}
              </p>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#ff4d4d",
                  marginTop: "5px",
                }}
              >
                Sale Ends: {saleEndDate}
              </p>
            </div>
          ) : (
            <p
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#cecece",
              }}
            >
              ${parseFloat(product.price).toFixed(2)}
            </p>
          )}
        </div>

        {/* Product Details */}
        <div>
          {/* Description */}
          <div
            style={{
              background: "linear-gradient(to bottom, #e0e0e0, #f9f9f9)",
              borderRadius: "20px",
              padding: "20px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <h4 style={{ fontSize: "1.2rem", color: "#555", marginBottom: "10px" }}>
              Description
            </h4>
            <p style={{ fontSize: "1rem", color: "#333" }}>{product.description}</p>
          </div>

          {/* Dimensions */}
          <div
            style={{
              background: "linear-gradient(to bottom, #e0e0e0, #f9f9f9)",
              borderRadius: "20px",
              padding: "20px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <h4 style={{ fontSize: "1.2rem", color: "#555", marginBottom: "10px" }}>
              Dimensions
            </h4>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ flex: 1, color: "#333" }}>
                <p>Length: {(product.length * 2.54).toFixed(2)} cm</p>
                <p>Width: {(product.width * 2.54).toFixed(2)} cm</p>
                <p>Height: {(product.height * 2.54).toFixed(2)} cm</p>
              </div>
              <div style={{ flex: 1, color: "#333" }}>
                <p>Length: {product.length} in</p>
                <p>Width: {product.width} in</p>
                <p>Height: {product.height} in</p>
              </div>
            </div>
          </div>

          {/* Weight */}
          <div
            style={{
              background: "linear-gradient(to bottom, #e0e0e0, #f9f9f9)",
              borderRadius: "20px",
              padding: "20px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <h4 style={{ fontSize: "1.2rem", color: "#555", marginBottom: "10px" }}>
              Weight
            </h4>
            <p style={{ fontSize: "1rem", color: "#333" }}>{product.weight} lbs</p>
          </div>

          {/* Quantity */}
          <div
            style={{
              background: "linear-gradient(to bottom, #e0e0e0, #f9f9f9)",
              borderRadius: "20px",
              padding: "20px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <h4 style={{ fontSize: "1.2rem", color: "#555", marginBottom: "10px" }}>
              Quantity Available
            </h4>
            <p style={{ fontSize: "1rem", color: "#333" }}>{product.quantity}</p>
          </div>
        </div>

        {/* Purchase Button */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            style={{
              padding: "10px 20px",
              background: "linear-gradient(to right, #007bff, #0056b3)",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              transition: "background 0.3s ease",
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
              onAddToCart={() => console.log("Added to cart!")}
              onViewCart={() => navigate("/cart")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
