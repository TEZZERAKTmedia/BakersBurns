import React, { useEffect, useState } from 'react';
import './store_menu.css';
import { registerApi } from '../../config/axios';

const StoreNavbar = ({ onTypeSelect }) => {
  const [productTypes, setProductTypes] = useState([]);
  const [isOpen, setIsOpen] = useState(true); // Initial state is open

  // Fetch product types from the backend
  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await registerApi.get('/register-store/product-types');
        setProductTypes(response.data);
      } catch (error) {
        console.error('Error fetching product types:', error);
      }
    };

    fetchProductTypes();
  }, []);

  const handleTypeClick = (type) => {
    onTypeSelect(type); // Pass the selected type to the parent component
    setIsOpen(false); // Close the overlay
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="store-navbar">
          <button
            className="close-button"
            onClick={() => setIsOpen(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              zIndex: 1100,
            }}
          >
            ✕
          </button>
          <div className="store-navbar-content">
            <button
              className="store-navbar-item all-products"
              onClick={() => handleTypeClick('All')}
            >
              All Products
            </button>
            {productTypes.map((type) => (
              <button
                key={type}
                className="store-navbar-item"
                onClick={() => handleTypeClick(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Button to reopen the overlay */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'absolute', // Use absolute positioning
            top: '50%', // Center vertically
            left: '50%', // Center horizontally
            transform: 'translate(-50%, -900%)', // Adjust for element's dimensions
            zIndex: 2000,
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Menu
        </button>
      )}
    </>
  );
};

export default StoreNavbar;
