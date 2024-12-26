import React, { useState, useEffect } from 'react';
import EditProductForm from './editProduct';
import DiscountByProductForm from './discountForm';
import { useProductContext } from '../../Components/productManager/ProductsContext'; // Import context
import './product_card.css';

const ProductCard = ({ product, onDeleteProduct }) => {
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [media, setMedia] = useState([]); // State to hold media files
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  const { getProductDetails } = useProductContext(); // Fetch details from context

  // Fetch media files on mount
  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoadingMedia(true);
      try {
        const productDetails = await getProductDetails(product.id); // Use context to fetch product details
        setMedia(productDetails.media || []); // Store media files
      } catch (error) {
        console.error('Error fetching media:', error);
      } finally {
        setIsLoadingMedia(false);
      }
    };

    fetchMedia();
  }, [product.id, getProductDetails]);

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

          <button className='product-card-buttons' onClick={() => setIsEditingProduct(true)}>Edit Product</button>
        </>
      )}

      {isEditingDiscount ? (
        <DiscountByProductForm
          productId={product.id}
          onClose={() => setIsEditingDiscount(false)}
          onSuccess={() => setIsEditingDiscount(false)}
        />
      ) : (
        <button className='product-card-buttons' onClick={() => setIsEditingDiscount(true)}>Edit Discount</button>
      )}

      <button onClick={() => onDeleteProduct(product.id)}>Delete</button>
    </div>
  );
};

export default ProductCard;
