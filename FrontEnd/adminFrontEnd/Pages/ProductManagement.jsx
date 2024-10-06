import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../config/axios';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import '../Componentcss/product_management.css';
import getCroppedImg from '../util/cropImage';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: 0, image: null, type: '' });
  const [imagePreview, setImagePreview] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropping, setCropping] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [discount, setDiscount] = useState({ type: 'percentage', amount: 0, startDate: '', endDate: '' });
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const response = await adminApi.get('/api/products/');
    setProducts(response.data);
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.description || !newProduct.price || !newProduct.image || !newProduct.type) {
      alert('Please fill out all fields');
      return;
    }

    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('description', newProduct.description);
    formData.append('price', newProduct.price);
    formData.append('image', newProduct.image);
    formData.append('type', newProduct.type);

    if (editingProduct) {
      await adminApi.put(`/api/products/${editingProduct.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      await adminApi.post('/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    fetchProducts();
    resetProductForm();
  };

  const handleDeleteProduct = async (id) => {
    await adminApi.delete(`/api/products/${id}`);
    fetchProducts();
    resetProductForm();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct({ ...newProduct, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(imagePreview, croppedAreaPixels);
      const file = new File([croppedImage], newProduct.image.name, { type: 'image/png' });
      setNewProduct({ ...newProduct, image: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setCropping(false);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePriceChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // Remove all non-numeric characters
    value = value.replace(/^0+/, '');
    if (value.length > 2) {
      value = value.slice(0, -2) + '.' + value.slice(-2);
    } else if (value.length === 2) {
      value = '0.' + value;
    } else if (value.length === 1) {
      value = '0.0' + value;
    } else {
      value = '0.00';
    }

    setNewProduct({ ...newProduct, price: value });
  };

  const resetProductForm = () => {
    setNewProduct({ name: '', description: '', price: 0, image: null, type: '' });
    setImagePreview('');
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropping(false);
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleEditProduct = (product) => {
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      type: product.type,
      image: null,
    });
    setImagePreview(`http://localhost:3450/uploads/${product.image}`);
    setShowProductForm(true);
    setEditingProduct(product);
  };

  const handleSelectProduct = (id) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((p) => p !== id) : [...prevSelected, id]
    );
  };

  const handleSelectAll = () => {
    const allProductIds = products.map((p) => p.id);
    setSelectedProducts(selectedProducts.length === products.length ? [] : allProductIds);
  };

  const handleSelectAllByType = (type) => {
    const productsOfType = products.filter((p) => p.type === type).map((p) => p.id);
    setSelectedProducts(productsOfType);
  };

  const applyDiscount = () => {
    const updatedProducts = products.map((product) => {
      if (selectedProducts.includes(product.id)) {
        let finalPrice = product.price;
        if (discount.type === 'percentage') {
          finalPrice = product.price - (product.price * discount.amount) / 100;
        } else if (discount.type === 'fixed') {
          finalPrice = product.price - discount.amount;
        }

        return {
          ...product,
          discountedPrice: finalPrice > 0 ? finalPrice : 0,
          discountStartDate: discount.startDate,
          discountEndDate: discount.endDate,
          isDiscounted: true, // Mark the product as discounted
        };
      }
      return product;
    });

    setProducts(updatedProducts);
    setDiscountedProducts(updatedProducts.filter((product) => product.isDiscounted));
    setSelectedProducts([]);
    setShowDiscountForm(false);
  };

  const handleDiscountTypeChange = (e) => {
    setDiscount({ ...discount, type: e.target.value });
  };

  const handleDiscountDateChange = (e) => {
    const { name, value } = e.target;
    setDiscount({ ...discount, [name]: value });
  };

  return (
    <div className="container">
      <h1>Product Management</h1>

      {/* Toggle Add/Edit Product Form */}
      {!showProductForm ? (
        <button onClick={() => setShowProductForm(true)}>Add Product</button>
      ) : (
        <div className="product-form-section">
          <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
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
            onChange={handlePriceChange}
          />
          <label>
            Type:
            <input
              type="text"
              placeholder="Product Type"
              value={newProduct.type}
              onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
            />
          </label>
          <div className="image-upload">
            <input type="file" accept="image/*" onChange={handleImageChange} />
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
                  cropShape="rect"
                  showGrid={false}
                />
                <button onClick={handleCrop}>Crop Image</button>
              </div>
            )}
          </div>
          <button onClick={handleAddProduct}>{editingProduct ? 'Update Product' : 'Add Product'}</button>
          <button onClick={resetProductForm}>Close</button>

          {/* Product Preview */}
          {editingProduct && (
            <div className="product-preview">
              <h3>Preview</h3>
              <div className="product-details">
                <p>Name: {newProduct.name}</p>
                <p>Description: {newProduct.description}</p>
                <p>Price: ${newProduct.price}</p>
                <p>Type: {newProduct.type}</p>
                {imagePreview && (
                  <div className="product-image">
                    <img src={imagePreview} alt={newProduct.name} />
                  </div>
                )}
              </div>
              <button onClick={() => handleDeleteProduct(editingProduct.id)}>Delete Product</button>
            </div>
          )}
        </div>
      )}

      {/* Display Existing Products */}
      <div className="existing-products">
        <h2>Existing Products</h2>
        <ul className="product-list">
          {products.map((product) => (
            <li key={product.id} className="product-card">
              <div className="product-details">
                <h3>{product.name}</h3>
                <p>Price: ${product.price}</p>
                <p>Type: {product.type}</p>
                <p>{product.isDiscounted ? 'Discounted!' : 'Regular Price'}</p>
                <button onClick={() => handleEditProduct(product)}>Edit</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Discount Section */}
      <div className="discount-section">
        <h2>Discounted Products</h2>
        {!showDiscountForm ? (
          <button onClick={() => setShowDiscountForm(true)}>Add a Discount</button>
        ) : (
          <>
            <button onClick={() => setShowDiscountForm(false)}>Close</button>
            <label>
              Discount Type:
              <select value={discount.type} onChange={handleDiscountTypeChange}>
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
                onChange={handleDiscountDateChange}
              />
            </label>
            <label>
              End Date:
              <input
                type="date"
                name="endDate"
                value={discount.endDate}
                onChange={handleDiscountDateChange}
              />
            </label>
            <button onClick={applyDiscount}>Apply Discount</button>

            <div className="product-selection">
              <button onClick={handleSelectAll}>Select All</button>
              <label>
                Select All by Type:
                <select onChange={(e) => handleSelectAllByType(e.target.value)}>
                  <option value="">Select Type</option>
                  {[...new Set(products.map((p) => p.type))].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <ul className="product-list">
                {products.map((product) => (
                  <li key={product.id} className="product-card">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                    />
                    <div className="product-details">
                      <h3>{product.name}</h3>
                      <p>Price: ${product.price}</p>
                      <p>{product.description}</p>
                      {product.image && (
                        <div className="product-image">
                          <img src={`http://localhost:3450/uploads/${product.image}`} alt={product.name} />
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Discounted Product Preview */}
        <div className="discounted-products">
          <h2>Discounted Products Preview</h2>
          <ul className="product-list">
            {discountedProducts.map((product) => (
              <li key={product.id} className="product-card">
                <div className="product-details">
                  <h3>{product.name}</h3>
                  <p>Original Price: ${product.price}</p>
                  <p>Discounted Price: ${product.discountedPrice}</p>
                  <p>{product.description}</p>
                  {product.image && (
                    <div className="product-image">
                      <img src={`http://localhost:3450/uploads/${product.image}`} alt={product.name} />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
