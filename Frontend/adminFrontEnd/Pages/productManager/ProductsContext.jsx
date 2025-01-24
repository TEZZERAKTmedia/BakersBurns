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
      const response = await adminApi.get('/products/');
      setProducts(response.data);
      console.log(response.data)
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Fetch product details by ID
  const fetchProductDetails = async (id) => {
    try {
      const response = await adminApi.get(`/products/${id}/details`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching details for product ${id}:`, error);
      throw error;
    }
  };

  // Fetch all product types
  const fetchProductTypes = async () => {
    try {
      const response = await adminApi.get('/products/types');
      setProductTypes(response.data);
    } catch (error) {
      console.error('Error fetching product types:', error);
    }
  };

  // Fetch discounted products
  const addProductWithMedia = async (productData, mediaFiles) => {
    try {
      const productFormData = new FormData();
  
      // Append all product data to FormData
      Object.entries(productData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          productFormData.append(key, value);
        }
      });
  
      // Step 1: Add the product
      const productResponse = await adminApi.post('/products', productFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      const productId = productResponse.data.id;
  
      if (!productId) {
        throw new Error('Failed to retrieve product ID after creating the product.');
      }
  
      // Step 2: Add media files if any
      if (mediaFiles && mediaFiles.length > 0) {
        const mediaFormData = new FormData();
        mediaFiles.forEach((media, index) => {
          mediaFormData.append('media', media.file);
          mediaFormData.append(`mediaOrder_${index}`, index + 1);
        });
  
        // Pass the productId as a query parameter
        await adminApi.post(`/products/add-media?productId=${productId}`, mediaFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
  
      // Step 3: Refresh the products list
      await fetchProducts();
  
      return { product: productResponse.data };
    } catch (error) {
      console.error('Error adding product or media:', error);
      throw error;
    }
  };
  
  

  // Update a product and media
  // Update a product and media
const updateProductAndMedia = async (productId, productFormData, mediaFormData) => {
  try {
    // Assuming mediaToKeep is passed as a FormData entry
    if (mediaFormData) {
      const mediaToKeep = mediaFormData.get('mediaToKeep');
      console.log('Media to keep:', mediaToKeep);
    }

    const [productResponse, mediaResponse] = await Promise.all([
      adminApi.put(`/products/update-product/${productId}`, productFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      adminApi.put(`/products/update-media/${productId}`, mediaFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    ]);

    console.log('Product Response:', productResponse.data);
    console.log('Media Response:', mediaResponse.data);

    return { product: productResponse.data, media: mediaResponse.data };
  } catch (error) {
    console.error('Error in updateProductAndMedia:', error);
    throw error;
  }
};

  
   
  
  

  // Fetch product media
  const fetchProductMedia = async (productId) => {
    try {
      const response = await adminApi.get(`/products/${productId}/media`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching media for product ${productId}:`, error);
      throw error;
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await adminApi.delete(`/products/${productId}`); // Adjust the API call based on your backend
      setProducts((prevProducts) => prevProducts.filter((p) => p.id !== productId)); // Remove the product from state
      console.log(`Product ${productId} deleted successfully`);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };
  

  // Delete media by ID
  const deleteMedia = async (mediaId) => {
    try {
      const response = await adminApi.delete(`/products/media/${mediaId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting media with ID ${mediaId}:`, error);
      throw error;
    }
  };

  // Apply a discount to a product
  const applyDiscount = async (productId, discountData) => {
    try {
      const response = await adminApi.post(`/products/${productId}/discount`, discountData);
      fetchProducts();
      return response.data;
    } catch (error) {
      console.error('Error applying discount:', error);
      throw error;
    }
  };

  // Update a discount on a product
  const updateDiscount = async (productId, discountData) => {
    try {
      const response = await adminApi.put(`/products/${productId}/discount`, discountData);
      fetchProducts();
      return response.data;
    } catch (error) {
      console.error('Error updating discount:', error);
      throw error;
    }
  };

  // Remove a discount from a product
  const removeDiscount = async (productId) => {
    try {
      await adminApi.delete(`/products/${productId}/discount`);
      fetchProducts();
    } catch (error) {
      console.error('Error removing discount:', error);
      throw error;
    }
  };

  // Apply a discount by type
  const applyDiscountByType = async (discountData) => {
    try {
      const response = await adminApi.post('/products/discounts-by-type', discountData);
      fetchProducts();
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
        deleteProduct,
        fetchProductMedia,
        addProductWithMedia,
        updateProductAndMedia,
        deleteMedia,
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
