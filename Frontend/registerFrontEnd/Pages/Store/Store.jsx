import React, { useState, useEffect } from 'react';
import { registerApi } from '../../config/axios';
import LoadingPage from '../../Components/loading';
import ProductModal from './ProductModal';
import StoreNavbar from './storeMenu';
import './store.css';

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
      <div className="full-page-loading-overlay">
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

      <div className="store-container">
        
        <div className="store-product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const isDiscounted = product.isDiscounted;
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
                  className="store-product-tile"
                  onClick={() => openProductPreview(product)}
                >
                  <div className="store-product-image">
                    <img
                      src={`${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/${product.thumbnail}`}
                      alt={product.name}
                    />
                    {isDiscounted && (
                      <div className="store-discount-tag">
                        {product.discountType === 'percentage'
                          ? `-${parseFloat(product.discountAmount).toFixed(2)}%`
                          : `-$${parseFloat(product.discountAmount).toFixed(2)}`}
                      </div>
                    )}
                  </div>
                  <div className="store-product-info">
  <h3 className="store-product-info__title">{product.name}</h3>
  <div className="store-product-price">
    {isDiscounted ? (
      <>
        <p className="store-product-price__original">
          ${parseFloat(product.price).toFixed(2)}
        </p>
        <p className="store-product-price__discounted">
          ${parseFloat(product.discountPrice).toFixed(2)}
        </p>
      </>
    ) : (
      <p className="store-product-price__active">
        ${parseFloat(product.price).toFixed(2)}
      </p>
    )}
  </div>
  {isDiscounted && (
    <p className="store-sale-end">
      Sale Ends: {saleEndDate}
    </p>
  )}
</div>

                </div>
              );
            })
          ) : (
            <p className="store-no-products">
              No products available or still loading...
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Store;
