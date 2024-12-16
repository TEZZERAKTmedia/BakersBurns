import React, { useState, useEffect } from "react";
import { adminApi } from "../config/axios";
import { motion, AnimatePresence } from "framer-motion";
import Dropzone from "react-dropzone";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Pagecss/gallery.css';

const Gallery = () => {
    const [galleryItems, setGalleryItems] = useState([]);
    const [newGalleryItem, setNewGalleryItem] = useState({ title: '', description: '', image: null });
    const [editGalleryItem, setEditGalleryItem] = useState(null); // Item being edited
    const [imagePreview, setImagePreview] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false); // Loading state for async actions
    const [showModal, setShowModal] = useState(false); // Modal visibility

    useEffect(() => {
        fetchGallery();
    }, []);

    // Fetch all gallery items
    const fetchGallery = async () => {
        try {
            setLoading(true); // Show loading spinner
            const response = await adminApi.get('/gallery-manager/get-gallery-items', { withCredentials: true });
            setGalleryItems(response.data);
        } catch (error) {
            console.error('Error fetching gallery:', error);
        } finally {
            setLoading(false); // Hide loading spinner
        }
    };

    // Handle image change using Dropzone (for drag-and-drop)
    const handleImageDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
            setNewGalleryItem({ ...newGalleryItem, image: file });
        }
    };

    // Add new gallery item
    const handleAddGalleryItem = async () => {
        if (!newGalleryItem.title || !newGalleryItem.image || !newGalleryItem.description) {
          toast.error('Please fill out all fields');
          return;
        }
      
        try {
          setLoading(true); // Show loading spinner
          const formData = new FormData();
          formData.append('title', newGalleryItem.title);
          formData.append('description', newGalleryItem.description);
          formData.append('image', newGalleryItem.image); // This key should match the key in the multer setup
      
          await adminApi.post('/gallery-manager/add-gallery-items', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
          });
      
          toast.success('Image uploaded successfully!');
          fetchGallery();
          resetForm();
          setShowModal(false); // Close modal after success
        } catch (error) {
          toast.error('Error uploading image');
          console.error('Error uploading image:', error);
        } finally {
          setLoading(false); // Hide loading spinner
        }
      };
      

    // Reset form inputs
    const resetForm = () => {
        setNewGalleryItem({ title: '', description: '', image: null });
        setImagePreview('');
        setEditGalleryItem(null); // Reset the edit mode
    };

    // Delete gallery item
    const handleDeleteGalleryItem = async (id) => {
        try {
            setLoading(true); // Show loading spinner
            await adminApi.delete(`/gallery-manager/delete-gallery-items/${id}`, { withCredentials: true });
            toast.success('Image deleted successfully');
            fetchGallery();
        } catch (error) {
            toast.error('Error deleting image');
            console.error('Error deleting gallery item:', error);
        } finally {
            setLoading(false); // Hide loading spinner
        }
    };

    // Toggle modal visibility for adding or editing
    const toggleModal = () => {
        setShowModal(!showModal);
        resetForm(); // Reset form each time modal is opened
    };

    return (
        <div className="gallery-container">
            <h1 style={{color:'black', marginTop:'100px'}}>Gallery Management</h1>

            <ToastContainer />

            <button onClick={toggleModal} className="add-image-btn">Add New Image</button>

            {loading && <div className="loading">Loading...</div>} {/* Loading spinner */}

            {/* Gallery List */}
            <div className="gallery-grid">
                <AnimatePresence>
                {galleryItems.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="gallery-card"
                    >
                        <div className="gallery-card-content">
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                            {item.image && <img src={`${import.meta.env.VITE_BACKEND}/galleryuploads/${item.image}`} alt={item.title} />}
                        </div>
                        <button onClick={() => handleDeleteGalleryItem(item.id)}>Delete</button>
                    </motion.div>
                ))}

                </AnimatePresence>
            </div>

            {/* Modal for Uploading/Editing Image */}
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
                            <h2>{editGalleryItem ? "Edit Image" : "Add New Image"}</h2>
                            <Dropzone onDrop={handleImageDrop}>
                                {({ getRootProps, getInputProps }) => (
                                    <div {...getRootProps()} className="dropzone">
                                        <input {...getInputProps()} />
                                        {imagePreview ? (
                                            <img  style={{ width: '100px'}} src={imagePreview} alt="Preview" className="image-preview" />
                                        ) : (
                                            <p style={{border:'dashed', padding:'20px', color:'#74aef'}}>Drag and drop an image here, or click to select one</p>
                                        )}
                                    </div>
                                )}
                            </Dropzone>
                            <input
                                type="text"
                                placeholder="Title"
                                value={newGalleryItem.title}
                                onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
                                style={{ height: '30px' }}
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                value={newGalleryItem.description}
                                onChange={(e) => setNewGalleryItem({ ...newGalleryItem, description: e.target.value })}
                            />
                            <button onClick={editGalleryItem ? handleUpdateGalleryItem : handleAddGalleryItem}>
                                {editGalleryItem ? 'Update Image' : 'Upload Image'}
                            </button>
                            <button onClick={toggleModal} className="close-modal-btn">Cancel</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Gallery;
