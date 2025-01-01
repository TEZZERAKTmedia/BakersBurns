import React, { useState, useEffect } from 'react';
import EditProductForm from './editProduct';
import DiscountByProductForm from './discountForm';
import { useProductContext } from '../../Components/productManager/ProductsContext'; // Import context
import './product_card.css';
import MediaUploader from '../mediaUploader';

const ProductCard = ({ product }) => {
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [media, setMedia] = useState([]); // State to hold media files
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [productDetails, setProductDetails] = useState(null); // State to hold product details
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const { fetchProductDetails, fetchProductMedia, deleteProduct } = useProductContext(); // Fetch functions and delete function from context

  // Fetch media files on mount
  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoadingMedia(true);
      try {
        const mediaData = await fetchProductMedia(product.id); // Fetch media by product ID
        console.log('Fetched media:', mediaData); // Debugging log
        setMedia(mediaData || []); // Store media files
      } catch (error) {
        console.error('Error fetching media:', error);
      } finally {
        setIsLoadingMedia(false);
      }
    };

    fetchMedia();
  }, [product.id, fetchProductMedia]);

  // Fetch product details on mount
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoadingDetails(true);
      try {
        const details = await fetchProductDetails(product.id); // Fetch product details
        console.log('Fetched product details:', details); // Debugging log
        setProductDetails(details); // Store product details
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
      await deleteProduct(product.id); // Use deleteProduct from context
      console.log(`Product ${product.id} deleted successfully`);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  return (
    <div className="product-tile">
      {isEditingProduct ? (
        <EditProductForm
          productId={product.id}
          onCancel={() => setIsEditingProduct(false)}
        />
      ) : (
        <>
          <div className="product-info">
            {/* Display thumbnail */}
            {product.thumbnail ? (
              <img
                src={`${import.meta.env.VITE_BACKEND}/uploads/${product.thumbnail}`}
                alt={`${product.name} Thumbnail`}
                className="thumbnail-image"
              />
            ) : (
              <p>No thumbnail available</p>
            )}
            <h3>{product.name}</h3>
            <p>${product.price.toFixed(2)}</p>
          </div>

          {/* Display additional product details */}
          {isLoadingDetails ? (
            <p>Loading product details...</p>
          ) : productDetails ? (
            <div className="product-details">
              <p><strong>Description:</strong> {productDetails.description}</p>
              <p><strong>Type:</strong> {productDetails.type}</p>
              <p><strong>Quantity:</strong> {productDetails.quantity}</p>
              {/* Add any other product details you need to display */}
            </div>
          ) : (
            <p>No additional details available</p>
          )}

          {/* Display media */}
          <div className="product-media">
            {isLoadingMedia ? (
              <p>Loading media...</p>
            ) : media.length > 0 ? (
              <div className="media-grid">
                {media.map((item, index) => (
                  <div key={item.id} className="media-item">
                    {item.type === 'image' ? (
                      <img
                        src={`${import.meta.env.VITE_BACKEND}/uploads/${item.url}`}
                        alt={`Media ${index + 1}`}
                        className="media-preview"
                      />
                    ) : (
                      <video
                        controls
                        className="media-preview"
                        src={`${import.meta.env.VITE_BACKEND}/uploads/${item.url}`}
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No media available</p>
            )}
          </div>

          <button
            className="product-card-buttons"
            onClick={() => setIsEditingProduct(true)}
          >
            Edit Product
          </button>
        </>
      )}

      {isEditingDiscount ? (
        <DiscountByProductForm
          productId={product.id}
          onClose={() => setIsEditingDiscount(false)}
          onSuccess={() => setIsEditingDiscount(false)}
        />
      ) : (
        <button
          className="product-card-buttons"
          onClick={() => setIsEditingDiscount(true)}
        >
          Edit Discount
        </button>
      )}

      {/* Use delete function */}
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

export default ProductCard;
