import React, { useState, useEffect } from "react";
import { adminApi } from "../config/axios";
import Cropper from "react-easy-crop";

const Gallery = () => {
    const [galleryItems, setGalleryItems] = useState([]);
    const [newGalleryItem, setNewGalleryItem] = useState({ title: '', description: '', image: null });
    const [editGalleryItem, setEditGalleryItem] = useState(null); // Item being edited
    const [imagePreview, setImagePreview] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchGallery();
    }, []);

    // Fetch all gallery items
    const fetchGallery = async () => {
        try {
            const response = await adminApi.get('/gallery-manager/gallery', {
                withCredentials: true,
            });
            setGalleryItems(response.data);
        } catch (error) {
            console.error('Error fetching gallery:', error);
        }
    };

    // Handle image change for new or edited item
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
            setNewGalleryItem({ ...newGalleryItem, image: file });
        }
    };

    // Reset form inputs
    const resetForm = () => {
        setNewGalleryItem({ title: '', description: '', image: null });
        setImagePreview('');
        setEditGalleryItem(null); // Reset the edit mode
    };

    // Add new gallery item
    const handleAddGalleryItem = async () => {
        if (!newGalleryItem.title || !newGalleryItem.image || !newGalleryItem.description) {
            alert('Please fill out all fields');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', newGalleryItem.title);
            formData.append('description', newGalleryItem.description);
            formData.append('image', newGalleryItem.image);

            await adminApi.post('/gallery-manager/gallery', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });

            fetchGallery();
            resetForm();
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    // Update gallery item
    const handleUpdateGalleryItem = async () => {
        if (!editGalleryItem.title || !editGalleryItem.description) {
            alert('Please fill out all fields');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', editGalleryItem.title);
            formData.append('description', editGalleryItem.description);
            if (editGalleryItem.image) formData.append('image', editGalleryItem.image); // If new image selected

            await adminApi.put(`/gallery-manager/gallery/${editGalleryItem.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });

            fetchGallery();
            resetForm();
        } catch (error) {
            console.error('Error updating gallery item:', error);
        }
    };

    // Set item for editing
    const handleEdit = (item) => {
        setEditGalleryItem(item);
        setNewGalleryItem({ title: item.title, description: item.description });
        setImagePreview(`http://localhost:3450/galleryuploads/${item.image}`);
    };

    // Delete gallery item
    const handleDeleteGalleryItem = async (id) => {
        try {
            await adminApi.delete(`/gallery-manager/gallery/${id}`, {
                withCredentials: true,
            });
            fetchGallery();
        } catch (error) {
            console.error('Error deleting gallery item:', error);
        }
    };

    return (
        <div className="gallery-container">
            <h1>Gallery Management</h1>

            {/* Add/Update Form */}
            <div className="gallery-form">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                />
                <input
                    type="text"
                    placeholder="Title"
                    value={newGalleryItem.title}
                    onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
                    style={{height:'30px'}}
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
                {errorMessage && <p>{errorMessage}</p>}
            </div>

            {/* Gallery List */}
            <ul className="gallery-list">
                {galleryItems.map((item) => (
                    <li key={item.id} className="item-card">
                        <div className="product-details">
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                            {item.image && <img src={`http://localhost:3450/galleryuploads/${item.image}`} alt={item.title} />}
                        </div>
                        <button onClick={() => handleEdit(item)}>Edit</button>
                        <button onClick={() => handleDeleteGalleryItem(item.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Gallery;
