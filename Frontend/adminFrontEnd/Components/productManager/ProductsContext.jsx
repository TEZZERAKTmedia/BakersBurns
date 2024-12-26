import React, { createContext, useState, useEffect, useContext } from 'react';
import { adminApi } from '../../config/axios';

// Create the context
const ProductsContext = createContext();

// Provider Component
export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchProductTypes();
  }, []);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const response = await adminApi.get('/api/products/');
      setProducts(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Fetch product details by ID
  const fetchProductDetails = async (id) => {
    try {
      const response = await adminApi.get(`/api/products/${id}/details`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching details for product ${id}:`, error);
      throw error;
    }
  };

  // Fetch all product types
  const fetchProductTypes = async () => {
    try {
      const response = await adminApi.get('/api/products/types');
      setProductTypes(response.data);
    } catch (error) {
      console.error('Error fetching product types:', error);
    }
  };

  // Fetch all discounted products
  const fetchDiscountedProducts = async () => {
    try {
      const response = await adminApi.get('/api/products/discounted');
      setDiscountedProducts(response.data);
    } catch (error) {
      console.error('Error fetching discounted products:', error);
    }
  };

  // Add a new product
  const addProduct = async (productData) => {
    try {
      const response = await adminApi.post('/api/products/', productData);
      fetchProducts(); // Refresh products after addition
      return response.data;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  // Update a product
  const updateProduct = async (id, updatedData) => {
    try {
      const response = await adminApi.put(`/api/products/${id}`, updatedData);
      fetchProducts(); // Refresh products after update
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  // Delete a product
  const deleteProduct = async (id) => {
    try {
      await adminApi.delete(`/api/products/${id}`);
      fetchProducts(); // Refresh products after deletion
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  // Apply a discount to a product
  const applyDiscount = async (productId, discountData) => {
    try {
      const response = await adminApi.post(`/api/products/${productId}/discount`, discountData);
      fetchProducts(); // Refresh products after applying the discount
      return response.data;
    } catch (error) {
      console.error('Error applying discount:', error);
      throw error;
    }
  };

  // Update a discount on a product
  const updateDiscount = async (productId, discountData) => {
    try {
      const response = await adminApi.put(`/api/products/${productId}/discount`, discountData);
      fetchProducts(); // Refresh products after updating the discount
      return response.data;
    } catch (error) {
      console.error('Error updating discount:', error);
      throw error;
    }
  };

  // Remove a discount from a product
  const removeDiscount = async (productId) => {
    try {
      await adminApi.delete(`/api/products/${productId}/discount`);
      fetchProducts(); // Refresh products after removing discount
    } catch (error) {
      console.error('Error removing discount:', error);
      throw error;
    }
  };

  // Apply a discount by type
  const applyDiscountByType = async (discountData) => {
    try {
      const response = await adminApi.post('/api/products/discounts-by-type', discountData);
      fetchProducts(); // Refresh products after applying the discount by type
      return response.data;
    } catch (error) {
      console.error('Error applying discount by type:', error);
      throw error;
    }
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        productTypes,
        discountedProducts,
        isLoading,
        fetchProducts,
        fetchProductDetails,
        fetchProductTypes,
        fetchDiscountedProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        applyDiscount,
        updateDiscount,
        removeDiscount,
        applyDiscountByType,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

// Hook for consuming context
export const useProductContext = () => {
  return useContext(ProductsContext);
};

export default ProductsContext;
