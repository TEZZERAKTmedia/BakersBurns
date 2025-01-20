import React, { useEffect, useState } from 'react';
import './store_menu.css'; // Recycle your existing styles
import { userApi } from '../../config/axios';

const StoreNavbar = ({ onTypeSelect }) => {
  const [productTypes, setProductTypes] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // Navbar starts closed

  // Fetch product types from the backend
  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await userApi.get('/store/product-types'); // Fetch product types
        setProductTypes(response.data); // Set the product types
      } catch (error) {
        console.error('Error fetching product types:', error);
      }
    };

    fetchProductTypes();
  }, []);

  const handleTypeClick = (type) => {
    onTypeSelect(type); // Pass the selected type to the parent component
    setIsOpen(false); // Close the navbar after selecting a type
  };

  return (
    <>
      {/* Store Navbar */}
      <div className={`store-navbar ${isOpen ? 'open' : ''}`}>
        <button
          className="close-button"
          onClick={() => setIsOpen(false)} // Close the navbar
        >
          ✕
        </button>
        <div className="store-navbar-content">
          <button
            className="store-navbar-item all-products"
            onClick={() => handleTypeClick('')} // Show all products
          >
            All Products
          </button>
          {productTypes.map((type, index) => (
            <button
              key={index}
              className="store-navbar-item"
              onClick={() => handleTypeClick(type)} // Filter by selected type
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
          onClick={() => setIsOpen(true)} // Open the navbar when clicked
        >
          Menu
        </button>
      )}
    </>
  );
};

export default StoreNavbar;
