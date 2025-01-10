import React, { useState } from "react";
import { motion } from "framer-motion";
import QuantityModal from "../Cart/quantityModal";
import { useNavigate } from "react-router-dom";

const ProductModal = ({ product, onClose }) => {
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const navigate = useNavigate();

  const openQuantityModal = () => {
    setShowQuantityModal(true);
  };

  const closeQuantityModal = () => {
    setShowQuantityModal(false);
  };

  return (
    <motion.div
      className="backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
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
      }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: "#fff",
          borderRadius: "10px",
          maxWidth: "500px",
          width: "90%",
          padding: "1rem",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          position: "relative",
        }}
      >
        <motion.img
          src={`${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/${product.thumbnail}`}
          alt={product.name}
          style={{
            width: "100%",
            borderRadius: "10px",
            marginBottom: "1rem",
          }}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        <motion.h2
          style={{
            fontSize: "1.5rem",
            marginBottom: "0.5rem",
            textAlign: "center",
          }}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {product.name}
        </motion.h2>

        <motion.p
          style={{
            fontSize: "1.25rem",
            color: "#555",
            textAlign: "center",
            marginBottom: "1rem",
          }}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          ${product.price}
        </motion.p>

        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: "1rem" }}
        >
          <h4>Description:</h4>
          <p>{product.description}</p>
        </motion.div>

        <motion.button
          onClick={openQuantityModal}
          whileHover={{ scale: 1.1 }}
          style={{
            display: "block",
            margin: "0 auto",
            padding: "0.5rem 1rem",
            background: "linear-gradient(to right, #007bff, #0056b3)",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Purchase
        </motion.button>

        {showQuantityModal && (
          <QuantityModal
            product={product}
            maxQuantity={product.quantity}
            onClose={closeQuantityModal}
            onAddToCart={() => console.log("Added to cart!")}
            onViewCart={() => navigate("/cart")}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProductModal;
