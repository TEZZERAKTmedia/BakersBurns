import React, { useState } from 'react';

const ImageUploader = ({ maxImages = 10, onImagesChange }) => {
  const [imagePreviews, setImagePreviews] = useState([]); // Array of previews

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + imagePreviews.length > maxImages) {
      alert(`You can upload a maximum of ${maxImages} images.`);
      return;
    }

    const newPreviews = files.map((file) => {
      const reader = new FileReader();
      const preview = { file, src: '' };
      reader.onloadend = () => {
        preview.src = reader.result;
        setImagePreviews((prev) => [...prev, preview]);
      };
      reader.readAsDataURL(file);
      return preview;
    });

    onImagesChange([...imagePreviews.map((p) => p.file), ...files]);
  };

  const handleRemoveImage = (index) => {
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(updatedPreviews);
    onImagesChange(updatedPreviews.map((p) => p.file)); // Update parent component
  };

  return (
    <div>
      <input type="file" accept="image/*" multiple onChange={handleImageChange} />
      <div className="image-preview-grid">
        {imagePreviews.map((preview, index) => (
          <div key={index} className="image-preview-item">
            <img src={preview.src} alt={`Preview ${index + 1}`} />
            <button onClick={() => handleRemoveImage(index)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;
