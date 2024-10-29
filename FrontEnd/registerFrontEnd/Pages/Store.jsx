import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registerApi } from '../config/axios';
import '../PagesCss/store.css';

const Store = () => {
  const [products, setProducts] = useState([]);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Function to fetch products
  const fetchProducts = async () => {
    try {
      const response = await registerApi.get('/register-store/products');
      console.log('Fetched products:', response.data); // Debugging log
      // Set the products array from response.data.products
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <div className="store-container">
      <h2>Store</h2>

      <div className="product-grid">
        {/* Log the state to ensure it's being populated */}
        {console.log('Products state:', products)}

        {products.length > 0 ? (
          products.map(product => (
            <div className="product-tile" key={product.id}>
              <div className="product-image">
                <img src={`${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/${product.image}`} alt={product.name} />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p>${product.price}</p>
                <Link to="/login">
                  <button>Add to Cart</button>
                </Link>
              </div>
              <div className="product-description">
                <p>{product.description}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No products available or still loading...</p>
        )}
      </div>
    </div>
  );
};

export default Store;
