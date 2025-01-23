import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDiscountContext } from './discounts-context'; // Import the context

const AddDiscountForm = ({ onClose }) => {
  const { applyDiscount, fetchTypes } = useDiscountContext(); // Destructure the required context functions

  const [discountData, setDiscountData] = useState({
    discountType: 'percentage',
    discountAmount: 0,
    discountStartDate: '',
    discountEndDate: '',
    type: '',
  });

  const [productTypes, setProductTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch product types when the component mounts
  useEffect(() => {
    const fetchProductTypes = async () => {
      setLoading(true);
      try {
        const types = await fetchTypes(); // Use fetchTypes from the context
        setProductTypes(types || []);
      } catch (error) {
        console.error('Error fetching product types:', error);
        setError('Failed to fetch product types. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductTypes();
  }, [fetchTypes]);

  const handleSave = async () => {
    const missingFields = [];
    if (!discountData.discountType) missingFields.push('discountType');
    if (!discountData.discountAmount || discountData.discountAmount <= 0) missingFields.push('discountAmount');
    if (!discountData.discountStartDate) missingFields.push('discountStartDate');
    if (!discountData.discountEndDate) missingFields.push('discountEndDate');
    if (!discountData.type) missingFields.push('type');

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      await applyDiscount(discountData); // Use applyDiscount from the context
      alert('Discount applied successfully!');
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
      <h2>Add Discount</h2>
      {loading && <p>Loading product types...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

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
          onChange={(e) =>
            setDiscountData({ ...discountData, discountAmount: parseFloat(e.target.value) || 0 })
          }
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
      <div className="form-actions">
        <button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

AddDiscountForm.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default AddDiscountForm;
