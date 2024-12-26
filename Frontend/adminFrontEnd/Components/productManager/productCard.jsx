import React, { useState, useEffect } from 'react';
import EditProductForm from './editProduct';
import DiscountByProductForm from './discountForm';
import { useProductContext } from '../../Components/productManager/ProductsContext'; // Import context

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
        setMedia(productDetails.media || []);
      } catch (error) {
        console.error('Error fetching media:', error);
      } finally {
        setIsLoadingMedia(false);
      }
    };

    fetchMedia();
  }, [product.id, getProductDetails]);

  return (
    <div className="product-card">
      {isEditingProduct ? (
        <EditProductForm
          productId={product.id}
          onCancel={() => setIsEditingProduct(false)}
        />
      ) : (
        <>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <p>${product.price}</p>

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

          <button onClick={() => setIsEditingProduct(true)}>Edit Product</button>
        </>
      )}

      {isEditingDiscount ? (
        <DiscountByProductForm
          productId={product.id}
          onClose={() => setIsEditingDiscount(false)}
          onSuccess={() => setIsEditingDiscount(false)}
        />
      ) : (
        <button onClick={() => setIsEditingDiscount(true)}>Edit Discount</button>
      )}

      <button onClick={() => onDeleteProduct(product.id)}>Delete</button>
    </div>
  );
};

export default ProductCard;
