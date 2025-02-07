import React, { useState, useEffect } from 'react';
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

    const missing = [];
    if (!productData.name) missing.push('name');
    if (!productData.description) missing.push('description');
    if (!productData.price || productData.price <= 0) missing.push('price');
    if (!productData.type) missing.push('type');
    if (!productData.length || productData.length <= 0) missing.push('length');
    if (!productData.width || productData.width <= 0) missing.push('width');
    if (!productData.height || productData.height <= 0) missing.push('height');
    if (!productData.weight || productData.weight <= 0) missing.push('weight');
    if (!productData.unit) missing.push('unit');
    setMissingFields(missing);

    if (missing.length > 0) return;

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
        <input type="text" name="name" value={productData.name} onChange={handleInputChange} />
      </div>

      <div className="form-section">
        <label>Product Description</label>
        <textarea name="description" value={productData.description} onChange={handleInputChange} />
      </div>

      <div className="form-section">
        <label>Price (USD)</label>
        <input type="number" name="price" value={productData.price} onChange={handleInputChange} />
      </div>

      <div className="form-section">
        <label>Quantity</label>
        <input type="number" name="quantity" value={productData.quantity} onChange={handleInputChange} />
      </div>

      <div className="form-section">
        <label>Type</label>
        <input type="text" name="type" value={productData.type} onChange={handleInputChange} />
      </div>

      {/* 🔹 Weight & Unit Selection */}
      <div className="form-section">
        <label>Weight</label>
        <input type="number" name="weight" value={productData.weight} onChange={handleInputChange} />
      

      <div>
        <label>Unit</label>
        <select name="unit" value={productData.unit} onChange={handleInputChange}>
          <option value="lb">Pounds (lb)</option>
          <option value="kg">Kilograms (kg)</option>
        </select>
      </div>

      {/* 🔹 Dimensions */}
      <div >
        <label>Length</label>
        <input type="number" name="length" value={productData.length} onChange={handleInputChange} />
      </div>

      <div >
        <label>Width</label>
        <input type="number" name="width" value={productData.width} onChange={handleInputChange} />
      </div>

      <div >
        <label>Height</label>
        <input type="number" name="height" value={productData.height} onChange={handleInputChange} />
      </div>
      </div>

      <div className="form-section">
        <ThumbnailUploader
          imagePreview={productData.thumbnail && typeof productData.thumbnail === 'string'
            ? `${import.meta.env.VITE_BACKEND}/uploads/${productData.thumbnail}`
            : null}
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

export default EditProductForm;
