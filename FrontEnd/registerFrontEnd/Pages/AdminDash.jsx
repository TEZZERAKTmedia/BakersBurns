import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5000/api/admin/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products', error);
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('http://localhost:5000/api/admin/product', { name: newProduct }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts([...products, response.data]);
      setNewProduct('');
      setMessage('Product added successfully');
    } catch (error) {
      console.error('Error adding product', error);
      setMessage('Error adding product');
    }
  };

  const handleRemoveProduct = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/admin/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter(product => product.id !== id));
      setMessage('Product removed successfully');
    } catch (error) {
      console.error('Error removing product', error);
      setMessage('Error removing product');
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div>
        <input
          type="text"
          value={newProduct}
          onChange={(e) => setNewProduct(e.target.value)}
          placeholder="New Product Name"
        />
        <button onClick={handleAddProduct}>Add Product</button>
      </div>
      {message && <p>{message}</p>}
      <ul>
        {products.map(product => (
          <li key={product.id}>
            {product.name} <button onClick={() => handleRemoveProduct(product.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
