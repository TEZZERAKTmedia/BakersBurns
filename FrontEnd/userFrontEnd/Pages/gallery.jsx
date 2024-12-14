import React, { useEffect, useState } from "react";
import { userApi } from "../config/axios";
import '../Pagecss/gallery.css'; // Assuming CSS file for custom styles
import { motion } from "framer-motion";

const Gallery = () => {
    const [gallery, setGallery] = useState([]);
    const [modalData, setModalData] = useState(null); // For the pop-up data
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal open state

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const response = await userApi.get('/user-gallery/get-gallery');
            setGallery(response.data);
        } catch (error) {
            console.error('Unable to display gallery!', error);
        }
    };

    const openModal = (item) => {
        setModalData(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalData(null);
    };

    return (
        <div className="gallery" style={{ marginTop: '100px' }}>
            <motion.h1 
            style={{
              fontFamily: '"Dancing Script", cursive',
              fontSize: '5rem',
              color: 'Black',
              textShadow: '2px 4px 10px rgba(0, 0, 0, 0.3)',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Gallery
          </motion.h1>
            <div className="gallery-grid">
                {gallery.map(item => (
                    <div 
                        className="gallery-tile" 
                        key={item.id}
                        onClick={() => openModal(item)} // Open modal on click
                    >
                        <img 
                            src={`${import.meta.env.VITE_GALLERY_IMAGE_BASE_URL}/${item.image}`} 
                            alt={item.title} 
                            className="gallery-image"
                        />
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && modalData && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button" onClick={closeModal}>×</button>
                        <img 
                            src={`${import.meta.env.VITE_GALLERY_IMAGE_BASE_URL}/${modalData.image}`} 
                            alt={modalData.title} 
                            className="modal-image"
                            onClick={closeModal}
                        />
                        <h3 className="modal-title">{modalData.title}</h3>
                        <p className="modal-description">{modalData.description}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;
