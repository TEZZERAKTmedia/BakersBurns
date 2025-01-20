import React, { useState, useEffect } from 'react';
import EditProductForm from './editProduct';
import DiscountByProductForm from './discountForm';
import { useProductContext } from '../../Components/productManager/ProductsContext'; // Import context
import './product_card.css';
import { toast } from 'react-toastify';

const ProductCard = ({ product, onDeleteProduct }) => { // Added onDeleteProduct as a prop
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [media, setMedia] = useState([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const { fetchProducts, fetchProductDetails, fetchProductMedia } = useProductContext();

  // Function to handle canceling edit mode
  const handleCancelEdit = () => {
    setIsEditingProduct(false);
  };

  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoadingMedia(true);
      try {
        const mediaData = await fetchProductMedia(product.id);
        console.log('Fetched Media:', mediaData);
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
        console.error("Error fetching product details:", error);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [product.id, fetchProductDetails]);

  const handleDelete = async () => {
    try {
      // Call the delete function passed from parent
      await onDeleteProduct(product.id); // Pass product id to delete
      toast.success('Product deleted successfully!'); // Show success message
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product. This product might have been purchased or is in use.');
    }
  };

  return (
    <div className="form-section">
      {isEditingProduct ? (
        <EditProductForm
          productId={product.id}
          fetchProducts={fetchProducts}
          onClose={() => setIsEditingProduct(false)}
          onCancel={handleCancelEdit}
        />
      ) : (
        <>
          <div className="product-info">
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
            <p style={{color:'black'}}>${product.price.toFixed(2)}</p>
          </div>

          {isLoadingDetails ? (
            <p>Loading product details...</p>
          ) : productDetails ? (
            <div className="form-section">
              <p style={{color:'black'}}>
                <strong>Description:</strong> {productDetails.description}
              </p>
              <p style={{color:'black'}}>
                <strong>Type:</strong> {productDetails.type}
              </p>
              <p style={{color:'black'}}>
                <strong>Quantity:</strong> {productDetails.quantity}
              </p>
            </div>
          ) : (
            <p>No additional details available</p>
          )}

          <div >
            {isLoadingMedia ? (
              <p>Loading media...</p>
            ) : media.length > 0 ? (
              media.map((item, index) => (
                <div key={item.id} className="image-uploader-grid-item">
                  {item.type === "image" ? (
                    <img
                      src={`${import.meta.env.VITE_BACKEND}/uploads/${item.url}`}
                      alt={`Media ${index + 1}`}
                      className="media-preview"
                    />
                  ) : (
                    <video
                      className="media-preview"
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

      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

export default ProductCard;
