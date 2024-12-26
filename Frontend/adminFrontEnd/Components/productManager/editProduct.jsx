import React, { useState, useEffect,useContext  } from 'react';
import PropTypes from 'prop-types';
import { adminApi } from '../../config/axios'; // Axios config for API calls

import { useProductContext } from './ProductsContext';


const EditProductForm = ({ productId, onUpdate, onCancel }) => {
    const { fetchProducts } = useProductContext();
  const [productData, setProductData] = useState(null); // Initialize as null
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  


  // Fetch product data when the component mounts
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await adminApi.get(`/api/products/${productId}/details`);
        setProductData(response.data);
        if (response.data.thumbnail) {
          setImagePreview(`${import.meta.env.VITE_BACKEND}/uploads/${response.data.thumbnail}`);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };
    fetchProducts();
    fetchProductData();
  }, [productId]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  // Handle thumbnail change
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductData({ ...productData, thumbnail: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!productData) return;

    const missing = [];
    if (!productData.name) missing.push('name');
    if (!productData.description) missing.push('description');
    if (!productData.price || productData.price <= 0) missing.push('price');
    if (!productData.type) missing.push('type');

    setMissingFields(missing);

    if (missing.length > 0) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries(productData).forEach(([key, value]) => {
        if (value !== null) formData.append(key, value);
      });

      const response = await adminApi.put(`/api/products/${productId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchProducts();
      onCancel();
      console.log('Product updated successfully:', response.data);

      if (onUpdate) onUpdate(response.data); // Notify parent component of the update
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show a loading state while product data is being fetched
  if (!productData) {
    return <p>Loading product details...</p>;
  }

  return (
    <div className="edit-product-form">
      <h2>Edit Product</h2>

      <div className="form-section">
        <label>Product Name {missingFields.includes('name') && <span className="error-dot">*</span>}</label>
        <input
          type="text"
          name="name"
          value={productData.name}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-section">
        <label>Product Description {missingFields.includes('description') && <span className="error-dot">*</span>}</label>
        <textarea
          name="description"
          value={productData.description}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-section">
        <label>Price (USD) {missingFields.includes('price') && <span className="error-dot">*</span>}</label>
        <input
          type="number"
          name="price"
          value={productData.price}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-section">
        <label>Quantity</label>
        <input
          type="number"
          name="quantity"
          value={productData.quantity}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-section">
        <label>Type {missingFields.includes('type') && <span className="error-dot">*</span>}</label>
        <input
          type="text"
          name="type"
          value={productData.type}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-section">
        <label>Thumbnail</label>
        <input type="file" accept="image/*" onChange={handleThumbnailChange} />
        {imagePreview && <img src={imagePreview} alt="Thumbnail Preview" style={{ maxWidth: '100%', marginTop: '10px' }} />}
      </div>

      <div className="form-actions">
        <button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Product'}
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

EditProductForm.propTypes = {
    productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onClose: PropTypes.func.isRequired,
    fetchProducts: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

export default EditProductForm;
