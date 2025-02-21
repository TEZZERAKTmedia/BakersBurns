import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { adminApi } from '../../config/axios';
import { useProductContext } from './ProductsContext';
import DesktopMediaUploader from '../../Components/desktopMediaUploader';
import MobileMediaUploader from '../../Components/mobileMediaUploader';
import ThumbnailUploader from './components/thumbnailUploader';

const EditProductForm = ({ productId, onUpdate, onCancel }) => {
  const { fetchProducts, fetchProductMedia, updateProductAndMedia } = useProductContext();
  const [productData, setProductData] = useState(null);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [removedMedia, setRemovedMedia] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Create refs for the required input fields
  const inputRefs = {
    name: useRef(null),
    description: useRef(null),
    price: useRef(null),
    quantity: useRef(null),
    type: useRef(null),
    weight: useRef(null),
    unit: useRef(null),
    length: useRef(null),
    width: useRef(null),
    height: useRef(null),
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await adminApi.get(`/products/${productId}/details`);
        setProductData(response.data);
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    const fetchMedia = async () => {
      setMediaLoading(true);
      try {
        const media = await fetchProductMedia(productId);
        const formattedMedia = media.map((item, index) => ({
          id: item.id,
          src: `${import.meta.env.VITE_BACKEND}/uploads/${item.url}`,
          type: item.type,
          file: null,
          order: item.order || index + 1,
        }));
        setMediaPreviews(formattedMedia);
      } catch (error) {
        console.error('Error fetching media:', error);
      } finally {
        setMediaLoading(false);
      }
    };

    fetchProductData();
    fetchMedia();
  }, [productId, fetchProductMedia]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (file) => {
    if (file) {
      setProductData((prev) => ({ ...prev, thumbnail: file }));
    }
  };

  const handleMediaChange = (updatedMedia) => {
    const currentMediaIds = mediaPreviews.map((media) => media.id);
    const updatedMediaIds = updatedMedia.map((media) => media.id);
    const removed = currentMediaIds.filter((id) => !updatedMediaIds.includes(id));
    setRemovedMedia((prev) => [...prev, ...removed]);
    setMediaPreviews(updatedMedia);
  };

  const handleSubmit = async () => {
    if (!productData) return;

    // Validate required fields.
    // For dimensions and weight, we allow 0 as a valid input, so we only flag missing if the value is empty.
    const missing = [];
    if (!productData.name || !productData.name.trim()) missing.push('name');
    if (!productData.description || !productData.description.trim()) missing.push('description');
    if (!productData.price || productData.price <= 0) missing.push('price');
    if (!productData.quantity || productData.quantity <= 0) missing.push('quantity');
    if (!productData.type || !productData.type.trim()) missing.push('type');

    // For dimensions/weight, check for undefined or empty string, but 0 is allowed.
    if (productData.length === undefined || productData.length === "") missing.push('length');
    if (productData.width === undefined || productData.width === "") missing.push('width');
    if (productData.height === undefined || productData.height === "") missing.push('height');
    if (productData.weight === undefined || productData.weight === "") missing.push('weight');
    if (!productData.unit || !productData.unit.trim()) missing.push('unit');

    setMissingFields(missing);

    // If any required field is missing, scroll to and focus on the first one.
    if (missing.length > 0) {
      const firstMissingField = missing[0];
      if (inputRefs[firstMissingField] && inputRefs[firstMissingField].current) {
        inputRefs[firstMissingField].current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        inputRefs[firstMissingField].current.focus();
      }
      return;
    }

    // Check if any dimension or weight is exactly 0 and warn the user.
    if (
      Number(productData.length) === 0 ||
      Number(productData.width) === 0 ||
      Number(productData.height) === 0 ||
      Number(productData.weight) === 0
    ) {
      const confirmMessage =
        'You have entered 0 for a dimension or weight. Shipping costs will be inaccurate. Are you sure you want to continue?';
      const proceed = window.confirm(confirmMessage);
      if (!proceed) return;
    }

    setIsSubmitting(true);

    try {
      const productFormData = new FormData();
      Object.entries(productData).forEach(([key, value]) => {
        if (value !== null) productFormData.append(key, value);
      });

      const mediaFormData = new FormData();
      const mediaToKeep = mediaPreviews.map((media) => ({
        id: media.id,
        order: media.order,
      }));

      mediaPreviews.forEach((media, index) => {
        if (media.file) {
          mediaFormData.append('media', media.file);
          mediaFormData.append(`mediaOrder_${index}`, media.order);
        }
      });

      mediaFormData.append('mediaToKeep', JSON.stringify(mediaToKeep));

      if (removedMedia.length > 0) {
        removedMedia.forEach((id) => {
          mediaFormData.append('removedMediaIds', id);
        });
      }

      await updateProductAndMedia(productId, productFormData, mediaFormData);
      if (onUpdate) onUpdate();
      onCancel();
      fetchProducts();
    } catch (error) {
      console.error('Error updating product and media:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!productData || mediaLoading) return <p>Loading product details...</p>;

  return (
    <div className="edit-product-form">
      <h2>Edit Product</h2>

      <div className="form-section">
        <label>Product Name</label>
        <input
          type="text"
          name="name"
          ref={inputRefs.name}
          value={productData.name}
          onChange={handleInputChange}
          style={{ border: missingFields.includes('name') ? '2px solid red' : '' }}
        />
      </div>

      <div className="form-section">
        <label>Product Description</label>
        <textarea
          name="description"
          ref={inputRefs.description}
          value={productData.description}
          onChange={handleInputChange}
          style={{ border: missingFields.includes('description') ? '2px solid red' : '' }}
        />
      </div>

      <div className="form-section">
        <label>Price (USD)</label>
        <input
          type="number"
          name="price"
          ref={inputRefs.price}
          value={productData.price}
          onChange={handleInputChange}
          style={{ border: missingFields.includes('price') ? '2px solid red' : '' }}
        />
      </div>

      <div className="form-section">
        <label>Quantity</label>
        <input
          type="number"
          name="quantity"
          ref={inputRefs.quantity}
          value={productData.quantity}
          onChange={handleInputChange}
          style={{ border: missingFields.includes('quantity') ? '2px solid red' : '' }}
        />
      </div>

      <div className="form-section">
        <label>Type</label>
        <input
          type="text"
          name="type"
          ref={inputRefs.type}
          value={productData.type}
          onChange={handleInputChange}
          style={{ border: missingFields.includes('type') ? '2px solid red' : '' }}
        />
      </div>

      <div className="form-section">
        <label>Weight</label>
        <input
          type="number"
          name="weight"
          ref={inputRefs.weight}
          value={productData.weight}
          onChange={handleInputChange}
          style={{ border: missingFields.includes('weight') ? '2px solid red' : '' }}
        />
      </div>

      <div className="form-section">
        <label>Unit</label>
        <select
          name="unit"
          ref={inputRefs.unit}
          value={productData.unit}
          onChange={handleInputChange}
          style={{ border: missingFields.includes('unit') ? '2px solid red' : '' }}
        >
          <option value="">Select Unit</option>
          <option value="lb">Pounds (lb)</option>
          <option value="kg">Kilograms (kg)</option>
        </select>
      </div>

      <div className="form-section">
        <label>Length</label>
        <input
          type="number"
          name="length"
          ref={inputRefs.length}
          value={productData.length}
          onChange={handleInputChange}
          style={{ border: missingFields.includes('length') ? '2px solid red' : '' }}
        />
      </div>

      <div className="form-section">
        <label>Width</label>
        <input
          type="number"
          name="width"
          ref={inputRefs.width}
          value={productData.width}
          onChange={handleInputChange}
          style={{ border: missingFields.includes('width') ? '2px solid red' : '' }}
        />
      </div>

      <div className="form-section">
        <label>Height</label>
        <input
          type="number"
          name="height"
          ref={inputRefs.height}
          value={productData.height}
          onChange={handleInputChange}
          style={{ border: missingFields.includes('height') ? '2px solid red' : '' }}
        />
      </div>

      <div className="form-section">
        <ThumbnailUploader
          imagePreview={
            productData.thumbnail && typeof productData.thumbnail === 'string'
              ? `${import.meta.env.VITE_BACKEND}/uploads/${productData.thumbnail}`
              : null
          }
          onImageUpload={handleThumbnailChange}
        />
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
  productId: PropTypes.string.isRequired,
  onUpdate: PropTypes.func,
  onCancel: PropTypes.func.isRequired,
};

export default EditProductForm;
