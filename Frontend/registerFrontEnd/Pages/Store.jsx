import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registerApi } from '../config/axios';
import LoadingPage from '../Components/loading';
import { motion, AnimatePresence } from 'framer-motion';

const Store = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    fetchProducts();

    // Scroll event listener
    const handleScroll = () => {
      if (window.scrollY > 100) { // Show after scrolling down 100px
        setShowTitle(true);
      } else {
        setShowTitle(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await registerApi.get('/register-store/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const openProductPreview = (product) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    setSelectedProduct(product);
  };

  const closeProductPreview = () => {
    setSelectedProduct(null);
  };

  if (isLoading || error) {
    return (
      <div style={{ position: 'relative' }}>
        <LoadingPage />
        {error && (
          <div style={{
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'red',
            fontSize: '1.2rem',
            textAlign: 'center',
            zIndex: 1100
          }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={closeProductPreview} 
        />
      )}

      {/* Store Title with Framer Motion for fade-in/out */}
      <AnimatePresence>
        {showTitle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '150px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <h2 style={{
              fontFamily: 'Dancing Script',
              fontSize: '3rem',
              textAlign: 'center',
              color: 'white',
              marginTop:'20%'
            }}>Store</h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable Products Container */}
      <div style={{
        paddingTop: '180px',
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.5rem',
        marginTop: '50%'
      }}>
        {products.length > 0 ? (
          products.map((product) => (
            <div 
              key={product.id} 
              style={{
                padding: '10px',
                height: '300px',
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                backgroundColor: '#0000009e',
                color: '#333',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textAlign: 'center',
                cursor: 'pointer',
              }}
              onClick={() => openProductPreview(product)}
            >
              <div style={{ height: '150px', overflow: 'hidden' }}>
                <img
                  src={`${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/${product.thumbnail}`}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <h3 style={{ fontSize: '1.25rem', margin: '10px 0', color:'black', backgroundColor:'white', padding: '10px', borderRadius:'10px'}}>{product.name}</h3>
              <p style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#cecece',
                marginBottom: '10px',
              }}>${product.price}</p>
            </div>
          ))
        ) : (
          <p style={{ gridColumn: 'span 2', textAlign: 'center', color: '#ccc' }}>No products available or still loading...</p>
        )}
      </div>
    </>
  );
};

const ProductModal = ({ product, onClose }) => {
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
          
          backgrouondColor: "#ffffffad",
          borderRadius: "20px",
          width: "80%",
          maxWidth: "600px",
          maxHeight: "80vh",
          overflowY: "auto", // Scrollable if content overflows
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          padding: "20px",
          animation: "fadeIn 0.4s ease-in-out", // Smooth fade-in animation
        }}
      >
        {/* Modal Header */}
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
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src={`${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/${product.thumbnail}`}
            alt={product.name}
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              borderRadius: "15px",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
            }}
          />
        </div>

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
              color: "#444",
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

        {/* Purchase Button */}
        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          <Link to="/login">
            <button
              onClick={onClose}
              style={{
                display: "inline-block",
                padding: "10px 20px",
                background: "linear-gradient(to right, #007bff, #0056b3)", // Gradient button
                color: "#fff",
                fontSize: "1rem",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)", // Button shadow
                transition: "transform 0.3s ease, background 0.3s ease", // Smooth hover effect
              }}
            >
              Purchase
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Store;
