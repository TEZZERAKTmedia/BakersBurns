import React, { useState } from "react";

const QuantityModal = ({
  product,
  maxQuantity,
  onClose,
  onAddToCart,
  onViewCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);

    // Ensure the quantity is between 1 and the maximum available stock
    if (value > 0 && value <= maxQuantity) {
      setQuantity(value);
    } else if (value > maxQuantity) {
      setQuantity(maxQuantity);
    }
  };

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;

      // Ensure the total quantity doesn't exceed the maximum available stock
      if (existingItem.quantity > maxQuantity) {
        existingItem.quantity = maxQuantity;
      }
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        thumbnail: product.thumbnail,
        quantity,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    // Trigger the confirmation modal
    setShowConfirmationModal(true);
  };

  return (
    <>
      {/* Quantity Selection Modal */}
      {!showConfirmationModal && (
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
              backgroundColor: "#ffffff",
              borderRadius: "10px",
              width: "300px",
              textAlign: "center",
              padding: "40px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3>Select Quantity</h3>
            <input
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={handleQuantityChange}
              style={{
                width: "80px",
                padding: "10px",
                textAlign: "center",
                marginBottom: "20px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
              Available: {maxQuantity}
            </p>
            <button
              style={{
                padding: "10px 20px",
                background: "linear-gradient(to right, #28a745, #218838)",
                color: "#fff",
                fontSize: "1rem",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                margin: "10px",
              }}
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
            <button
              style={{
                padding: "10px 20px",
                background: "linear-gradient(to right, #dc3545, #c82333)",
                color: "#fff",
                fontSize: "1rem",
                border: "none",
                borderRadius: "5px",
                marginTop: "10px",
                cursor: "pointer",
              }}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
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
              backgroundColor: "#ffffff",
              borderRadius: "10px",
              width: "300px",
              textAlign: "center",
              padding: "40px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3>Item Added to Cart!</h3>
            <p>
              {quantity} x {product.name} has been added to your cart.
            </p>
            <button
              style={{
                padding: "10px 20px",
                background: "linear-gradient(to right, #007bff, #0056b3)",
                color: "#fff",
                fontSize: "1rem",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                margin: "10px",
              }}
              onClick={onViewCart}
            >
              Go to Cart
            </button>
            <button
              style={{
                padding: "10px 20px",
                background: "linear-gradient(to right, #28a745, #218838)",
                color: "#fff",
                fontSize: "1rem",
                border: "none",
                borderRadius: "5px",
                marginTop: "10px",
                cursor: "pointer",
              }}
              onClick={onClose}
            >
              Keep Shopping
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default QuantityModal;
