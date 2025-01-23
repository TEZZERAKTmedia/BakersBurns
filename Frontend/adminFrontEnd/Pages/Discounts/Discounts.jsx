import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminApi } from '../../config/axios'; // Assuming you're using axios for API calls
import DiscountEditForm from './editDiscountByType'; // Import the new form for editing discounts
import { motion, AnimatePresence } from 'framer-motion'; // Import framer-motion

import AddDiscountForm from './addDiscount';

const DiscountManagementPage = () => {
  const [discounts, setDiscounts] = useState([]);
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [productType, setProductType] = useState(null); // Track productType
  const [modalAnimation, setModalAnimation] = useState(''); // State for animation class
  const [showAddDiscountForm, setShowAddDiscountForm] = useState(false);
  // Fetch the discounted products when the page loads
  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await adminApi.get(`/discount/`); // Fetch the products with discounts
      setDiscounts(response.data); // Set the fetched discount data
      console.log(response.data); // Log the fetched data
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast.error('Failed to fetch discounts');
    }
  };
  

  const handleEditDiscount = (discount, productType) => {
    console.log('Selected Discount:', discount); // Log the selected discount
    console.log('Selected Product Type:', productType); // Log the selected product type
    setSelectedDiscount(discount); // Set the selected discount
    setProductType(productType); // Set the product type
    setModalAnimation('modal-fade-in'); // Trigger fade-in animation
    setIsEditingDiscount(true); // Open the edit modal
  };

  const handleCloseModal = () => {
    setModalAnimation('modal-fade-out'); // Trigger fade-out animation
    setTimeout(() => {
      setIsEditingDiscount(false);
      setSelectedDiscount(null); // Reset selected discount when modal closes
      setProductType(null); // Reset productType
    }, 300); // Delay the state reset to allow animation to complete
  };

  // Function to format dates as MM/DD/YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <div className="product-manager-container">
     <button onClick={() => setShowAddDiscountForm(true)} style={{marginTop: '25%'}}>Add Discount</button>
      {showAddDiscountForm && (
        <AddDiscountForm
           // Pass product types if needed
          onSave={(discountData) => applyDiscount(discountData)} // Handle adding a discount
          onClose={() => setShowAddDiscountForm(false)} // Close the form
        />
      )}

      <h2>Manage Discounts for Products</h2>

      {/* Displaying Grouped Products with Discounts */}
      <div>
        {Object.entries(discounts).map(([productType, products]) => (
          <div key={productType} className="form-section">
            {/* Modal for Editing Discount */}
            <AnimatePresence>
              {isEditingDiscount && selectedDiscount && (
                <motion.div
                  className={`modal ${modalAnimation}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <DiscountEditForm
                    discount={selectedDiscount}
                    productType={productType} // Pass productType here
                    onClose={handleCloseModal}
                    onSuccess={handleCloseModal}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Edit Button */}
            <button onClick={() => handleEditDiscount(products, productType)} style={{width:'30%', backgroundColor:'white', margin:'20px'}}>
          
            Edit
            </button>
            <h3>{productType}</h3>

            {/* Discount Details */}
            <div className="discount-details">
              {products.map((product) => (
                product.isDiscounted && (
                  <div key={product.id} className="discount-info">
                    <p>
                      Discount: 
                      {product.discountType === 'percentage' 
                        ? `${product.discountAmount}%` 
                        : `$${product.discountAmount}`}
                    </p>
                    <p>Start Date: {formatDate(product.discountStartDate)}</p>
                    <p>End Date: {formatDate(product.discountEndDate)}</p>
                  </div>
                )
              ))}
            </div>

            <div className="product-grid">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  className="product-card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={`${import.meta.env.VITE_BACKEND}/uploads/${product.thumbnail}`}
                    alt={product.name}
                    className="thumbnail-image"
                    style={{ height: '20%', width: '20%' }}
                  />
                  <h4>{product.name}</h4>

                  {/* Display Discount Information */}
                  
                    <div className="form-section">
                      <p style={{color:'black'}}>
                        Discount: 
                        {product.discountType === 'percentage' 
                          ? `${product.discountAmount}%` 
                          : `$${product.discountAmount}`}
                      </p>
                      <p style={{color:'black'}}>Start Date: {formatDate(product.discountStartDate)}</p>
                      <p style={{color:'black'}}>End Date: {formatDate(product.discountEndDate)}</p>
                    </div>
                  
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscountManagementPage;
