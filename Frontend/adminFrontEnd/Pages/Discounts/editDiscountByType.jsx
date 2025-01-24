import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminApi } from '../../config/axios';
import { motion } from 'framer-motion';

const DiscountEditForm = ({ discount, productType, onClose, onSuccess }) => {
  const [formValues, setFormValues] = useState({
    productType: discount.productType,
    discountType: discount.discountType || 'percentage', // Default to 'percentage'
    discountAmount: discount.discountAmount,
    discountStartDate: discount.discountStartDate,
    discountEndDate: discount.discountEndDate,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that all fields are filled
    if (!formValues.discountType) {
      toast.error('Discount type is required. Defaulting to "Percentage".');
      setFormValues((prevValues) => ({
        ...prevValues,
        discountType: 'percentage',
      }));
      return;
    }

    if (!formValues.discountAmount || formValues.discountAmount <= 0) {
      toast.error('Discount amount must be greater than 0.');
      return;
    }

    if (!formValues.discountStartDate || !formValues.discountEndDate) {
      toast.error('Start and end dates are required.');
      return;
    }

    try {
      const response = await adminApi.put(`/discount/`, {
        productType, // Send the product type to update all products with this type
        discountType: formValues.discountType,
        discountAmount: parseFloat(formValues.discountAmount), // Ensure discountAmount is a number
        discountStartDate: formValues.discountStartDate,
        discountEndDate: formValues.discountEndDate,
      });

      toast.success('Discount updated for all products of this type!');
      onSuccess(); // Close the modal on success
    } catch (error) {
      console.error('Error updating discount:', error);
      toast.error('Failed to update discount');
    }
  };

  // Animation for modal
  const modalAnimation = {
    hidden: { opacity: 0, y: 50 }, // Start from below and hidden
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }, // Fade in and come to original position
    exit: { opacity: 0, y: 50, transition: { duration: 0.3 } }, // Fade out and slide down
  };

  return (
    <motion.div
      className="form-section"
      variants={modalAnimation}
      initial="hidden" // Starts hidden when the modal appears
      animate="visible" // Makes the modal visible
      exit="exit" // Applies exit animation on close
    >
      <h3>Edit Discount for {productType}</h3> {/* Display product type */}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Discount Type:</label>
          <select
            name="discountType"
            value={formValues.discountType}
            onChange={handleInputChange}
            required
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>

        <div>
          <label>Discount Amount:</label>
          <input
            type="number"
            name="discountAmount"
            value={formValues.discountAmount}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Start Date:</label>
          <input
            type="date"
            name="discountStartDate"
            value={formValues.discountStartDate}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>End Date:</label>
          <input
            type="date"
            name="discountEndDate"
            value={formValues.discountEndDate}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit">Save</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default DiscountEditForm;
