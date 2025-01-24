import React, { useState, useEffect } from 'react';
import EditProductForm from './editProduct';
import DiscountByProductForm from './discountByProduct';
import { useProductContext } from './ProductsContext'; // Import context
import './product_card.css';
import { toast } from 'react-toastify';
import DiscountIcon from '../../assets/Icons/discount.png';

const ProductCard = ({ product, onDeleteProduct }) => { 
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [media, setMedia] = useState([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

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
        console.error("Error fetching product details:", error);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [product.id, fetchProductDetails]);

  const handleDelete = async () => {
    try {
      await onDeleteProduct(product.id); // Pass product id to delete
      toast.success('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product. This product might have been purchased or is in use.');
    }
  };

  // Function to format date
  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
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
      ) :
      isEditingDiscount ? (
        <DiscountByProductForm
          product={product} // Pass the product to the form
          onClose={() => setIsEditingDiscount(false)}
          onSuccess={() => {
            setIsEditingDiscount(false);
            fetchProducts(); // Refresh the products list after discount is added
          }}
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
            <p style={{ color: 'black' }}>${product.price}</p>
         
            {!product.isDiscounted && (
              <div style={{width: '50%', marginLeft:' 25%', }}> 
            <button
              className='add-discount-by-product'
              onClick={() => setIsEditingDiscount(true)}
             
            >
              <img src={DiscountIcon}  style={{height:'50px', width:'50px'}}/>
              Add Discount
            </button>
            </div>
          )}
          


            {/* Check if product is discounted and show discount details */}
            {product.isDiscounted && (
              <div style={{ position: 'relative', display: 'inline-block' }} className="discount-overlay">
                <div className='form-section'>
                {/* Image */}
                <div style={{ position: 'relative' }}>
                  <img src={DiscountIcon} alt="Discount Icon" style={{ width: '100px', height: '100px' }} />

                  {/* Text over the image */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%', // Center vertically
                      left: '50%', // Center horizontally
                      transform: 'translate(-50%, -50%)', // Align center
                      zIndex: 2, // Ensure text appears above the image
                      textAlign: 'center',
                      color: 'white', // White text for contrast on the image
                      fontSize: '2rem', // Font size for discount text
                      fontWeight: 'bold', // Bold text
                    }}
                  >
                    <p>
                      {product.discountType === 'percentage'
                        ? `${parseInt(product.discountAmount)}%`
                        : `$${product.discountAmount}`}
                    </p>
                  </div>
                </div>
                

                {/* Discount Start and End Dates */}
                <div >
                <div
                  className="form-section"
                 
                >
                  <p style={{color:'black'}}>
                    <strong>Start Date:</strong> {product.discountStartDate ? formatDate(product.discountStartDate) : 'N/A'}
                  </p>
                  <p style={{color:'black'}}>
                    <strong>End Date:</strong> {product.discountEndDate ? formatDate(product.discountEndDate) : 'N/A'}
                  </p>
                </div>
                </div>
                

                {/* Discounted price */}
                <div className="form-section">
                  <h3>Discounted Price</h3>
                  <p style={{ color: 'black' }}>
                    {product.discountPrice ? `$${product.discountPrice}` : 'No discounted price available'}
                  </p>
                </div>

                {/* Conditional logic for showing the Edit Discount form */}
                {isEditingDiscount ? (
                  <DiscountByProductForm
                    product={product} // Pass the entire product object to the form
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
              </div>
              </div>
            )}
          </div>

          {isLoadingDetails ? (
            <p>Loading product details...</p>
          ) : productDetails ? (
            <div className="form-section">
              <p style={{ color: 'black' }}>
                <strong>Description:</strong> {productDetails.description}
              </p>
              <p style={{ color: 'black' }}>
                <strong>Type:</strong> {productDetails.type}
              </p>
              <p style={{ color: 'black' }}>
                <strong>Quantity:</strong> {productDetails.quantity}
              </p>
            </div>
          ) : (
            <p>No additional details available</p>
          )}

          <div>
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

      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

export default ProductCard;
