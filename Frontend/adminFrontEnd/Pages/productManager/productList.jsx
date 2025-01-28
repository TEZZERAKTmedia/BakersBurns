import React, { useState, useEffect } from 'react';
import ProductCard from './productCard';
import SortingControls from './sortingControls'; // Import SortingControls
import { toast } from 'react-toastify'; // Import Toastify for notifications
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for Toastify
import { useProductContext } from './ProductsContext';
import { adminApi } from '../../config/axios';

const ProductList = () => {
  const { products } = useProductContext(); // Get the latest products from context
  const [sortCriteria, setSortCriteria] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    // Update filteredProducts whenever products change
    setFilteredProducts(products);
  }, [products]);

  useEffect(() => {
    // Automatically sort filteredProducts whenever sortCriteria or sortOrder changes
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
        productTypes={[...new Set(products.map((p) => p.type))]} // Dynamically extract product types
        onFilterByType={handleFilterByType}
      />
      <div className="product-list">
        {filteredProducts.map((product) => (
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
