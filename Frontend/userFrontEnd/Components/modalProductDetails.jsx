import React, { useEffect, useState } from 'react';
import '../Componentcss/modal.css';
import { userApi } from '../config/axios';

const Modal = ({ isOpen, productId, onClose }) => {
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Modal Props - isOpen:', isOpen, 'productId:', productId); // Debug log
    if (isOpen && productId) {
      fetchProductDetails(productId);
    }
  }, [isOpen, productId]);
  

  const fetchProductDetails = async (id) => {
    console.log('Fetching product details in Modal for id:', id); // Debug log
    setLoading(true);
    try {
      const response = await userApi.get(`/cart/details/${id}`);
      console.log('Response from Modal API call:', response.data); // Debug log
      setProductDetails(response.data.product); // Assuming `product` is the returned key
    } catch (error) {
      console.error('Error fetching product details in Modal:', error);
    } finally {
      setLoading(false);
    }
  };
  

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close-modal" onClick={onClose}>&times;</span>

        {loading ? (
          <p>Loading...</p>
        ) : productDetails ? (
          <>
            <h3 style={{ color: 'black' }}>{productDetails.name}</h3>
            <img
              src={`${import.meta.env.VITE_IMAGE_BASE_URL}/${productDetails.image}`}
              alt={productDetails.name}
            />
            <div className="modal-descriptor">
              <h4>Description:</h4>
              <p>{productDetails.description}</p>
            </div>
            <div className="modal-descriptor">
              <h4>Price: USD</h4>
              <p>${productDetails.price}</p>
            </div>
            <div className="modal-descriptor">
              <h4>Dimensions:</h4>
              <div className="dimensions-container">
                <div className="dimensions-column">
                  <p><strong>Metric</strong></p>
                  <p>Length:</p>
                  <p>Width:</p>
                  <p>Height:</p>
                </div>
                <div className="dimensions-column">
                  <p><strong>IN:</strong></p>
                  <p>{productDetails.length} in</p>
                  <p>{productDetails.width} in</p>
                  <p>{productDetails.height} in</p>
                </div>
                <div className="dimensions-column">
                  <p><strong>CM:</strong></p>
                  <p>{(productDetails.length * 2.54).toFixed(2)} cm</p>
                  <p>{(productDetails.width * 2.54).toFixed(2)} cm</p>
                  <p>{(productDetails.height * 2.54).toFixed(2)} cm</p>
                </div>
              </div>
            </div>
            <div className="modal-descriptor">
              <h4>Weight</h4>
              <p>{productDetails.weight}</p>
            </div>
          </>
        ) : (
          <p>Product details could not be loaded.</p>
        )}
      </div>
    </div>
  );
};

export default Modal;
