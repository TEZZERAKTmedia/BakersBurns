import React, { useState, useEffect, useRef } from "react";
import { adminApi } from "../config/axios";
import { motion, AnimatePresence } from "framer-motion";
import Dropzone from "react-dropzone";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Pagecss/gallery.css';

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [newGalleryItem, setNewGalleryItem] = useState({ title: '', description: '', image: null });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  
  // For add/edit modal
  const [showModal, setShowModal] = useState(false);

  // For viewing a tile's full details
  const [viewModal, setViewModal] = useState({ open: false, item: null });

  // Track "delete mode" from long press
  const [deleteMode, setDeleteMode] = useState(false);

  // Confirm delete popup
  const [confirmDelete, setConfirmDelete] = useState({ open: false, itemId: null });

  // Timer to detect long press
  const pressTimerRef = useRef(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  // Fetch all gallery items
  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/gallery-manager/get-gallery-items', { withCredentials: true });
      setGalleryItems(response.data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle new item form submission
  const handleAddGalleryItem = async () => {
    if (!newGalleryItem.title || !newGalleryItem.image || !newGalleryItem.description) {
      toast.error('Please fill out all fields');
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', newGalleryItem.title);
      formData.append('description', newGalleryItem.description);
      formData.append('image', newGalleryItem.image);

      await adminApi.post('/gallery-manager/add-gallery-items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      toast.success('Image uploaded successfully!');
      fetchGallery();
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error('Error uploading image');
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewGalleryItem({ title: '', description: '', image: null });
    setImagePreview('');
  };

  // Show confirmation for deleting an item
  const handleDeleteGalleryItem = (id) => {
    setConfirmDelete({ open: true, itemId: id });
  };

  // Confirm delete
  const confirmDeleteItem = async () => {
    const { itemId } = confirmDelete;
    try {
      setLoading(true);
      await adminApi.delete(`/gallery-manager/delete-gallery-items/${itemId}`, { withCredentials: true });
      toast.success('Image deleted successfully');
      fetchGallery();
    } catch (error) {
      toast.error('Error deleting image');
      console.error('Error deleting gallery item:', error);
    } finally {
      setLoading(false);
      setConfirmDelete({ open: false, itemId: null });
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setConfirmDelete({ open: false, itemId: null });
  };

  // Toggle add modal
  const toggleModal = () => {
    setShowModal(!showModal);
    resetForm();
  };

  // For viewing a tile's details in a modal
  const openViewModal = (item) => {
    setViewModal({ open: true, item });
  };

  const closeViewModal = () => {
    setViewModal({ open: false, item: null });
  };

  // Long press logic
  const handlePressStart = () => {
    // Start a timer
    pressTimerRef.current = setTimeout(() => {
      // If user holds for ~600ms, toggle delete mode
      setDeleteMode(true);
      toast.info("Delete mode active. Tap the red X to delete.");
    }, 600);
  };
  const handlePressEnd = () => {
    // If the timer is still pending, clear it
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
  };
  // Exiting delete mode
  const exitDeleteMode = () => {
    setDeleteMode(false);
  };

  return (
    <div className="gallery-container">
      <ToastContainer />
      <button onClick={toggleModal} className="add-image-btn">+</button>
      {loading && <div className="loading">Loading...</div>}

      {/* Grid of images like Instagram */}
      <div className="gallery-grid">
        {galleryItems.map((item) => {
          // Assume each item has an array of images (just like your JSON parse).
          const images = JSON.parse(item.image || '[]');

          // For demonstration, let's only show the FIRST image
          // or you can map all images if you want multiple squares.
          const coverImage = images[0];

          return (
            <div
                key={item.id}
                className={`gallery-item ${deleteMode ? "delete-mode" : ""}`}
                onClick={() => {
                    if (!deleteMode) openViewModal(item);
                }}
                onMouseDown={handlePressStart}
                onTouchStart={handlePressStart}
                onMouseUp={handlePressEnd}
                onTouchEnd={handlePressEnd}
                >
                {/* Wrap the content that should shake */}
                <div className={`shake-container ${deleteMode ? "shake" : ""}`}>
                    {coverImage && (
                    <img
                        src={`${import.meta.env.VITE_BACKEND}/galleryuploads/${coverImage}`}
                        alt={item.title}
                        className="gallery-image"
                    />
                    )}
                </div>
                {/* Delete icon is outside the shaking container */}
                <div
                    className="delete-icon"
                    onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteGalleryItem(item.id);
                    }}
                    role="button"
                    tabIndex="0"
                >
                    ✕
                </div>
                </div>

          );
        })}
      </div>

      {/* Button to exit delete mode if active */}
      {deleteMode && (
        <button
          style={{ margin: '20px auto', display: 'block' }}
          onClick={exitDeleteMode}
        >
          Exit Delete Mode
        </button>
      )}

      {/* Modal for adding new image */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="modal-content"
            >
              <h2>Add New Image</h2>
              <Dropzone
                onDrop={(acceptedFiles) => {
                  const file = acceptedFiles[0];
                  setNewGalleryItem({ ...newGalleryItem, image: file });
                  if (file) {
                    setImagePreview(URL.createObjectURL(file));
                  }
                }}
              >
                {({ getRootProps, getInputProps }) => (
                  <div {...getRootProps()} className="dropzone" style={{ marginBottom: '10px', border: '1px dashed #ccc', padding: '20px' }}>
                    <input {...getInputProps()} />
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', borderRadius: '5px' }} />
                    ) : (
                      <p>Drag and drop an image, or click to select</p>
                    )}
                  </div>
                )}
              </Dropzone>

              <input
                type="text"
                placeholder="Title"
                value={newGalleryItem.title}
                onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
                style={{ display: 'block', margin: '10px auto' }}
              />
              <input
                type="text"
                placeholder="Description"
                value={newGalleryItem.description}
                onChange={(e) => setNewGalleryItem({ ...newGalleryItem, description: e.target.value })}
                style={{ display: 'block', margin: '10px auto' }}
              />

              <button onClick={handleAddGalleryItem}>Upload</button>
              <button onClick={toggleModal} className="close-modal-btn">Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for viewing item details (click on tile) */}
      <AnimatePresence>
        {viewModal.open && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              {viewModal.item && (
                <>
                  {/* Show first image or map over all */}
                  {JSON.parse(viewModal.item.image || '[]').map((img, i) => (
                    <img
                      key={i}
                      src={`${import.meta.env.VITE_BACKEND}/galleryuploads/${img}`}
                      alt={viewModal.item.title}
                      className="modal-img"
                    />
                  ))}
                  <h3>{viewModal.item.title}</h3>
                  <p>{viewModal.item.description}</p>
                </>
              )}
              <button onClick={closeViewModal} className="close-modal-btn">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDelete.open && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete this image?</p>
              <div className="confirmation-buttons">
                <button
                  className="confirm-delete-btn"
                  onClick={confirmDeleteItem}
                >
                  Delete
                </button>
                <button
                  className="cancel-delete-btn"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
