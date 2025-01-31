import React, { useState, useEffect } from 'react';
import ProductCard from './productCard';
import SortingControls from './sortingControls';
import { useProductContext } from './ProductsContext';
import { adminApi } from '../../config/axios';


const ProductList = () => {
  const { products, fetchProducts } = useProductContext(); // 🔹 Use fetchProducts from context
  const [sortCriteria, setSortCriteria] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  useEffect(() => {
    setFilteredProducts((prevFilteredProducts) => {
      const sortedList = [...prevFilteredProducts];
      sortedList.sort((a, b) => {
        let valueA = a[sortCriteria];
        let valueB = b[sortCriteria];

        if (sortCriteria === 'price') {
          valueA = parseFloat(valueA);
          valueB = parseFloat(valueB);
        }

        if (sortCriteria === 'createdAt') {
          valueA = new Date(valueA);
          valueB = new Date(valueB);
        }

        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortOrder === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      });
      return sortedList;
    });
  }, [sortCriteria, sortOrder]);

  const handleSort = (criteria) => {
    setSortCriteria(criteria);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleFilterByType = (type) => {
    if (type) {
      setFilteredProducts(products.filter((product) => product.type === type));
    } else {
      setFilteredProducts(products);
    }
  };

  // 🔹 Delete Product and Refresh List using `fetchProducts`
  const handleDeleteProduct = async (id) => {
    try {
      await adminApi.delete(`/products/${id}`);
      setSuccessMessage('Product deleted successfully!'); // Show success message
      setErrorMessage('');
      fetchProducts(); // 🔄 Use context function to refresh product list
    } catch (error) {
      console.error('Error deleting product:', error);
      
      if (error.response && error.response.status === 400) {
        setErrorMessage(error.response.data.message || 'This product cannot be deleted because it is associated with an order.');
      } else {
        setErrorMessage('Failed to delete product. Please try again later.');
      }
    }
  };

  return (
    <div>
      {/* 🔹 SUCCESS MESSAGE */}
      {successMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#28a745',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          zIndex: 9999,
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage('')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              marginLeft: '10px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ✖
          </button>
        </div>
      )}

      {/* 🔹 ERROR MESSAGE FLOATING AT TOP-RIGHT */}
      {errorMessage && (
        <div style={{
          position: 'fixed',
          top: '70px', // Slightly below success message
          right: '20px',
          backgroundColor: '#ff4d4d',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          zIndex: 9999,
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage('')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              marginLeft: '10px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ✖
          </button>
        </div>
      )}

      <SortingControls
        onSort={handleSort}
        sortCriteria={sortCriteria}
        sortOrder={sortOrder}
        productTypes={[...new Set(products.map((p) => p.type))]}
        onFilterByType={handleFilterByType}
      />

      <div className="product-list" style={{width:'100%'}}>
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-item-container">
            <ProductCard
              product={product}
              onDeleteProduct={handleDeleteProduct}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
