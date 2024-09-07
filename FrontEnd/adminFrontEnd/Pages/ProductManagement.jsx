import React, { useState, useEffect, useRef, useCallback } from 'react';
import { adminApi } from '../config/axios';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import '../Componentcss/product_management.css';
import getCroppedImg from '../util/cropImage';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: 0, image: null });
  const [imagePreview, setImagePreview] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropping, setCropping] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const response = await adminApi.get('/api/products/');
    setProducts(response.data);
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.description || !newProduct.price || !newProduct.image){
      alert('Please fill out all feilds');
      return;
    }
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('description', newProduct.description);
    formData.append('price', newProduct.price);
    formData.append('image', newProduct.image);

    await shopApi.post('/api/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    fetchProducts();
    resetForm();
  };

  const handleDeleteProduct = async (id) => {
    await shopApi.delete(`/api/products/${id}`);
    fetchProducts();
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

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
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

  const handleDragOver = (e) => {
    e.preventDefault();
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
      // If length is greater than 2, format as XX.XX
      value = value.slice(0, -2) + '.' + value.slice(-2);
    } else if (value.length === 2) {
      // If length is exactly 2, format as 0.XX
      value = '0.' + value;
    } else if (value.length === 1) {
      // If length is exactly 1, format as 0.0X
      value = '0.0' + value;
    } else {
      // If length is 0, format as 0.00
      value = '0.00';
    }

    setNewProduct({ ...newProduct, price: value }); // Update state
  };

  const resetForm = () =>{
    setNewProduct({ name:'', description:'', price:0, image:null});
    setImagePreview('');
    setCrop({ x:0, y:0});
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropping(false);
  };

  return (
    <div className="container">
      <h1>Product Management</h1>
      <div>
        <input
          type="text"
          placeholder="Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price (USD)"
          value={newProduct.price}
          onChange={handlePriceChange}
        />
        <div className="image-upload" onDrop={handleDrop} onDragOver={handleDragOver}>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <div className="cropper-buttons">
                <button onClick={handleCrop}>Crop Image</button>
              </div>
          {cropping ? (
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

            </div>
          ) : (
            imagePreview && <img src={imagePreview} alt="Image Preview" className="image-preview" />
          )}
        </div>
        <button onClick={handleAddProduct}>Add Product</button>
      </div>
      <ul className="product-list">
        {products.map((product) => (
          <li key={product.id} className="product-card">
            <div className="product-details">
              <h3>{product.name}</h3>
              <p>${product.price}</p>
              <p>{product.description}</p>
              {product.image && (
                <div className="product-image">
                  <img src={`http://localhost:3450/uploads/${product.image}`} alt={product.name} />
                </div>
              )}
            </div>
            <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductManagement;
