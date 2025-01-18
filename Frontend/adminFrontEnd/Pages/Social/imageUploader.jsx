import React, { useState } from 'react';

const ImageUploader = ({ onImageUpload }) => {
  const [selectedImage, setSelectedImage] = useState(null); // Preview of the uploaded image
  const [customFileName, setCustomFileName] = useState(''); // Custom file name

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file); // Create a preview URL
      setSelectedImage(imageUrl); // Set the preview image
      setCustomFileName(file.name); // Set the default file name
      onImageUpload(file); // Pass the file to the parent component
    }
  };

  const handleFileNameChange = (e) => {
    setCustomFileName(e.target.value); // Update the custom file name
  };

  return (
    <div className="image-uploader">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="image-input"
      />

      {selectedImage && (
        <div className="image-preview-container">
          <img src={selectedImage} alt="Uploaded Preview" className="image-preview" />
          <div className="file-name-container">
            <label>
              File Name:
              <input
                type="text"
                value={customFileName}
                onChange={handleFileNameChange}
                className="file-name-input"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
