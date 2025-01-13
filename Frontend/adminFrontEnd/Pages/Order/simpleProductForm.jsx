import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { adminApi } from '../../config/axios';
import './simple_product_uploader.css'; // Import the CSS file

const SimpleProductUploader = ({ onProductAdded, onClose }) => {
  const [productDetails, setProductDetails] = useState({
    name: '',
    description: '',
    price: '',
    quantity: 1,
    thumbnail: null,
  });
  const [showTooltip, setShowTooltip] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [missingFields, setMissingFields] = useState([]);

  const handleQuestionMarkClick = (event) => {
    event.preventDefault(); // Prevent default routing behavior
    setShowTooltip(!showTooltip); // Toggle the tooltip
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
      setProductDetails((prev) => ({ ...prev, thumbnail: file }));
    }
  };

  const validateFields = () => {
    const missing = [];
    if (!productDetails.name) missing.push('name');
    if (!productDetails.description) missing.push('description');
    if (!productDetails.price || productDetails.price <= 0) missing.push('price');
    return missing;
  };

  const handleSave = async () => {
    const missing = validateFields();

    if (missing.length > 0) {
      setMissingFields(missing);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', productDetails.name);
      formData.append('description', productDetails.description);
      formData.append('price', productDetails.price);
      formData.append('quantity', 0); // Always set quantity to 0
      if (productDetails.thumbnail) {
        formData.append('thumbnail', productDetails.thumbnail);
      }

      const response = await adminApi.post('/orders/quick-add-product', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onProductAdded(response.data); // Notify parent component with added product
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    }
  };

  return (
    <div className="simple-product-uploader-container">
      <h3 className="simple-product-uploader-header">Add New Product</h3>
      {missingFields.length > 0 && (
        <p className="simple-product-uploader-error-text">
          Missing fields: {missingFields.join(', ')}
        </p>
      )}
      <div className="simple-product-uploader-form-group">
        <label className="simple-product-uploader-label">
          Product Name:
          <input
            type="text"
            name="name"
            value={productDetails.name}
            onChange={handleInputChange}
            className="simple-product-uploader-input"
          />
        </label>
      </div>
      <div className="simple-product-uploader-form-group">
        <label className="simple-product-uploader-label">
          Description:
          <input
            type="text"
            name="description"
            value={productDetails.description}
            onChange={handleInputChange}
            className="simple-product-uploader-input"
          />
        </label>
      </div>
      <div className="simple-product-uploader-form-group">
        <label className="simple-product-uploader-label">
          Price:
          <input
            type="number"
            name="price"
            value={productDetails.price}
            onChange={handleInputChange}
            className="simple-product-uploader-input"
          />
        </label>
      </div>
      <div className="simple-product-uploader-form-group">
        <label className="simple-product-uploader-label">
          Quantity:
          <div className="simple-product-uploader-quantity-container">
            <input
              type="number"
              name="quantity"
              value={0}
              readOnly
              className="simple-product-uploader-input simple-product-uploader-readonly"
            />
            <button
              onClick={handleQuestionMarkClick}
              className="simple-product-uploader-question-mark"
              aria-label="Why is quantity set to 0?"
            >
              ?
            </button>
          </div>
        </label>
      </div>
      {showTooltip && (
        <div className="simple-product-uploader-tooltip">
          <p>
            The quantity for this product is set to 0 because this form is for creating
            products specifically for orders where the transaction is handled outside the
            store. If you want to add a product with a specified quantity, please visit
            the{' '}
            <a href="/product-manager" className="simple-product-uploader-link">
              Product Manager
            </a>{' '}
            page.
          </p>
          <button
            onClick={() => setShowTooltip(false)}
            className="simple-product-uploader-close-tooltip"
          >
            Close
          </button>
        </div>
      )}
      <div className="simple-product-uploader-form-group">
        <label className="simple-product-uploader-label">
          Thumbnail:
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="simple-product-uploader-input-file"
          />
        </label>
        {thumbnailPreview && (
          <div className="simple-product-uploader-thumbnail-preview-container">
            <img
              src={thumbnailPreview}
              alt="Thumbnail Preview"
              className="simple-product-uploader-thumbnail-preview"
            />
          </div>
        )}
      </div>
      <div className="simple-product-uploader-button-group">
        <button onClick={handleSave} className="simple-product-uploader-save-button">
          Save
        </button>
        <button onClick={onClose} className="simple-product-uploader-cancel-button">
          Cancel
        </button>
      </div>
    </div>
  );
};

SimpleProductUploader.propTypes = {
  onProductAdded: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SimpleProductUploader;
