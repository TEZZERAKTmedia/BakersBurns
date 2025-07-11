import React, { useState, useRef, useEffect } from 'react';
import '../Componentcss/image_uploader.css';
import LoadingPage from './loading';
import imageCompression from 'browser-image-compression';

// ✅ Proper static import for FFmpeg
let ffmpegInstance = null;
let fetchFileFunc = null;

async function getFFmpeg() {
  if (!ffmpegInstance) {
    const { createFFmpeg, fetchFile } = await import('@ffmpeg/ffmpeg');
    ffmpegInstance = createFFmpeg({ log: true });
    fetchFileFunc = fetchFile;
  }
  return { ffmpeg: ffmpegInstance, fetchFile: fetchFileFunc };
}


const DesktopMediaUploader = ({
  mode = 'view',
  initialMedia = [],
  maxMedia = 10,
  isLoading = false,
  onMediaChange,
  onMediaDelete,
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
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);

  // ✅ Load FFmpeg when component mounts
  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const { ffmpeg } = await getFFmpeg();
        if (!ffmpeg.isLoaded()) {
          await ffmpeg.load();
        }
        setIsFFmpegLoaded(true);
      } catch (error) {
        console.error('❌ Error loading FFmpeg:', error);
      }
    };
  
    loadFFmpeg();
  }, []);
  
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

  const compressImage = async (file) => {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp',
      };
      const compressedFile = await imageCompression(file, options);
      return new File([compressedFile], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
    } catch (error) {
      console.error('❌ Image compression failed:', error);
      return file;
    }
  };

  const convertVideoToWebM = async (file) => {
    if (!isFFmpegLoaded) {
      console.error('❌ FFmpeg is not loaded yet.');
      return file;
    }
  
    const { ffmpeg, fetchFile } = await getFFmpeg();
  
    const inputName = file.name;
    const outputName = inputName.replace(/\.[^.]+$/, '.webm');
  
    ffmpeg.FS('writeFile', inputName, await fetchFile(file));
  
    await ffmpeg.run(
      '-i', inputName,
      '-c:v', 'libvpx',
      '-b:v', '800k',
      '-vf', 'scale=1280:-1',
      '-an',
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

  const renderMediaGrid = () => (
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

  const renderAddMediaSection = () =>
    (mode === 'add' || mode === 'edit') && (
      <div className="image-grid-item-add-image">
        <label>
          +
          <input type="file" accept="image/*,video/*" onChange={handleMediaChange} multiple hidden />
        </label>
      </div>
    );

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
