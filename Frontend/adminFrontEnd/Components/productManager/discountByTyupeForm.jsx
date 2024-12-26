import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { adminApi } from '../config/axios'; // Ensure this is your Axios instance

const DiscountByTypeForm = ({ productTypes, onClose, onSuccess }) => {
  const [discountData, setDiscountData] = useState({
    type: 'percentage',
    amount: 0,
    discountStartDate: '',
    discountEndDate: '',
    productType: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    const { type, amount, discountStartDate, discountEndDate, productType } = discountData;

    // Validate fields
    if (!amount || !discountStartDate || !discountEndDate || !productType) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await adminApi.post(`/api/products/discounts/by-type`, {
        discountType: type,
        discountAmount: amount,
        discountStartDate,
        discountEndDate,
        type: productType,
      });
      console.log('Discount applied by type:', response.data);

      if (onSuccess) {
        onSuccess(response.data);
      }
      onClose();
    } catch (error) {
      console.error('Error applying discount by type:', error.response?.data || error.message);
      alert('Failed to apply discount. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="discount-form-section">
      <h2>Apply Discount by Product Type</h2>
      <div className="form-section">
        <label>Discount Type:</label>
        <select
          value={discountData.type}
          onChange={(e) => setDiscountData({ ...discountData, type: e.target.value })}
        >
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
        </select>
      </div>
      <div className="form-section">
        <label>Discount Amount:</label>
        <input
          type="number"
          step="0.01"
          value={discountData.amount}
          onChange={(e) => setDiscountData({ ...discountData, amount: parseFloat(e.target.value) || 0 })}
        />
      </div>
      <div className="form-section">
        <label>Start Date:</label>
        <input
          type="date"
          value={discountData.discountStartDate}
          onChange={(e) => setDiscountData({ ...discountData, discountStartDate: e.target.value })}
        />
      </div>
      <div className="form-section">
        <label>End Date:</label>
        <input
          type="date"
          value={discountData.discountEndDate}
          onChange={(e) => setDiscountData({ ...discountData, discountEndDate: e.target.value })}
        />
      </div>
      <div className="form-section">
        <label>Product Type:</label>
        <select
          value={discountData.productType}
          onChange={(e) => setDiscountData({ ...discountData, productType: e.target.value })}
        >
          <option value="">Select a Type</option>
          {productTypes.map((type, index) => (
            <option key={index} value={type.type}>
              {type.type}
            </option>
          ))}
        </select>
      </div>
      <div className="form-actions">
        <button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

DiscountByTypeForm.propTypes = {
  productTypes: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default DiscountByTypeForm;
