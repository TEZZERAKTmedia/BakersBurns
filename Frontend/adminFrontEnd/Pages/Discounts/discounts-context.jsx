import React, { createContext, useContext, useState, useCallback } from 'react';
import { adminApi } from '../../config/axios'; // Assuming you have axios configured
import { toast } from 'react-toastify';
const DiscountContext = createContext();

export const useDiscountContext = () => {
  return useContext(DiscountContext); // Hook to access context
};

export const DiscountProvider = ({ children }) => {
  const [discounts, setDiscounts] = useState([]);

  // Fetch product discounts from the backend API
  const fetchDiscounts = useCallback(async () => {
    try {
      const response = await adminApi.get(`/discount/`); // Fetch the discounts by product ID
      setDiscounts(response.data);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    }
  }, []);

  // Fetch all product types
  const fetchTypes = useCallback(async () => {
    try {
      const response = await adminApi.get(`/discount/type`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product types:', error);
      throw error;
    }
  }, []);

  // Apply discount by type
  const applyDiscount = useCallback(async (discountData) => {
    try {
      const response = await adminApi.post(`/discount/create-by-type`, discountData);
      fetchDiscounts(); // Refresh product data (optional)
      return response.data;
    } catch (error) {
      console.error('Error applying discount:', error);
      throw error;
    }
  }, [fetchDiscounts]);

  // Delete a specific discount by ID
  const deleteDiscountByType = useCallback(async (productType) => {
    try {
      await adminApi.delete(`/discount/`, { data: { productType } });
      fetchDiscounts(); // Refresh product data (optional)
      toast.success("Discount removed successfully!");
    } catch (error) {
      console.error("Error deleting discount by type:", error);
      toast.error("Failed to remove discount.");
    }
  }, []);
  

  return (
    <DiscountContext.Provider
      value={{
        fetchDiscounts,
        deleteDiscountByType,
        applyDiscount,
        fetchTypes,
        discounts,
      }}
    >
      {children}
    </DiscountContext.Provider>
  );
};
