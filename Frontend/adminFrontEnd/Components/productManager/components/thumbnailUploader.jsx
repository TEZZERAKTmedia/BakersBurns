import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './thumbnail.css'; // Optional CSS file for styling

const ThumbnailUploader = ({
  imagePreview = null,
  onImageUpload = null,
}) => {
  const [thumbnailPreview, setThumbnailPreview] = useState(imagePreview);

  const cropToSquare = (img, size) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    const minSize = Math.min(img.width, img.height);

    // Calculate the cropping area to make it square
    const cropX = (img.width - minSize) / 2;
    const cropY = (img.height - minSize) / 2;

    // Draw the cropped square image to the canvas
    ctx.drawImage(img, cropX, cropY, minSize, minSize, 0, 0, size, size);

    return canvas;
  };

  const resizeImage = (file, size, callback) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = cropToSquare(img, size);

        // Convert canvas back to a blob or base64
        canvas.toBlob(
          (blob) => {
            callback(blob);
            const previewURL = URL.createObjectURL(blob);
            setThumbnailPreview(previewURL); // Update preview
          },
          file.type,
          0.9 // Quality factor for JPEG/PNG
        );
      };
      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      resizeImage(file, 300, (resizedBlob) => {
        if (onImageUpload) {
          onImageUpload(resizedBlob); // Pass resized image blob to parent component
        }
      });
    }
  };

  return (
    <div className="thumbnail-uploader-container">
      <label className="thumbnail-uploader-label">Thumbnail</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="thumbnail-uploader-input"
      />
      {thumbnailPreview && (
        <img
          src={thumbnailPreview}
          alt="Thumbnail Preview"
          className="thumbnail-uploader-preview"
        />
      )}
    </div>
  );
};

ThumbnailUploader.propTypes = {
  imagePreview: PropTypes.string,
  onImageUpload: PropTypes.func.isRequired,
};

export default ThumbnailUploader;
