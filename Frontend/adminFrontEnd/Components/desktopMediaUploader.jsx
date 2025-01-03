import React, { useState, useRef, useEffect } from 'react';
import '../Componentcss/image_uploader.css'; // Use your existing CSS
import LoadingPage from './loading'; 


const DesktopMediaUploader = ({
  mode = 'view', // Modes: 'view', 'edit', 'add'
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
  const [loading, setLoading] = useState(false);
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

  const handleDragStart = (index) => {
    setDraggedIndex(index);
    
  };

  const handleDragOver = (index) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const reorderedPreviews = [...mediaPreviews];
    const [draggedItem] = reorderedPreviews.splice(draggedIndex, 1);
    reorderedPreviews.splice(index, 0, draggedItem);

    reorderedPreviews.forEach((item, i) => (item.order = i + 1));

    setMediaPreviews(reorderedPreviews);
    setDraggedIndex(index);
    if (onMediaChange) onMediaChange(reorderedPreviews);
  };

  const handleDrop = () => {
    setDraggedIndex(null);
  };

  const handleRemoveMedia = (index) => {
    const mediaToRemove = mediaPreviews[index];
    console.log('Removing media:', mediaToRemove)
    // If in edit mode and the media has an `id`, call the delete function
    if (mode === 'edit' && mediaToRemove.id && onMediaDelete) {
      onMediaDelete(mediaToRemove.id);
    }

    const updatedPreviews = mediaPreviews.filter((_, i) => i !== index);
    updatedPreviews.forEach((item, i) => (item.order = i + 1));
    setMediaPreviews(updatedPreviews);
    if (onMediaChange) onMediaChange(updatedPreviews);
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

  const renderMediaGrid = () => {
    return (
      <div className="image-uploader-grid">
        {mediaPreviews.map((preview, index) => (
          <div
            key={preview.id}
            className="image-uploader-grid-item"
            draggable={mode === 'edit'}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => {
              e.preventDefault();
              handleDragOver(index);
            }}
            onDrop={handleDrop}
          >
            <div className="drag-handle">
              <span className="image-order-number">{preview.order}</span>
              {preview.src.endsWith('.mp4') || preview.src.endsWith('.avi') ? (
               <video
               loop
               muted
               playsInline
               webkit-playsinline="true"
               
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
  };

  const renderAddMediaSection = () => {
    return (
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
  };

  return (
    <div className="media-uploader">
      {isLoading ? (
        <LoadingPage />
      ) : (
        <>
          {renderMediaGrid()}
          {renderAddMediaSection()}
        </>
      )}
    </div>
  );
};

export default DesktopMediaUploader;
