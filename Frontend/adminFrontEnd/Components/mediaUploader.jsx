import React, { useState, useRef, useEffect } from 'react';
import '../Componentcss/image_uploader.css'; // Use your existing CSS

const MediaUploader = ({
  mode = 'view', // Modes: 'view', 'edit', 'add'
  initialMedia = [],
  maxMedia = 10,
  onMediaChange,
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

  const [draggedIndex, setDraggedIndex] = useState(null);
  const dragImageRef = useRef(null);

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
            const preview = URL.createObjectURL(file); // Catch errors here
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

  useEffect(() => {
    // Clean up object URLs when the component unmounts
    return () => {
      mediaPreviews.forEach((media) => {
        if (media.src) {
          URL.revokeObjectURL(media.src);
        }
      });
    };
  }, [mediaPreviews]);

  const handleRemoveMedia = (index) => {
    const updatedPreviews = mediaPreviews.filter((_, i) => i !== index);
    updatedPreviews.forEach((item, i) => (item.order = i + 1));
    setMediaPreviews(updatedPreviews);
    if (onMediaChange) onMediaChange(updatedPreviews);
  };

  const renderMediaGrid = () => {
    return (
      <div className="image-uploader-grid">
        {mediaPreviews.map((preview, index) => (
          <div key={preview.id} className="image-uploader-grid-item">
            <div className="drag-handle">
              <span className="image-order-number">{preview.order}</span>
              {preview.src.endsWith('.mp4') || preview.src.endsWith('.avi') ? (
                <video
                  controls
                  className="media-preview"
                  src={preview.src}
                  alt={`Video ${index + 1}`}
                  draggable={false}
                />
              ) : (
                <img
                  className="media-preview"
                  src={preview.src}
                  alt={`Preview ${index + 1}`}
                  draggable={false}
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
  };

  const renderAddMediaSection = () => {
    return (
      mode === 'add' && (
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
      )
    );
  };

  return (
    <div className="media-uploader">
      {renderMediaGrid()}
      {renderAddMediaSection()}
    </div>
  );
};

export default MediaUploader;
