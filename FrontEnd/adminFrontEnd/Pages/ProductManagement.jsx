import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../config/axios';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../util/cropImage'; // Assuming you have a utility to crop images
import 'react-easy-crop/react-easy-crop.css';
import '../Componentcss/product_management.css';
import { useDropzone } from 'react-dropzone';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: 0, image: null, type: '', quantity: 1 });
  const [productTypes, setProductTypes] = useState([]); // Initialize product types
  const [selectedType, setSelectedType] = useState(''); 
  const [isNewType, setIsNewType] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [discount, setDiscount] = useState({ type: 'percentage', amount: 0, startDate: '', endDate: '' });
  const [editingProductId, setEditingProductId] = useState(null); // Track product being edited
  const [editingDiscountId, setEditingDiscountId] = useState(null); // Track discount being edited
  const [showAddProductForm, setShowAddProductForm] = useState(false); // Add product form visibility
  const [showAddDiscountForm, setShowAddDiscountForm] = useState(false); // Add discount form visibility
  const [sortCriteria, setSortCriteria] = useState('name'); // Default sort by name
  const [sortOrder, setSortOrder] = useState('asc'); // Default order asc
  const [missingFields, setMissingFields] = useState([]);


  const [imagePreview, setImagePreview] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropping, setCropping] = useState(false);
  const [fileSize, setFileSize] = useState(0); // To track file size
  const [maxFileSize] = useState(50 * 1024 * 1024);

  useEffect(() => {
    fetchProducts();
    fetchProductTypes();
    handleSort('createdAt');
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await adminApi.get('/api/products/');
      console.log('Fetched products:', response.data); // Log the fetched data
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  const fetchProductTypes = async () => {
    try {
      const response = await adminApi.get('/api/products/types');
      setProductTypes(response.data);
    } catch (error) {
      console.error('Error fetching product types:', error);
    }
  };

  

  // Sorting logic
  const handleSort = (criteria) => {
    const sortedProducts = [...products].sort((a, b) => {
      let valueA = a[criteria];
      let valueB = b[criteria];

      if (criteria === 'price') {
        valueA = parseFloat(a.price);
        valueB = parseFloat(b.price);
      }

      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setProducts(sortedProducts);
    setSortCriteria(criteria);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminApi.delete(`/api/products/${productId}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleRemoveDiscount = async (productId) => {
    if (window.confirm('Are you sure you want to remove the discount from this product?')) {
      try {
        await adminApi.delete(`/api/products/${productId}/discount`);
        fetchProducts();
      } catch (error) {
        console.error('Error removing discount:', error);
      }
    }
  };

  const handleSelectProduct = (id) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((p) => p !== id) : [...prevSelected, id]
    );
  };

  const handleEditProduct = (product) => {
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      type: product.type,
      quantity: product.quantity,
    });
    setEditingProductId(product.id);
    setEditingDiscountId(null); // Hide discount form if open
  };

  const handleEditDiscount = (product) => {
    setDiscount({
      type: product.discountType,
      amount: product.discountAmount,
      startDate: product.discountStartDate,
      endDate: product.discountEndDate,
    });
    setEditingDiscountId(product.id);
    setEditingProductId(null); // Hide product form if open
  };

  const handleAddProduct = async () => {
    const missing = [];
  
    if (!newProduct.name) missing.push('name');
    if (!newProduct.description) missing.push('description');
    if (!newProduct.price || newProduct.price <= 0) missing.push('price');
    if (!newProduct.type) missing.push('type');
    if (newProduct.quantity <= 0) missing.push('quantity');
  
    if (missing.length > 0) {
      setMissingFields(missing);
      return;
    }
  
    setMissingFields([]); // Clear missing fields if validation passes
  
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('description', newProduct.description);
    formData.append('price', newProduct.price);
    formData.append('type', newProduct.type);
    formData.append('image', newProduct.image);
    formData.append('quantity', newProduct.quantity);
  
    try {
      await adminApi.post('/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchProducts();
      resetForms();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };
  
  
  const handleUpdateProduct = async (productId) => {
    // Create formData and append fields only if they are filled in, otherwise fallback to existing product data
    const formData = new FormData();
  
    if (newProduct.name) formData.append('name', newProduct.name);
    if (newProduct.description) formData.append('description', newProduct.description);
    if (newProduct.price) formData.append('price', newProduct.price);
    if (newProduct.type) formData.append('type', newProduct.type);
    if (newProduct.quantity) formData.append('quantity', newProduct.quantity);
  
    // Append the image only if it's updated
    if (newProduct.image) {
      formData.append('image', newProduct.image);
    }
  
    // Log formData content to the console
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
  
    try {
      await adminApi.put(`/api/products/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      fetchProducts(); // Fetch the updated list of products
      resetForms(); // Reset form after success
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };
  
  

  
  
  
  
  
  // Handle Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct({ ...newProduct, image: file });
  
      // Calculate file size
      setFileSize(file.size);
  
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setCropping(true); // Trigger cropping interface
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Calculate the percentage of file size in relation to the max size
  const fileSizePercentage = (fileSize / maxFileSize) * 100;

  const handleDrop = (acceptedFiles, productId) => {
    const file = acceptedFiles[0];
    setNewProduct({ ...newProduct, image: file });
    // Handle image upload logic here (e.g., API call to upload the image)
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
    },
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, editingProductId),
  });
  

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(imagePreview, croppedAreaPixels);
      const file = new File([croppedImage], newProduct.image.name, { type: 'image/png' });
      setNewProduct({ ...newProduct, image: file });
      setCropping(false); // Close the cropping interface
    } catch (e) {
      console.error(e);
    }
  };

  const applyDiscount = async () => {
    const defaultStartDate = new Date().toISOString().split('T')[0];
    const discountPayload = {
      discountType: discount.type,
      discountAmount: discount.amount,
      discountStartDate: discount.startDate || defaultStartDate,
      discountEndDate: discount.endDate,
      isDiscounted: 1,
    };

    if (!discount.endDate) {
      alert('Please select an end date for the discount.');
      return;
    }

    try {
      for (const productId of selectedProducts) {
        await adminApi.post(`/api/products/${productId}/discount`, discountPayload);
      }
      fetchProducts();
      resetForms();
    } catch (error) {
      console.error('Error applying discount:', error);
    }
  };
  const handleTypeChange = (e) => {
    const value = e.target.value;
  
    if (value === 'new') {
      setIsNewType(true); // Show input for new type
      setSelectedType(''); // Clear selected type
      setNewProduct({ ...newProduct, type: '' }); // Reset product type
    } else {
      setIsNewType(false); // Use dropdown
      setSelectedType(value);
      setNewProduct({ ...newProduct, type: value }); // Ensure product type is updated
    }
  };

  // Handle typing a new type
  const handleNewTypeChange = (e) => {
    setSelectedType(e.target.value); // Set the new type being typed
    setNewProduct({ ...newProduct, type: e.target.value }); // Update product type
  };

  // Filter products by selected type
  const filteredProducts = selectedType
    ? products.filter(product => product.type === selectedType)
    : products;

  const resetForms = () => {
    setNewProduct({ name: '', description: '', price: 0, image: null, type: '' });
    setDiscount({ type: 'percentage', amount: 0, startDate: '', endDate: '' });
    setEditingProductId(null);
    setEditingDiscountId(null);
    setShowAddProductForm(false);
    setShowAddDiscountForm(false);
    setImagePreview('');
    setSelectedType('');

  };

  return (
    
      <div className="product-manager-container">
        <h1 style={{ padding: '20px' }}>Product Management</h1>
    
        {/* Add Product/Discount Forms */}
        <div className="add-forms">
          {!showAddProductForm && !showAddDiscountForm && (
            <div className="add-buttons">
              <button onClick={() => setShowAddProductForm(true)}>Add Product</button>
              <button onClick={() => setShowAddDiscountForm(true)}>Add Discount</button>
            </div>
          )}
    
    {showAddProductForm && (
  <div className="product-form-section">
    <h2>Add New Product</h2>

    <label>
      Product Name {missingFields.includes('name') && <span className="error-dot">*</span>}
    </label>
    <input
      type="text"
      placeholder="Product Name"
      value={newProduct.name}
      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
    />

    <label>
      Product Description {missingFields.includes('description') && <span className="error-dot">*</span>}
    </label>
    <input
      type="text"
      placeholder="Product Description"
      value={newProduct.description}
      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
    />

    <label>
      Price (USD) {missingFields.includes('price') && <span className="error-dot">*</span>}
    </label>
    <input
      type="number"
      placeholder="Price (USD)"
      value={newProduct.price}
      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
    />

    <label>
      Quantity {missingFields.includes('quantity') && <span className="error-dot">*</span>}
    </label>
    <input
      type="number"
      placeholder="Quantity"
      value={newProduct.quantity || 1}
      onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
    />

    <label>
      Product Type {missingFields.includes('type') && <span className="error-dot">*</span>}
    </label>
    <select value={selectedType} onChange={handleTypeChange}>
      <option value="">Select a Type</option>
      {productTypes.map((type, index) => (
        <option key={index} value={type.type}>
          {type.type}
        </option>
      ))}
      <option value="new">Enter a New Type</option>
    </select>

    {isNewType && (
      <input
        type="text"
        placeholder="Enter new type"
        value={selectedType}
        onChange={handleNewTypeChange}
      />
    )}

    <label>
      Image {missingFields.includes('image') && <span className="error-dot">*</span>}
    </label>
    <div className="image-upload">
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {fileSize > 0 && (
        <div>
          <p>File size: {(fileSize / 1024).toFixed(2)} KB</p>
          {fileSize > maxFileSize && (
            <p style={{ color: 'red' }}>File size exceeds the maximum allowed size of 2MB!</p>
          )}
          <div className="file-size-progress-bar">
            <div
              style={{
                width: `${Math.min(fileSizePercentage, 100)}%`,
                backgroundColor: fileSize > maxFileSize ? 'red' : 'green',
                height: '10px',
              }}
            />
          </div>
          <p>{Math.min(fileSizePercentage, 100).toFixed(2)}% of allowed file size used</p>
        </div>
      )}

      {cropping && (
        <div className="cropper-container">
          <Cropper
            image={imagePreview}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
          <button onClick={handleCrop}>Crop Image</button>
        </div>
      )}
    </div>

    <button onClick={() => handleAddProduct(null)}>Add Product</button>
    <button onClick={resetForms}>Cancel</button>
  </div>
)}

    
    {showAddDiscountForm && (
          <div className="discount-form-section">
            <h2>Add a Discount</h2>
            <label>Discount Type:
              <select value={discount.type} onChange={(e) => setDiscount({ ...discount, type: e.target.value })}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </label>
            <input
              type="number"
              placeholder="Discount Amount"
              value={discount.amount}
              onChange={(e) => setDiscount({ ...discount, amount: parseFloat(e.target.value) || 0 })}
            />
            <label>Start Date:
              <input type="date" name="startDate" value={discount.startDate} onChange={(e) => setDiscount({ ...discount, startDate: e.target.value })} />
            </label>
            <label>End Date:
              <input type="date" name="endDate" value={discount.endDate} onChange={(e) => setDiscount({ ...discount, endDate: e.target.value })} />
            </label>
            <label>Product Type:
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option value="">Select a Type</option>
                {productTypes.map((type, index) => (
                  <option key={index} value={type.type}>{type.type}</option>
                ))}
              </select>
            </label>
            <button onClick={applyDiscount}>Apply Discount</button>
            <button onClick={resetForms}>Cancel</button>
          </div>
        )}
        </div>
    
        {/* Sorting Controls */}
        <div className="sorting-controls">
          <p>Sort By:</p>
          <button onClick={() => handleSort('createdAt')}>Most recent</button>
          <button onClick={() => handleSort('name')}>Name ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})</button>
          <button onClick={() => handleSort('type')}>Type</button>
          <button onClick={() => handleSort('price')}>Price ({sortOrder === 'asc' ? 'Low-High' : 'High-Low'})</button>
        </div>
    
        {/* Product List */}
        <div className="existing-products">
          <h2>Products Overview</h2>
          <div className="product-list">
            {products.map((product) => (
              <div
                key={product.id}
                className={`product-card ${product.isDiscounted ? 'discounted' : 'regular'}`}
                style={{ backgroundColor: product.isDiscounted ? 'orange' : 'white' }}
              >
                <div className="product-details">
                  <h3 className='product-title'>{product.name}</h3>
    
                  {/* Conditionally render the image only when the product is not being edited */}
                  {editingProductId !== product.id && editingDiscountId !== product.id && product.image && (
                    <div className="product-image">
                      <img src={`${import.meta.env.VITE_BACKEND}/uploads/${product.image}`} alt={product.name} />
                    </div>
                  )}
    
                  {/* Discounted Products */}
                  {product.isDiscounted ? (
                    <>
                      <p className="price original-price">
                        <s>${parseFloat(product.price).toFixed(2)}</s>
                      </p>
                      <p className="price discounted-price">
                        ${parseFloat(product.discountPrice).toFixed(2) || 'N/A'}
                      </p>
                      <p className="price-difference">
                        Save ${parseFloat(product.priceDifference).toFixed(2) || 'N/A'}!
                      </p>
                      <div className="discount-banner">
                        {product.discountPrice && product.price
                          ? `${Math.round((1 - parseFloat(product.discountPrice) / parseFloat(product.price)) * 100)}% OFF`
                          : 'N/A'}
                      </div>
                      <p>Discount Type: {product.discountType || 'N/A'}</p>
                      <p>Discount Start: {product.discountStartDate || 'N/A'}</p>
                      <p>Discount End: {product.discountEndDate || 'N/A'}</p>
                    </>
                  ) : (
                    <>
                      <p className="price">Price: ${parseFloat(product.price).toFixed(2)}</p>
                      <div className="additional-info">

                        <p>Type: {product.type || 'N/A'}</p>
                        <p>Availability: {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}</p>
                      </div>
                    </>
                  )}
    
                  {/* Conditionally render the edit product form inside the product tile */}
                  {editingProductId === product.id && (
                    <div className="product-edit-form">
                      <input
                        type="text"
                        placeholder="Product Name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Product Description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      />
                      <input
                        type="number"
                        placeholder="Price (USD)"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      />
                      <label>Product Type:</label>
                      <select value={selectedType} onChange={handleTypeChange}>
                        <option value="">Select a Type</option>
                        {productTypes.map((type, index) => (
                          <option key={index} value={type.type}>
                            {type.type}
                          </option>
                        ))}
                        <option value="new">Enter a New Type</option> {/* Option for entering a new type */}
                      </select>

                      {isNewType && (
                        <input
                          type="text"
                          placeholder="Enter new type"
                          value={selectedType} // Bind this to new type value
                          onChange={handleNewTypeChange}
                        />
                      )}
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={newProduct.quantity}
                        onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                      />

                {/* Drag-and-drop or choose file for image */}
                      <div {...getRootProps()} className="image-dropzone">
                        <input {...getInputProps()} accept=".png,.jpg,.jpeg"/>
                        <p>Drag 'n' drop an image here, or click to select one</p>
                      </div>

                      <button onClick={() => handleUpdateProduct(product.id)}>Update Product</button>
                      <button onClick={resetForms}>Cancel</button>
                      <button className="delete-button" onClick={() => handleDeleteProduct(product.id)}>Delete Product</button>
                    </div>
                  )}
    
                  {/* Conditionally render the edit discount form inside the product tile */}
                  {editingDiscountId === product.id && (
                    <div className="discount-edit-form">
                      <label>
                        Discount Type:
                        <select value={discount.type} onChange={(e) => setDiscount({ ...discount, type: e.target.value })}>
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed Amount</option>
                        </select>
                      </label>
                      <input
                        type="number"
                        placeholder="Discount Amount"
                        value={discount.amount}
                        onChange={(e) => setDiscount({ ...discount, amount: parseFloat(e.target.value) || 0 })}
                      />
                      <label>
                        Start Date:
                        <input
                          type="date"
                          name="startDate"
                          value={discount.startDate}
                          onChange={(e) => setDiscount({ ...discount, startDate: e.target.value })}
                        />
                      </label>
                      <label>
                        End Date:
                        <input
                          type="date"
                          name="endDate"
                          value={discount.endDate}
                          onChange={(e) => setDiscount({ ...discount, endDate: e.target.value })}
                        />
                      </label>
                      <button onClick={() => applyDiscount(product.id)}>Update Discount</button>
                      <button onClick={resetForms}>Cancel</button>
                      <button className="delete-button" onClick={() => handleRemoveDiscount(product.id)}>Remove Discount</button>
                    </div>
                  )}
    
                  {/* Edit buttons */}
                  {editingProductId !== product.id && <button onClick={() => handleEditProduct(product)}>Edit Product</button>}
                  {product.isDiscounted && editingDiscountId !== product.id && (
                    <button onClick={() => handleEditDiscount(product)}>Edit Discount</button>
                  )}
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
    
};

export default ProductManagement;
