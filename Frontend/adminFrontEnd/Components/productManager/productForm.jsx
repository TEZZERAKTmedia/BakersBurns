import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MediaUploader from '../desktopMediaUploader';
import { adminApi } from '../../config/axios';
import { useProductContext } from './ProductsContext';




const ProductForm = ({ productTypes, product = {}, onClose }) => {
  const {fetchProducts,} = useProductContext();
  const {addProductWithMedia} =useProductContext();
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [isAddingNewType, setIsAddingNewType] = useState(false);


  
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
  
    // Ensure mediaPreviews is valid before iterating
    if (Array.isArray(mediaPreviews)) {
      mediaPreviews.forEach((media, index) => {
        console.log(`Adding media file:`, media.file);
        formData.append('media', media.file);
        formData.append(`mediaOrder_${index}`, index + 1);
      });
    } else {
      console.warn('mediaPreviews is not an array or undefined:', mediaPreviews);
    }
  
    return formData;
  };
  
  const handleThumbnailChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file); // Generate a preview URL
      setThumbnailPreview(previewUrl); // Store the preview URL
      setNewProduct({ ...newProduct, thumbnail: file });
      console.log('Thumbnail file selected:', file); // Debugging
    }
  };
  
  
  

  
  const handleMediaChange = (updatedMedia) => {
    if (!Array.isArray(updatedMedia)) {
      console.warn('Invalid media passed to handleMediaChange');
      return;
    }
    setMediaPreviews(updatedMedia);
  };
  
  const handleSave = async () => {
    const missing = validateFields();
    if (missing.length > 0) {
      setMissingFields(missing);
      return;
    }
  
    setIsLoading(true);
    try {
      let productId;
  
      // Step 1: Add the product
      if (!product.id) {
        // Create the product first and extract the ID
        const productFormData = new FormData();
  
        // Add product data
        productFormData.append('name', newProduct.name);
        productFormData.append('description', newProduct.description);
        productFormData.append('price', newProduct.price);
        productFormData.append('type', newProduct.type);
        productFormData.append('quantity', newProduct.quantity);
        productFormData.append('length', newProduct.length || 0);
        productFormData.append('width', newProduct.width || 0);
        productFormData.append('height', newProduct.height || 0);
        productFormData.append('weight', newProduct.weight || 0);
        productFormData.append('unit', newProduct.unit || 'unit');
        if (newProduct.thumbnail) {
          productFormData.append('thumbnail', newProduct.thumbnail);
        }
  
        // Send product creation request
        const productResponse = await adminApi.post('/products', productFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
  
        productId = productResponse.data.id;
  
        if (!productId) {
          throw new Error('Failed to retrieve product ID after creating product.');
        }
      } else {
        // Use existing product ID if updating
        productId = product.id;
      }
  
      // Step 2: Add media if any
      if (mediaPreviews && mediaPreviews.length > 0) {
        const mediaFormData = new FormData();
        mediaPreviews.forEach((media, index) => {
          mediaFormData.append('media', media.file);
          mediaFormData.append(`mediaOrder_${index}`, index + 1);
        });
  
        // Attach the product ID to the media upload request
        await adminApi.post(`/products/add-media?productId=${productId}`, mediaFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
  
      // Step 3: Refresh products list
      fetchProducts();
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving product or media:', error);
      alert('Failed to save product or media. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
    value={newProduct.type === '' && isAddingNewType ? 'new' : newProduct.type}
    onChange={(e) => {
      const value = e.target.value;
      if (value === 'new') {
        setIsAddingNewType(true); // Enable adding a new type
        setNewProduct({ ...newProduct, type: '' }); // Clear type for the new input
      } else {
        setIsAddingNewType(false); // Disable adding a new type
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

  {isAddingNewType && (
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
      <div className="form-section">
  <label>
    Thumbnail:
    
  </label>
  {thumbnailPreview && (
    <div style={{ marginTop: '10px' }}>
      <img
        src={thumbnailPreview}
        alt="Thumbnail Preview"
        style={{ width: '100px', height: 'auto', border: '1px solid #ccc' }}
      />
    </div>
  )}
</div>

      </div>
      <div className='form-section'>
      <MediaUploader
        mode="add"
        maxMedia={10}
        initialMedia={Array.isArray(mediaPreviews) ? mediaPreviews : []}
        onMediaChange={handleMediaChange}
      />


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
