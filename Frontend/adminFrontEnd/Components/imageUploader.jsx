import React, { useState } from 'react';
import '../Componentcss/image_uploader.css'; // Import the CSS file

const ImageUploader = ({ maxMedia = 10, onMediaChange }) => {
  const [mediaPreviews, setMediaPreviews] = useState([]); // Updated state name
  const [isModalOpen, setIsModalOpen] = useState(false); // For toggling the upload modal
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false); // For toggling the help modal

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + mediaPreviews.length > maxMedia) {
      alert(`You can upload a maximum of ${maxMedia} media files.`);
      return;
    }

    const newPreviews = files.map((file, index) => {
      const reader = new FileReader();
      const preview = {
        id: Date.now() + file.name,
        file,
        src: '',
        order: mediaPreviews.length + index, // Assign an initial order
      };
      reader.onloadend = () => {
        preview.src = reader.result;
        setMediaPreviews((prev) => [...prev, preview]);
      };
      reader.readAsDataURL(file);
      return preview;
    });

    onMediaChange([...mediaPreviews, ...newPreviews]); // Pass updated previews with order to parent
  };

  const handleRemoveMedia = (index) => {
    const updatedPreviews = mediaPreviews.filter((_, i) => i !== index);
    setMediaPreviews(updatedPreviews);
    onMediaChange(updatedPreviews.map((p) => p.file)); // Update parent component
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);

    const updatedPreviews = Array.from(mediaPreviews);
    const [movedItem] = updatedPreviews.splice(dragIndex, 1);
    updatedPreviews.splice(dropIndex, 0, movedItem);

    // Reassign order numbers
    updatedPreviews.forEach((item, index) => {
      item.order = index;
    });

    setMediaPreviews(updatedPreviews);
    onMediaChange(updatedPreviews); // Update parent with new order
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openHelpModal = () => setIsHelpModalOpen(true);
  const closeHelpModal = () => setIsHelpModalOpen(false);

  const handleModalClick = (e) => {
    // Check if the clicked element is the modal's parent
    if (e.target.classList.contains('image-uploader-modal')) {
      closeModal();
    }
  };

  return (
    <div>
      <button onClick={openModal} className="open-image-uploader-modal-button">
        Upload Media
      </button>
      <button onClick={openHelpModal} className="image-uploader-help-button">?</button>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="image-uploader-modal" onClick={handleModalClick}>
          <div
            className="image-uploader-modal-content"
            onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
          >
            <button className="image-uploader-close-modal-button" onClick={closeModal}>
              &times;
            </button>
            <h2 className="image-uploader-header">Upload Media</h2>
            <div className="image-uploader-grid">
              {mediaPreviews.map((preview, index) => (
                <div
                  key={preview.id}
                  className="image-uploader-grid-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <span className="image-order-number">{index + 1}</span> {/* Number for order */}
                  <img src={preview.src} alt={`Preview ${index + 1}`} />
                  <button onClick={() => handleRemoveMedia(index)}>✖</button>
                </div>
              ))}
              {mediaPreviews.length < maxMedia && (
                <div className="image-grid-item-add-image">
                  <label>
                    +
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaChange}
                      multiple
                      hidden
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="image-uploader-help-modal">
          <div className="image-uploader-help-modal-content">
            <button className="image-uploader-close-modal-button" onClick={closeHelpModal}>
              &times;
            </button>
            <h2>Media Upload Guidelines</h2>
            <p>Supported File Types:</p>
            <ul>
              <li>Images: JPEG, PNG</li>
              <li>Videos: MP4, AVI</li>
            </ul>
            <p>
              Drag and drop the media to reorder the items in the grid. The order
              follows a top-to-bottom, left-to-right flow.
            </p>
            <div className="example-grid">
              1-10
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
