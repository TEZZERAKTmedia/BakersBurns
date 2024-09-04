import React, { useEffect, useState, useCallback } from "react";
import { shopApi } from "../../userFrontEnd/config/axios";
import Cropper from "react-easy-crop";

const Gallery = () => {
    const [galleryItems, setGalleryItems] = useState([]); // Initialize as an array
    const [newGalleryItem, setNewGalleryItem] = useState({ title: '', description: '', image: null });
    const [imagePreview, setImagePreview] = useState('');
    const [zoom, setZoom] = useState(1);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [cropping, setCropping] = useState(false);

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        const response = await shopApi.get('/api/gallery/');
        setGalleryItems(response.data);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setNewGalleryItem({ ...newGalleryItem, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setCropping(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCrop = async () => {
        try {
            const croppedImage = await getCroppedImage(imagePreview, croppedAreaPixels);
            const file = new File([croppedImage], newGalleryItem.image.name, { type: 'image/png' });
            setNewGalleryItem({ ...newGalleryItem, image: file });

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setCropping(false);
            };
            reader.readAsDataURL(file);
        } catch (e) {
            console.error(e);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewGalleryItem({ ...newGalleryItem, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setCropping(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setNewGalleryItem({ title: '', description: '', image: null });
        setImagePreview('');
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        setCropping(false);
    };

    const handleAddGalleryItem = async () => {
        if (!newGalleryItem.title || !newGalleryItem.image || !newGalleryItem.description) {
            alert('Please fill out all fields');
            return;
        }

        const formData = new FormData();
        formData.append('title', newGalleryItem.title);
        formData.append('image', newGalleryItem.image);
        formData.append('description', newGalleryItem.description);

        await shopApi.post('/api/gallery', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        fetchGallery();
        resetForm();
    };

    const handleDeleteGalleryItem = async (id) => {
        await shopApi.delete(`/api/gallery/${id}`);
        fetchGallery();
    };

    return (
        <div className="gallery-container">
            <h1>Gallery Management</h1>
            <div className="gallery-form">
                <div className="image-upload" onDrop={handleDrop} onDragOver={handleDragOver}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {cropping ? (
                        <div className="cropper-container">
                            <Cropper
                                image={imagePreview}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                cropShape="rect"
                                showGrid={false}
                            />
                            <div className="cropper-buttons">
                                <button onClick={handleCrop}>Crop</button>
                            </div>
                        </div>
                    ) : (
                        imagePreview && <img src={imagePreview} alt="Image Preview" className="image-preview" />
                    )}
                </div>
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
                <button onClick={handleAddGalleryItem}>Add to Gallery</button>
            </div>

            <ul className="gallery-list">
                {galleryItems.map((item) => (
                    <li key={item.id} className="item-card">
                        <div className="product-details">
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                            {item.image && (
                                <div className="item-image">
                                    <img src={`http://localhost:3450/galleryuploads/${item.image}`} alt={item.title} />
                                </div>
                            )}
                        </div>
                        <button onClick={() => handleDeleteGalleryItem(item.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Gallery;
