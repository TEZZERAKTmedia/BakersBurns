import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registerApi } from '../../config/axios';
import LoadingPage from '../../Components/loading';
import ProductModal from './ProductModal';
import StoreNavbar from './storeMenu';

const Store = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await registerApi.get('/register-store/products');
      setProducts(response.data.products || []);
      console.log(response.data.products);
      setFilteredProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

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
    setSelectedProduct(product);
  };

  const closeProductPreview = () => {
    setSelectedProduct(null);
  };

  if (isLoading || error) {
    return (
      <div>
        <LoadingPage />
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  return (
    <>
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={closeProductPreview} />
      )}

      <StoreNavbar onTypeSelect={(type) => setSelectedType(type)} />

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
    filteredProducts.map((product) => {
      const isDiscounted = product.isDiscounted;

      // Format the discount end date
      const saleEndDate = isDiscounted
        ? new Date(product.discountEndDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : null;

      return (
        <div
          key={product.id}
          style={{
            padding: '10px',
            marginTop: '10%',
            height: '370px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            backgroundColor: '#0000009e',
            color: '#333',
            textAlign: 'center',
            cursor: 'pointer',
            position: 'relative',
          }}
          onClick={() => openProductPreview(product)}
        >
          {/* Image and Discount Tag */}
          <div style={{ height: '150px', overflow: 'hidden', position: 'relative' }}>
            <img
              src={`${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/${product.thumbnail}`}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {isDiscounted && (
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  backgroundColor: '#ff4d4d',
                  color: '#fff',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                }}
              >
                {product.discountType === 'percentage'
                  ? `-${parseFloat(product.discountAmount).toFixed(2)}%`
                  : `-$${parseFloat(product.discountAmount).toFixed(2)}`}
              </div>
            )}
          </div>

          {/* Product Name */}
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

          {/* Price Section */}
          <div>
            {isDiscounted ? (
              <div>
                {/* Original Price */}
                <p
                  style={{
                    fontSize: '1rem',
                    textDecoration: 'line-through',
                    color: '#ccc',
                  }}
                >
                  ${parseFloat(product.price).toFixed(2)}
                </p>

                {/* Discounted Price */}
                <p
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#ff4d4d',
                  }}
                >
                  ${parseFloat(product.discountPrice).toFixed(2)}
                </p>
              </div>
            ) : (
              <p
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#cecece',
                }}
              >
                ${parseFloat(product.price).toFixed(2)}
              </p>
            )}
          </div>

          {/* Sale Ends Message */}
          {isDiscounted && (
            <p
              style={{
                marginTop: '10px',
                fontSize: '0.85rem',
                color: '#ff4d4d',
                fontWeight: 'bold',
              }}
            >
              Sale Ends: {saleEndDate}
            </p>
          )}
        </div>
      );
    })
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
