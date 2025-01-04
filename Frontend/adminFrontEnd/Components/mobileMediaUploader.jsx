import React, { useState, useEffect } from 'react';
import '../Componentcss/image_uploader.css'; // Use your existing CSS
import LoadingPage from './loading';

const MobileMediaUploader = ({
  mode = 'view',
  initialMedia = [],
  maxMedia = 10,
  isLoading = false,
  onMediaChange,
  onMediaDelete, // Function to delete media from the backend in edit mode
}) => {
  const [mediaPreviews, setMediaPreviews] = useState(
    Array.isArray(initialMedia)
      ? initialMedia.map((media, index) => ({
          id: media.id || `${Date.now()}-${index}`,
          file: media.file || null,
          src: media.src || media.url || '',
          order: index + 1,
        }))
      : []
  );

  
  const [activeOrderChange, setActiveOrderChange] = useState(null);

  const handleMediaChange = (event) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      console.warn('No files selected or invalid input.');
      return;
    }

    const mediaFiles = Array.from(files)
      .map((file, index) => {
        if (file instanceof File) {
          try {
            const preview = URL.createObjectURL(file);
            return {
              id: `${Date.now()}-${file.name}`,
              file,
              src: preview,
              order: mediaPreviews.length + index + 1,
            };
          } catch (err) {
            console.error('Error generating preview for file:', file, err);
            return null;
          }
        } else {
          console.warn('Invalid file type:', file);
          return null;
        }
      })
      .filter(Boolean);

    setMediaPreviews((prev) => [...prev, ...mediaFiles]);
    if (onMediaChange) onMediaChange([...mediaPreviews, ...mediaFiles]);
  };

  const handleOrderChange = (newOrder) => {
    const reorderedPreviews = [...mediaPreviews];
    const [movedItem] = reorderedPreviews.splice(activeOrderChange, 1);
    reorderedPreviews.splice(newOrder - 1, 0, movedItem);

    // Reassign orders
    reorderedPreviews.forEach((item, i) => (item.order = i + 1));

    setMediaPreviews(reorderedPreviews);
    if (onMediaChange) onMediaChange(reorderedPreviews);

    setActiveOrderChange(null); // Close the overlay
  };

  const handleRemoveMedia = (index) => {
    const mediaToRemove = mediaPreviews[index];
    if (mode === 'edit' && mediaToRemove.id && onMediaDelete) {
      onMediaDelete(mediaToRemove.id);
    }

    const updatedPreviews = mediaPreviews.filter((_, i) => i !== index);
    updatedPreviews.forEach((item, i) => (item.order = i + 1));
    setMediaPreviews(updatedPreviews);
    if (onMediaChange) onMediaChange(updatedPreviews);
  };

  useEffect(() => {
    return () => {
      mediaPreviews.forEach((media) => {
        if (media.src) {
          URL.revokeObjectURL(media.src);
        }
      });
    };
  }, [mediaPreviews]);

  const renderMediaGrid = () => (
    <div className="image-uploader-grid">
      {mediaPreviews.map((preview, index) => (
        <div key={preview.id} className="image-uploader-grid-item">
          <div className="drag-handle">
            <span
              className="image-order-number clickable"
              onClick={() => setActiveOrderChange(index)}
            >
              {preview.order}
            </span>
            {preview.src.endsWith('.mp4') || preview.src.endsWith('.avi') ? (
              <video
                loop
                muted
                playsInline
                className="media-preview"
                src={preview.src}
                alt={`Video ${index + 1}`}
              />
            ) : (
              <img
                className="media-preview"
                src={preview.src}
                alt={`Image ${index + 1}`}
              />
            )}
          </div>
          {(mode === 'edit' || mode === 'add') && (
            <button
              className="remove-media-button minus-symbol"
              onClick={() => handleRemoveMedia(index)}
            >
              -
            </button>
          )}
        </div>
      ))}
    </div>
  );

  const renderOrderOverlay = () => (
    activeOrderChange !== null && (
      <div
        className="mobile-order-overlay"
        onMouseEnter={(e) => e.stopPropagation()} // Prevent hover bubbling
      >
        <div className="image-uploader-grid mobile-order-grid">
          {Array.from({ length: mediaPreviews.length }, (_, i) => i + 1).map((order) => (
            <div
              key={order}
              className="image-uploader-grid-item mobile-order-option"
              onClick={() => handleOrderChange(order)}
            >
              <span className="image-order-number">{order}</span>
            </div>
          ))}
        </div>
        <button
          className="mobile-cancel-button"
          onClick={() => setActiveOrderChange(null)}
        >
          Cancel
        </button>
      </div>
    )
  );
  

  const renderAddMediaSection = () => (
    mode === 'add' || mode === 'edit' ? (
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
    ) : null
  );

  return (
    <div
      className="media-uploader"
      onMouseLeave={() => setActiveOrderChange(null)} // Reset state on leave
    >
      {isLoading ? (
        <LoadingPage />
      ) : (
        <>
          {renderMediaGrid()}
          {renderOrderOverlay()}
          {renderAddMediaSection()}
        </>
      )}
    </div>
  );
};

export default MobileMediaUploader;
