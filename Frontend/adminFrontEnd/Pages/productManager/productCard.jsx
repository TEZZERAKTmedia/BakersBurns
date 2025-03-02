import React, { useState, useEffect } from 'react';
import EditProductForm from './editProduct';
import DiscountByProductForm from './discountByProduct';
import { useProductContext } from './ProductsContext';
import { toast } from 'react-toastify';
import DiscountIcon from '../../assets/Icons/discount.webp';
import TrashIcon from '../../assets/Icons/trash.webp';
import { Link } from 'react-router-dom';

import './product_card.css'; // Updated CSS filename with prefix classes

const ProductCard = ({ product, onDeleteProduct }) => {
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [media, setMedia] = useState([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { fetchProducts, fetchProductDetails, fetchProductMedia } = useProductContext();

  const handleCancelEdit = () => {
    setIsEditingProduct(false);
  };

  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoadingMedia(true);
      try {
        const mediaData = await fetchProductMedia(product.id);
        setMedia(mediaData || []);
      } catch (error) {
        console.error('Error fetching media:', error);
      } finally {
        setIsLoadingMedia(false);
      }
    };
    fetchMedia();
  }, [product.id, fetchProductMedia]);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoadingDetails(true);
      try {
        const details = await fetchProductDetails(product.id);
        setProductDetails(details);
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setIsLoadingDetails(false);
      }
    };
    fetchDetails();
  }, [product.id, fetchProductDetails]);

  const handleDelete = async () => {
    try {
      await onDeleteProduct(product.id);
      toast.success('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product. This product might have been purchased or is in use.');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await onDeleteProduct(product.id);
      toast.success('Product deleted successfully!');
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product. This product might have been purchased or is in use.');
    }
  };

  // Format date for discount details
  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <div className="pc-container">
      {isEditingProduct ? (
        <EditProductForm
          productId={product.id}
          fetchProducts={fetchProducts}
          onClose={() => setIsEditingProduct(false)}
          onCancel={handleCancelEdit}
        />
      ) : isEditingDiscount ? (
        <DiscountByProductForm
          product={product}
          onClose={() => setIsEditingDiscount(false)}
          onSuccess={() => {
            setIsEditingDiscount(false);
            fetchProducts(); // Refresh product list
          }}
        />
      ) : (
        <>
          <div className="pc-product-info">
            {product.thumbnail ? (
              <img
                src={`${import.meta.env.VITE_BACKEND}/uploads/${product.thumbnail}`}
                alt={`${product.name} Thumbnail`}
                className="pc-thumbnail"
              />
            ) : (
              <p className="pc-no-thumbnail">No thumbnail available</p>
            )}

            <h3 className="pc-product-name">{product.name}</h3>
            <p className="pc-price">${product.price}</p>

            {/* Add Discount Button (only if product is not discounted) */}
            {!product.isDiscounted && (
              <div className="pc-add-discount-wrapper">
                <Link to="/discount">
                  <button className="pc-add-discount-button">
                    <img src={DiscountIcon} className="pc-discount-icon" alt="Discount Icon" />
                    Add Discount
                  </button>
                </Link>
              </div>
            )}

            {/* If product is discounted, show discount info */}
            {product.isDiscounted && (
              <div className="pc-discount-overlay">
                <div className="pc-discount-details">
                  <div className="pc-discount-image-wrapper">
                    <img src={DiscountIcon} alt="Discount Icon" className="pc-discount-image" />
                    <div className="pc-discount-overlay-text">
                      {product.discountType === 'percentage'
                        ? `${parseInt(product.discountAmount)}%`
                        : `$${product.discountAmount}`}
                    </div>
                  </div>

                  {/* Start / End Dates */}
                  <div className="pc-discount-dates">
                    <p>
                      <strong>Start Date:</strong>{' '}
                      {product.discountStartDate ? formatDate(product.discountStartDate) : 'N/A'}
                    </p>
                    <p>
                      <strong>End Date:</strong>{' '}
                      {product.discountEndDate ? formatDate(product.discountEndDate) : 'N/A'}
                    </p>
                  </div>

                  {/* Discounted Price */}
                  <div className="pc-discount-price">
                    <h3>Discounted Price</h3>
                    <p>{product.discountPrice ? `$${product.discountPrice}` : 'No discounted price available'}</p>
                  </div>

                  {/* Edit Discount Button */}
                  {!isEditingDiscount && (
                    <button
                      className="pc-edit-discount-button"
                      onClick={() => setIsEditingDiscount(true)}
                    >
                      Edit Discount
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          {isLoadingDetails ? (
            <p className="pc-loading">Loading product details...</p>
          ) : productDetails ? (
            <div className="pc-product-details">
              <p>
                <strong>Description:</strong> {productDetails.description}
              </p>
              <p>
                <strong>Type:</strong> {productDetails.type}
              </p>
              <p>
                <strong>Quantity:</strong> {productDetails.quantity}
              </p>
            </div>
          ) : (
            <p className="pc-no-details">No additional details available</p>
          )}

          {/* Media */}
          <div className="pc-media-container">
            {isLoadingMedia ? (
              <p className="pc-loading">Loading media...</p>
            ) : media.length > 0 ? (
              media.map((item, index) => (
                <div key={item.id} className="pc-media-item">
                  {item.type === 'image' ? (
                    <img
                      src={`${import.meta.env.VITE_BACKEND}/uploads/${item.url}`}
                      alt={`Media ${index + 1}`}
                      className="pc-media-preview"
                    />
                  ) : (
                    <video
                      className="pc-media-preview"
                      src={`${import.meta.env.VITE_BACKEND}/uploads/${item.url}`}
                      loop
                      muted
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              ))
            ) : (
              <p className="pc-no-media">No media available</p>
            )}
          </div>

          {/* Edit Product button */}
          <button className="modal-buttons" onClick={() => setIsEditingProduct(true)}>
            Edit Product
          </button>
        </>
      )}

      {/* Delete Product (trash icon) */}
      <div className="pc-trash-wrapper">
        <img
          src={TrashIcon}
          alt="Trash Icon"
          className="pc-trash-icon"
          onClick={() => setShowConfirmModal(true)}
        />
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="pc-modal-overlay">
          <div className="pc-modal-content">
            <h3>Are you sure?</h3>
            <p>Deleting this product cannot be undone.</p>
            <div className="pc-modal-buttons">
              <button onClick={handleDeleteConfirm} className="pc-confirm-button">
                Yes, Delete
              </button>
              <button onClick={() => setShowConfirmModal(false)} className="pc-cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
