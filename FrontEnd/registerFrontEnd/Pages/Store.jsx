import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registerApi } from '../config/axios';

const Store = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await registerApi.get('/register-store/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const openProductPreview = (product) => {
    setSelectedProduct(product);
  };

  const closeProductPreview = () => {
    setSelectedProduct(null);
  };

  return (
    <>
      {/* Main Store Container */}
      <div style={{
        position: 'fixed', // Keeps the container fixed on the screen
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#242424',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '150px',
        boxSizing: 'border-box',
        
      }}>
        <h2 style={{
          fontFamily: 'Dancing Script',
          fontSize: '3rem',
          color: 'white',
          textAlign: 'center',
          marginBottom: '20px',
        }}>Store</h2>
      </div>

      {/* Scrollable Products Container */}
      <div style={{
        position: 'absolute',
        top: '100px', // Leave space for the fixed Store title
        left: '0',
        right: '0',
        bottom: '0',
        // Enable scrolling for products
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.5rem',
        zIndex: '0',
        marginTop: '150px'
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
                backgroundColor: 'white',
                color: '#333',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textAlign: 'center',
                cursor: 'pointer',
              }}
              onClick={() => openProductPreview(product)} // Open modal on click
            >
              <div style={{ height: '150px', overflow: 'hidden' }}>
                <img
                  src={`${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/${product.image}`}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <h3 style={{ fontSize: '1.25rem', margin: '10px 0' }}>{product.name}</h3>
              
              <p style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '10px',
              }}>${product.price}</p>
            </div>
          ))
        ) : (
          <p style={{ gridColumn: 'span 2', textAlign: 'center', color: '#ccc' }}>No products available or still loading...</p>
        )}
      </div>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={closeProductPreview} 
        />
      )}
    </>
  );
};

const ProductModal = ({ product, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '1000',
    }} onClick={onClose}>
      <div style={{
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        position: 'relative',
      }} onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose} 
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
          }}
        >&times;</button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '10px' }}>{product.name}</h2>
          <img 
            src={`${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/${product.image}`}
            alt={product.name}
            style={{ width: '100%', height: 'auto', borderRadius: '8px', marginBottom: '15px' }}
          />
          <p style={{ fontSize: '1.25rem', color: '#333', marginBottom: '10px' }}>${product.price}</p>
          <p style={{ color: '#666', marginBottom: '20px' }}>{product.description}</p>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%',
              padding: '10px 0',
              backgroundColor: '#007bff',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}>Add to Cart</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Store;
