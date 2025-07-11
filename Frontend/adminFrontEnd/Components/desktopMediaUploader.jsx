import React, { useState, useRef, useEffect } from 'react';
import '../Componentcss/image_uploader.css'; // Your existing CSS
import LoadingPage from './loading';
import imageCompression from 'browser-image-compression';

// Dynamic Import for FFmpeg
let createFFmpeg, fetchFile, ffmpeg;

(async () => {
  try {
    const ffmpegModule = await import('@ffmpeg/ffmpeg');
    if (!ffmpegModule || !ffmpegModule.createFFmpeg) {
      console.error('❌ FFmpeg module failed to load or is missing createFFmpeg');
      return;
    }

    createFFmpeg = ffmpegModule.createFFmpeg;
    fetchFile = ffmpegModule.fetchFile;

    ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
  } catch (error) {
    console.error('❌ Error loading FFmpeg:', error);
  }
})();


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

  /**
   * Handles media selection, compresses images/videos before adding them to the state
   */
  const handleMediaChange = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.warn('No files selected or invalid input.');
      return;
    }

    setLoading(true);

    const mediaFiles = await Promise.all(
      Array.from(files).map(async (file, index) => {
        if (!(file instanceof File)) {
          console.warn('Invalid file type:', file);
          return null;
        }

        let optimizedFile = file;
        let preview = URL.createObjectURL(file);
        let fileType = file.type;

        if (fileType.startsWith('image')) {
          optimizedFile = await compressImage(file);
        } else if (fileType.startsWith('video')) {
          optimizedFile = await convertVideoToWebM(file);
        }

        return {
          id: `${Date.now()}-${file.name}`,
          file: optimizedFile,
          src: preview,
          order: mediaPreviews.length + index + 1,
        };
      })
    );

    const validMediaFiles = mediaFiles.filter(Boolean);
    setMediaPreviews((prev) => [...prev, ...validMediaFiles]);
    if (onMediaChange) onMediaChange([...mediaPreviews, ...validMediaFiles]);

    setLoading(false);
  };

  /**
   * Compress an image using `browser-image-compression`
   */
  const compressImage = async (file) => {
    try {
      const options = {
        maxSizeMB: 1, // Max file size (1MB)
        maxWidthOrHeight: 1920, // Max width or height
        useWebWorker: true,
        fileType: 'image/webp', // Convert to WebP
      };
      const compressedFile = await imageCompression(file, options);
      return new File([compressedFile], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
    } catch (error) {
      console.error('❌ Image compression failed:', error);
      return file;
    }
  };

  /**
   * Convert a video to WebM using FFmpeg
   */
  const convertVideoToWebM = async (file) => {
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    const inputName = file.name;
    const outputName = inputName.replace(/\.[^.]+$/, '.webm');

    ffmpeg.FS('writeFile', inputName, await fetchFile(file));

    await ffmpeg.run(
      '-i', inputName,   // Input file
      '-c:v', 'libvpx',  // Use VP8/VP9 codec
      '-b:v', '800k',    // Reduce bitrate
      '-vf', 'scale=1280:-1', // Scale width to 1280px, maintain aspect ratio
      '-an',             // Remove audio to save space
      outputName
    );

    const outputData = ffmpeg.FS('readFile', outputName);
    const blob = new Blob([outputData.buffer], { type: 'video/webm' });

    return new File([blob], outputName, { type: 'video/webm' });
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
      (mode === 'add' || mode === 'edit') && (
        <div className="image-grid-item-add-image">
          <label>
            +
            <input type="file" accept="image/*,video/*" onChange={handleMediaChange} multiple hidden />
          </label>
        </div>
      )
    );
  };

  return (
    <div className="media-uploader">
      {isLoading || loading ? <LoadingPage /> : <>
        {renderMediaGrid()}
        {renderAddMediaSection()}
      </>}
    </div>
  );
};

export default DesktopMediaUploader;
