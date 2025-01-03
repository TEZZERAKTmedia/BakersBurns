import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { adminApi } from '../../config/axios';
import { useProductContext } from './ProductsContext';
import DesktopMediaUploader from '../desktopMediaUploader';
import MobileMediaUploader from '../mobileMediaUploader';

const EditProductForm = ({ productId, onUpdate, onCancel }) => {
  const { fetchProducts, fetchProductMedia, updateProductAndMedia } = useProductContext();
  const [productData, setProductData] = useState(null); 
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [removedMedia, setRemovedMedia] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false); // New
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      
    };

    window.addEventListener('resize', handleResize);
    console.log("mobile device detected");
    return () => window.removeEventListener('resize', handleResize);
    
  }, []);
  

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await adminApi.get(`/products/${productId}/details`);
        setProductData(response.data);
        if (response.data.thumbnail) {
          setImagePreview(`${import.meta.env.VITE_BACKEND}/uploads/${response.data.thumbnail}`);
        }
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
          order: index + 1,
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
    setProductData({ ...productData, [name]: value });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductData({ ...productData, thumbnail: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMediaChange = (updatedMedia) => {
    console.log('Updated media received in EditProductForm', updatedMedia);

    const currentMediaIds = mediaPreviews.map((media) => media.id);
    const updatedMediaIds = updatedMedia.map((media) => media.id);
  
    // Track removed media
    const removed = currentMediaIds.filter((id) => !updatedMediaIds.includes(id));
    setRemovedMedia((prev) => [...prev, ...removed]);
  
    // Update the media previews
    setMediaPreviews(updatedMedia);
  };
  

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
      // Prepare product data for submission
      const productFormData = new FormData();
      Object.entries(productData).forEach(([key, value]) => {
        if (value !== null) productFormData.append(key, value);
      });
  
      console.log('Product FormData Entries:', [...productFormData.entries()]);
  
      // Prepare media data
      const mediaFormData = new FormData();
      const mediaToKeep = mediaPreviews
        .filter((media) => !media.file)
        .map((media) => ({ id: media.id, order: media.order }));
  
      mediaPreviews.forEach((media, index) => {
        if (media.file) {
          mediaFormData.append('media', media.file);
          mediaFormData.append(`mediaOrder_${index}`, index + 1); // Send new order for new files
        }
      });
  
      // Add `mediaToKeep` to mediaFormData for existing media
      mediaFormData.append('mediaToKeep', JSON.stringify(mediaToKeep));
  
      console.log('Media FormData Entries before removedMedia:', [...mediaFormData.entries()]);
  
      // Add removedMedia if there are any
      if (removedMedia.length > 0) {
        removedMedia.forEach((id) => {
          mediaFormData.append('removedMediaIds', id);
        });
      }
  
      console.log('Final Media FormData Entries:', [...mediaFormData.entries()]);
  
      // Send both product and media updates
      await updateProductAndMedia(productId, productFormData, mediaFormData);
  
      if (onUpdate) onUpdate(); // Notify parent of successful update
      console.log('Product and media updated successfully');
      onCancel(); // Close the form
      fetchProducts(); // Refresh product list
    } catch (error) {
      console.error('Error updating product and media:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  
  

  

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

      <div className="form-section">
        <label>Media</label>
        {isMobile ? (
          <MobileMediaUploader
            mode="edit"
            initialMedia={mediaPreviews}
            onMediaChange={handleMediaChange}
            isLoading={mediaLoading}
          />
        ) : (
          <DesktopMediaUploader
            mode="edit"
            initialMedia={mediaPreviews}
            onMediaChange={handleMediaChange}
            isLoading={mediaLoading}
          />
        )}
      </div>
      <div className="form-actions">
        <button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Product'}
        </button>
        <button onClick={onCancel}>Cancel</button> {/* Directly use onCancel */}
      </div>
    </div>
  );
};

EditProductForm.propTypes = {
  productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  fetchProducts: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  onUpdate: PropTypes.func,
};

export default EditProductForm;
