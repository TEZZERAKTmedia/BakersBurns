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
                backgroundColor: 'black',
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
                  src={`${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/${product.image}`}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <h3 style={{ fontSize: '1.25rem', margin: '10px 0', color:'#cecece', border: "2px solid #333"}}>{product.name}</h3>
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
    <div className="modal-overlay" onClick={onClose} style={{zIndex:1000, marginTop:'20%'}}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{product.name}</h2>
        <img 
          src={`${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/${product.image}`} 
          alt={product.name} 
          style={{ width: '100%', height: 'auto', borderRadius: '8px' }} 
        />
        <p style={{ marginTop: '10px', fontSize: '1.2rem',color:'black', marginLeft:'40%'}}>${product.price}</p>
        <Link to='/login'>
          <button 
            onClick={onClose} 
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              fontSize: '1rem',
              color: '#fff',
              backgroundColor: '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Purchase
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Store;
