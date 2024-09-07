import React, { useState, useEffect } from 'react';
import { adminApi } from '../config/axios';

const GalleryManagement = () => {
  const [images, setImages] = useState([]);
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      const response = await adminApi.get('/api/gallery'); // Ensure this matches the backend route
      setImages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!newImage) {
      alert('Please select an image');
      return;
    }

    const formData = new FormData();
    formData.append('image', newImage);

    try {
      await adminApi.post('/api/gallery', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchGalleryImages();
      setNewImage(null);
      setImagePreview('');
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div>
      <h1>Gallery Management</h1>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {imagePreview && <img src={imagePreview} alt="Image Preview" />}
      <button onClick={handleUpload}>Upload Image</button>
      <div>
        {images.length > 0 ? (
          images.map((image, index) => (
            <img key={index} src={`/gallery/${image}`} alt={`Gallery Image ${index}`} />
          ))
        ) : (
          <p>No images found.</p>
        )}
      </div>
    </div>
  );
};

export default GalleryManagement;
