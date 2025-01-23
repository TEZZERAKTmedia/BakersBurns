import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useProductContext } from './ProductsContext'; // Import the context

const DiscountByProductForm = ({ product, onClose, onSuccess }) => {
  const { applyDiscount } = useProductContext(); // Use the context to access the applyDiscount function

  const [discountData, setDiscountData] = useState({
    type: product.discountType || 'percentage',
    amount: product.discountAmount || 0,
    discountStartDate: product.discountStartDate || '',
    discountEndDate: product.discountEndDate || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    const { type, amount, discountStartDate, discountEndDate } = discountData;

    // Validate fields
    if (!amount || !discountStartDate || !discountEndDate) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await applyDiscount(product.id, {
        discountType: type,
        discountAmount: amount,
        discountStartDate,
        discountEndDate,
      });

      console.log('Discount applied:', response);

      if (onSuccess) {
        onSuccess(response);
      }
      onClose();
    } catch (error) {
      console.error('Error applying discount to product:', error);
      alert('Failed to apply discount. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="discount-form-section">
      <h2>Apply Discount to Product</h2>
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
      <div className="form-actions">
        <button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

DiscountByProductForm.propTypes = {
  product: PropTypes.object.isRequired, // Accept product object
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default DiscountByProductForm;
