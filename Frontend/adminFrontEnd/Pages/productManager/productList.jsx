import React, { useState, useEffect } from 'react';
import ProductCard from './productCard';
import SortingControls from './sortingControls'; // Import SortingControls
import { toast } from 'react-toastify'; // Import Toastify for notifications
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for Toastify
import { adminApi } from '../../config/axios';

const ProductList = ({ products }) => {
  const [sortCriteria, setSortCriteria] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortedProducts, setSortedProducts] = useState(products);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [productTypes, setProductTypes] = useState([]);

  useEffect(() => {
    // Fetch product types when component mounts
    const fetchProductTypes = async () => {
      try {
        const response = await adminApi.get('/products/types');
        setProductTypes(response.data);
      } catch (error) {
        console.error('Error fetching product types:', error);
        toast.error("Failed to fetch product types."); // Show Toastify error
      }
    };

    fetchProductTypes();
  }, []);
  

  useEffect(() => {
    // Re-sort filtered products based on sortCriteria and sortOrder
    const sortedList = [...filteredProducts];
    sortedList.sort((a, b) => {
      let valueA = a[sortCriteria];
      let valueB = b[sortCriteria];

      // Handle sorting for numeric values (e.g., price)
      if (sortCriteria === 'price') {
        valueA = parseFloat(valueA);
        valueB = parseFloat(valueB);
      }

      // Handle sorting for dates (e.g., createdAt)
      if (sortCriteria === 'createdAt') {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
      }

      // Handle sorting for string values (e.g., name, type)
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      // Handle comparison for other cases (e.g., numbers)
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });

    setSortedProducts(sortedList);
  }, [filteredProducts, sortCriteria, sortOrder]);

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

  const handleDeleteProduct = async (id) => {
    try {
      await adminApi.delete(`/products/${id}`); // Assuming this calls the API to delete the product
      toast.success('Product deleted successfully!'); // Show success message
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product. This product might have been purchased or is in use.');
    }
  };

  return (
    <div>
      <SortingControls
        onSort={handleSort}
        sortCriteria={sortCriteria}
        sortOrder={sortOrder}
        productTypes={productTypes}
        onFilterByType={handleFilterByType}
      />
      <div className="product-list">
        {sortedProducts.map((product) => (
          <div key={product.id} className="product-item-container">
            <ProductCard
              product={product}
              onDeleteProduct={handleDeleteProduct} // Use the modified handleDeleteProduct
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
