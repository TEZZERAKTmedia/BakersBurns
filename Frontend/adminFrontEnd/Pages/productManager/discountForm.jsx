import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useProductContext } from './ProductsContext'; // Import the context
import { adminApi } from '../../config/axios'; // Import your Axios instance

const DiscountForm = ({ productId = null, onClose, onSuccess }) => {
  const { applyDiscount, applyDiscountByType } = useProductContext(); // Use context methods

  const [discountData, setDiscountData] = useState({
    discountType: 'percentage', // Represents the type of discount
    discountAmount: 0,         // Discount amount
    discountStartDate: '',     // Start date for the discount
    discountEndDate: '',       // End date for the discount
    type: '',                  // Represents the product type (e.g., "Featured")
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productTypes, setProductTypes] = useState([]); // State for product types
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch product types on component mount
  useEffect(() => {
    const fetchProductTypes = async () => {
      setLoading(true); // Set loading to true while fetching data
      try {
        const response = await adminApi.get('/products/types');
        setProductTypes(response.data); // Set the fetched product types to state
      } catch (error) {
        setError('Failed to fetch product types. Please try again.'); // Set error if fetching fails
      } finally {
        setLoading(false); // Set loading to false after the API call is finished
      }
    };

    fetchProductTypes();
  }, []);

  const handleSave = async () => {
    console.log('Discount Data:', discountData);

    const missingFields = [];
    if (!discountData.discountType) missingFields.push('discountType');
    if (!discountData.discountAmount || discountData.discountAmount <= 0) missingFields.push('discountAmount');
    if (!discountData.discountStartDate) missingFields.push('discountStartDate');
    if (!discountData.discountEndDate) missingFields.push('discountEndDate');
    if (!productId && !discountData.type) missingFields.push('type'); // For type-based discounts

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      if (productId) {
        // Apply discount to a specific product
        const response = await applyDiscount(productId, {
          discountType: discountData.discountType,
          discountAmount: discountData.discountAmount,
          discountStartDate: discountData.discountStartDate,
          discountEndDate: discountData.discountEndDate,
        });
        console.log('Discount applied to product:', response);
      } else {
        // Apply discount to a product type
        const response = await applyDiscountByType({
          discountType: discountData.discountType,
          discountAmount: discountData.discountAmount,
          discountStartDate: discountData.discountStartDate,
          discountEndDate: discountData.discountEndDate,
          type: discountData.type,
        });
        console.log('Discount applied to product type:', response);
      }

      if (onSuccess) {
        onSuccess(); // Notify parent of success
      }

      onClose(); // Close the form
    } catch (error) {
      console.error('Error applying discount:', error);
      alert('Failed to apply discount. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="discount-form-section">
      <h2>{productId ? 'Add Discount to Product' : 'Add Discount by Type'}</h2>

      {loading && <p>Loading product types...</p>} {/* Loading state */}
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message if any */}
      
      <div className="form-section">
        <label>Discount Type:</label>
        <select
          value={discountData.discountType}
          onChange={(e) => setDiscountData({ ...discountData, discountType: e.target.value })}
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
          value={discountData.discountAmount}
          onChange={(e) => setDiscountData({ ...discountData, discountAmount: parseFloat(e.target.value) || 0 })}
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

      {!productId && (
        <div className="form-section">
          <label>Apply to Product Type:</label>
          <select
            value={discountData.type}
            onChange={(e) => setDiscountData({ ...discountData, type: e.target.value })}
          >
            <option value="">Select a Type</option>
            {productTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-actions">
        <button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

DiscountForm.propTypes = {
  productId: PropTypes.number.isRequired, // For individual product discounts
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func, // Callback for successful discount application
};

export default DiscountForm;
