import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registerApi } from '../../config/axios';
import LoadingPage from '../../Components/loading';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ProductModal from './ProductModal';
import StoreNavbar from './storeMenu'; // Import the StoreMenu component

const Store = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); // For filtered products
  const [selectedType, setSelectedType] = useState('All'); // Selected type
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    fetchProducts();

    // Scroll event listener
    const handleScroll = () => {
      if (window.scrollY > 100) {
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

  // Fetch all products
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await registerApi.get('/register-store/products');
      setProducts(response.data.products || []);
      setFilteredProducts(response.data.products || []); // Initially show all products
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update filtered products when the selected type changes
  useEffect(() => {
    if (selectedType === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((product) => product.type === selectedType)
      );
    }
  }, [selectedType, products]);

  const openProductPreview = (product) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
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
          <div
            style={{
              position: 'fixed',
              top: '20%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'red',
              fontSize: '1.2rem',
              textAlign: 'center',
              zIndex: 1100,
            }}
          >
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={closeProductPreview} />
      )}

      {/* Store Title */}


      {/* Store Menu for Filtering */}
      <StoreNavbar onTypeSelect={(type) => setSelectedType(type)} />

      {/* Products Grid */}
      <div
        style={{
          paddingTop: '20px',
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              style={{
                padding: '10px',
                marginTop: '10%',
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
              <h3
                style={{
                  fontSize: '1.25rem',
                  margin: '10px 0',
                  color: 'black',
                  backgroundColor: 'white',
                  padding: '10px',
                  borderRadius: '10px',
                }}
              >
                {product.name}
              </h3>
              <p
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#cecece',
                  marginBottom: '10px',
                }}
              >
                ${product.price}
              </p>
            </div>
          ))
        ) : (
          <p
            style={{
              gridColumn: 'span 2',
              textAlign: 'center',
              color: '#ccc',
            }}
          >
            No products available or still loading...
          </p>
        )}
      </div>
    </>
  );
};

export default Store;
