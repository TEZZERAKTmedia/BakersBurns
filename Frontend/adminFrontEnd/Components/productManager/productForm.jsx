import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ImageUploader from '../../Components/imageUploader';
import { adminApi } from '../../config/axios';
import { useProductContext } from './ProductsContext';

const ProductForm = ({ productTypes, product = {}, onClose }) => {
  const {fetchProducts} = useProductContext();
  const [newProduct, setNewProduct] = useState({
    name: product.name || '',
    description: product.description || '',
    price: product.price || 0,
    type: product.type || '',
    quantity: product.quantity || 1,
    length: product.length || 0,
    width: product.width || 0,
    height: product.height || 0,
    weight: product.weight || 0,
    unit: product.unit || '',
    thumbnail: null,
  });
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [missingFields, setMissingFields] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      type: '',
      quantity: 1,
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      unit: '',
      thumbnail: null,
    });
    setMediaPreviews([]);
    setMissingFields([]);
  };

  const validateFields = () => {
    const missing = [];
    if (!newProduct.name) missing.push('name');
    if (!newProduct.description) missing.push('description');
    if (!newProduct.price || newProduct.price <= 0) missing.push('price');
    if (!newProduct.type) missing.push('type');
    if (newProduct.quantity <= 0) missing.push('quantity');
    return missing;
  };


  const createFormData = () => {
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('description', newProduct.description);
    formData.append('price', newProduct.price);
    formData.append('type', newProduct.type);
    formData.append('quantity', newProduct.quantity);
    formData.append('length', newProduct.length || 0);
    formData.append('width', newProduct.width || 0);
    formData.append('height', newProduct.height || 0);
    formData.append('weight', newProduct.weight || 0);
    formData.append('unit', newProduct.unit || 'unit');
    if (newProduct.thumbnail) formData.append('thumbnail', newProduct.thumbnail);
    mediaPreviews.forEach((media, index) => {
      formData.append('media', media.file);
      formData.append(`mediaOrder_${index}`, index + 1);
    });
    return formData;
  };

  const handleSave = async () => {
    const missing = validateFields();
    if (missing.length > 0) {
      setMissingFields(missing);
      return;
    }

    setIsLoading(true);
    try {
      const formData = createFormData();
      if (product.id) {
        await adminApi.put(`/api/products/${product.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await adminApi.post('/api/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      fetchProducts();
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct({ ...newProduct, thumbnail: file });
    }
  };

  const handleMediaChange = (files) => {
    const mediaFiles = Array.from(files).map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      order: index + 1,
    }));
    setMediaPreviews(mediaFiles);
  };

  return (
    <div className="product-form-section">
      <h2>{product.id ? 'Edit Product' : 'Add Product'}</h2>
      {missingFields.length > 0 && (
        <p style={{ color: 'red' }}>Missing fields: {missingFields.join(', ')}</p>
      )}
      <label>
        Product Name:
        <input
          type="text"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        />
      </label>
      <label>
        Description:
        <input
          type="text"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
        />
      </label>
      <label>
        Price:
        <input
          type="number"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
        />
      </label>
      <div className='form-section'>
      <label>Dimensions (inches/cm):</label>
      <div className="dimensions-inputs">
        <input
          type="number"
          step="0.01"
          placeholder="Length"
          value={newProduct.length}
          onChange={(e) => setNewProduct({ ...newProduct, length: e.target.value })}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Width"
          value={newProduct.width}
          onChange={(e) => setNewProduct({ ...newProduct, width: e.target.value })}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Height"
          value={newProduct.height}
          onChange={(e) => setNewProduct({ ...newProduct, height: e.target.value })}
        />
      </div >
      <label>Weight (lbs/kg):</label>
      <input
        type="number"
        step="0.01"
        placeholder="Weight"
        value={newProduct.weight}
        onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })}
      />
      <label>Measurement Unit:</label>
      <select
        value={newProduct.unit}
        onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
      >
        <option value="">Select Unit</option>
        <option value="metric">Metric</option>
        <option value="standard">Standard</option>
      </select>
      </div>
      <div className='form-section'>
      <label >
        Product Type:
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={newProduct.type}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'new') {
                setNewProduct({ ...newProduct, type: '' }); // Clear type for the new input
              } else {
                setNewProduct({ ...newProduct, type: value });
              }
            }}
          >
            <option value="">Select a Type</option>
            {productTypes.map((type, index) => (
              <option key={index} value={type.type}>
                {type.type}
              </option>
            ))}
            <option value="new">Add a New Type</option>
          </select>

          {newProduct.type === '' && (
            <input
              type="text"
              placeholder="Enter new type"
              value={newProduct.type}
              onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
              style={{ flex: '1' }} // Makes the input take the remaining space
            />
          )}
        </div>
      </label>
      </div>
      <div className='form-section'>
      <label>
        Thumbnail:
        <input type="file" accept="image/*" onChange={handleThumbnailChange} />
      </label>
      </div>
      <div className='form-section'>
      <ImageUploader maxMedia={10} onMediaChange={handleMediaChange} />
      </div>
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

ProductForm.propTypes = {
  productTypes: PropTypes.array.isRequired,
  product: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default ProductForm;
