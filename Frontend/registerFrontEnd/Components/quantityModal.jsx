import React, { useState } from "react";
import { registerApi } from "../config/axios";
import ConfirmationModal from "./cartPopUp"; // Correct import of ConfirmationModal

const QuantityModal = ({
  product,
  maxQuantity,
  onClose,
  onAddToCart,
  onViewCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!value || value < 1) {
      setQuantity(1);
    } else if (value > maxQuantity) {
      setQuantity(maxQuantity);
    } else {
      setQuantity(value);
    }
  };

  const validateCartItems = async (cartItems) => {
    try {
      for (const item of cartItems) {
        const response = await registerApi.post("/register-cart/check-quantity", {
          productId: item.id,
          quantity: item.quantity,
        });

        if (response.status !== 200) {
          console.warn(`Insufficient stock for ${item.name}.`);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Error validating stock:", error);
      throw error; // Rethrow error to handle it properly in `handleAddToCart`
    }
  };

  const handleAddToCart = async () => {
    const cartItem = { id: product.id, quantity };

    try {
      const isStockAvailable = await validateCartItems([cartItem]);

      if (isStockAvailable) {
        onAddToCart(product, quantity); // Call the onAddToCart function
        setShowConfirmationModal(true); // Show the confirmation modal
      } else {
        alert(`The stock is insufficient for ${product.name}.`);
      }
    } catch (error) {
      console.error("Error validating cart items:", error);
      alert("An error occurred while checking stock. Please try again.");
    }
  };

  return (
    <>
      <div style={styles.backdrop} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <h3 style={styles.heading}>Select Quantity</h3>
          <div style={styles.quantityWrapper}>
            <button style={styles.button} onClick={handleDecrease}>
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={handleInputChange}
              min="1"
              max={maxQuantity}
              style={styles.input}
            />
            <button style={styles.button} onClick={handleIncrease}>
              +
            </button>
          </div>
          <p style={styles.stockInfo}>Available: {maxQuantity}</p>
          <button style={styles.addToCartButton} onClick={handleAddToCart}>
            Add to Cart
          </button>
          <button style={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>

      {showConfirmationModal && (
        <ConfirmationModal
          message={`${quantity} x ${product.name} added to your cart!`}
          onConfirm={onViewCart}
          onCancel={() => setShowConfirmationModal(false)}
        />
      )}
    </>
  );
};

const styles = {
    backdrop: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modal: {
      backgroundColor: "#ffffff",
      borderRadius: "10px",
      textAlign: "center",
      padding: "30px 20px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
      maxWidth: "400px",
      width: "90%",
      position: "relative",
    },
    heading: {
      fontSize: "1.5rem",
      marginBottom: "20px",
      color: "#333",
    },
    quantityWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      marginBottom: "20px",
    },
    button: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0", // Reset default padding
      fontSize: "1.5rem",
      background: "black",
      border: "1px solid #ccc",
      borderRadius: "5px",
      cursor: "pointer",
      width: "40px",
      height: "40px",
      lineHeight: "1",
    },
    input: {
      width: "60px",
      textAlign: "center",
      fontSize: "1rem",
      padding: "5px",
      border: "1px solid #ccc",
      borderRadius: "5px",
    },
    stockInfo: {
      fontSize: "0.9rem",
      color: "#666",
      marginBottom: "20px",
    },
    addToCartButton: {
      padding: "10px 20px",
      background: "linear-gradient(to right, #28a745, #218838)",
      color: "#fff",
      fontSize: "1rem",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      marginBottom: "10px",
    },
    cancelButton: {
      padding: "10px 20px",
      background: "linear-gradient(to right, #dc3545, #c82333)",
      color: "#fff",
      fontSize: "1rem",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
  };
  

export default QuantityModal;
