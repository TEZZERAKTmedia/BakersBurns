import React, { useEffect, useState } from 'react';
import './store_menu.css';
import { registerApi } from '../../config/axios';

const StoreNavbar = ({ onTypeSelect }) => {
  // State to store an array of objects: { type, thumbnails }
  const [productTypes, setProductTypes] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        // This endpoint already returns objects with { type, thumbnails }
        const response = await registerApi.get('/register-store/product-types');
        console.log(response.data);
        setProductTypes(response.data);
      } catch (error) {
        console.error('Error fetching product types:', error);
      }
    };

    fetchProductTypes();
  }, []);

  const handleTypeClick = (type) => {
    onTypeSelect(type);
    setIsOpen(false);
  };

  return (
    <>
      {/* Sliding Sidebar Menu */}
      <div className={`store-navbar ${isOpen ? 'open' : ''}`}>
        <button className="close-button" onClick={() => setIsOpen(false)}>
          ✕
        </button>

        <div className="store-navbar-content">
          <button
            className="all-products"
            onClick={() => handleTypeClick('All')}
          >
            All Products
          </button>

          {productTypes.map((productType, sectionIndex) => (
            <div 
             key={`${productType.type}-${sectionIndex}`}
             onClick={() => handleTypeClick(productType.type)}
             className="store-navbar-section" >

              <h2
                className="store-navbar-title"
                onClick={() => handleTypeClick(productType.type)}
              >
                {productType.type}s
              </h2>
              <div className="thumbnail-container">
                {Array.isArray(productType.thumbnails) && productType.thumbnails.length > 0 ? (
                  productType.thumbnails.slice(0, 3).map((thumbnail, thumbIndex) => (
                    <img
                      key={`${productType.type}-${thumbIndex}`}
                      src={`${import.meta.env.VITE_BACKEND}/uploads/${thumbnail}`}
                      alt={`Thumbnail for ${productType.type}`}
                    />
                  ))
                ) : (
                  <p>No products</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Button to reopen the Store Navbar */}
      {!isOpen && (
        <button className="reopen-button" onClick={() => setIsOpen(true)}>
          Menu
        </button>
      )}
    </>
  );
};

export default StoreNavbar;
