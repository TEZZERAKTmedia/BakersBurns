import React, { useState, useEffect, useContext } from 'react';
import '../Componentcss/store.css'; // Import the CSS file
import { registerApi } from '../config/axios'; // Import shopApi and userApi correctly



const Store = () => {
  const [products, setProducts] = useState([]);
  const { token, userId } = useContext(AuthContext); // Access token and userId from AuthContext

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await registerApi.get('/products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    try {
      await userApi.post('/api/cart', { userId, productId, quantity:1 }, {
        headers: {
          'Authorization': `Bearer ${token}` // Include the token in the Authorization header
        }
      });
      console.log('Product added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="store-container">
      <h2>Store</h2>
      <div className="product-grid">
        {products.map(product => (
          <div className="product-tile" key={product.id}>
            <div className="product-image">
             <img src={`http://localhost:3450/uploads/${product.image}`} alt={product.name} />
             </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p>${product.price}</p>
              <button onClick={() => handleAddToCart(product.id)}>Add to Cart</button>
            </div>
            <div className="product-description">
              <p>{product.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Store;
