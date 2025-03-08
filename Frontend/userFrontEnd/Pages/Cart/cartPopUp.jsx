import React from "react";
import { Link } from "react-router-dom";

const ConfirmationModal = ({ message, onClose }) => {
    const handleKeepShopping = () => {
        window.location.href = "/store"; // Redirect to /store with a full page reload
      };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.heading}>Item Added to Cart</h3>
        <p style={styles.message}>{message}</p>
        <div style={styles.buttonWrapper}>
        <Link to='/cart'>
          <button style={styles.cartButton} >
            Go to Cart
          </button>
          </Link>
          
          <button style={styles.shopButton} onClick={handleKeepShopping}>
            Keep Shopping
          </button>
          
        </div>
      </div>
    </div>
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
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
    maxWidth: "300px",
    width: "90%",
  },
  heading: {
    fontSize: "1.5rem",
    marginBottom: "10px",
  },
  message: {
    fontSize: "1rem",
    color: "#555",
    marginBottom: "20px",
  },
  buttonWrapper: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
  },
  cartButton: {
    padding: "10px 15px",
    background: "linear-gradient(to right, #007bff, #0056b3)",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    flex: 1,
  },
  shopButton: {
    padding: "10px 15px",
    background: "linear-gradient(to right, #28a745, #218838)",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    flex: 1,
  },
};

export default ConfirmationModal;
