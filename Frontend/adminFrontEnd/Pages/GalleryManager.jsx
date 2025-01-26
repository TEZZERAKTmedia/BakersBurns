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
    const [editGalleryItem, setEditGalleryItem] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchGallery();
    }, []);

    // Fetch all gallery items
    const fetchGallery = async () => {
        try {
            setLoading(true);
            const response = await adminApi.get('/gallery-manager/get-gallery-items', { withCredentials: true });
            setGalleryItems(response.data);
            console.log('Fetched gallery:', response.data);
        } catch (error) {
            console.error('Error fetching gallery:', error);
        } finally {
            setLoading(false);
        }
    };

    // Add new gallery item
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
            resetForm();
            setShowModal(false);
        } catch (error) {
            toast.error('Error uploading image');
            console.error('Error uploading image:', error);
        } finally {
            setLoading(false);
        }
    };

    // Reset form inputs
    const resetForm = () => {
        setNewGalleryItem({ title: '', description: '', image: null });
        setImagePreview('');
        setEditGalleryItem(null);
    };

    // Delete gallery item
    const handleDeleteGalleryItem = async (id) => {
        try {
            setLoading(true);
            await adminApi.delete(`/gallery-manager/delete-gallery-items/${id}`, { withCredentials: true });
            toast.success('Image deleted successfully');
            fetchGallery();
        } catch (error) {
            toast.error('Error deleting image');
            console.error('Error deleting gallery item:', error);
        } finally {
            setLoading(false);
        }
    };

    // Toggle modal visibility
    const toggleModal = () => {
        setShowModal(!showModal);
        resetForm();
    };

    return (
        <div className="form-section">
            <ToastContainer />
            <button onClick={toggleModal} className="add-image-btn">Add New Image</button>
            {loading && <div className="loading">Loading...</div>}

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
                                <div className="gallery-image-grid">
                                    {/* Map through the image JSON array */}
                                    {JSON.parse(item.image || '[]').map((img, index) => (
                                        <img
                                            key={index}
                                            src={`${import.meta.env.VITE_BACKEND}/galleryuploads/${img}`}
                                            alt={`Gallery Image ${index + 1}`}
                                            className="gallery-image"
                                        />
                                    ))}
                                </div>
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
                            <Dropzone onDrop={(acceptedFiles) => setNewGalleryItem({ ...newGalleryItem, image: acceptedFiles[0] })}>
                                {({ getRootProps, getInputProps }) => (
                                    <div {...getRootProps()} className="dropzone">
                                        <input {...getInputProps()} />
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="image-preview" />
                                        ) : (
                                            <p>Drag and drop an image here, or click to select one</p>
                                        )}
                                    </div>
                                )}
                            </Dropzone>
                            <input
                                type="text"
                                placeholder="Title"
                                value={newGalleryItem.title}
                                onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                value={newGalleryItem.description}
                                onChange={(e) => setNewGalleryItem({ ...newGalleryItem, description: e.target.value })}
                            />
                            <button onClick={handleAddGalleryItem}>Upload Image</button>
                            <button onClick={toggleModal} className="close-modal-btn">Cancel</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Gallery;
