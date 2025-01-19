import React, { useEffect, useState } from 'react';
import './store_menu.css';
import { registerApi } from '../../config/axios';

const StoreNavbar = ({ onTypeSelect }) => {
  const [productTypes, setProductTypes] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // Default closed

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
      {/* Store Navbar */}
      <div className={`store-navbar ${isOpen ? 'open' : ''}`}>
        <button
          className="close-button"
          onClick={() => setIsOpen(false)}
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

      {/* Button to reopen the Store Navbar */}
      {!isOpen && (
        <button
          className="reopen-button"
          onClick={() => setIsOpen(true)}
        >
          Menu
        </button>
      )}
    </>
  );
};

export default StoreNavbar;
