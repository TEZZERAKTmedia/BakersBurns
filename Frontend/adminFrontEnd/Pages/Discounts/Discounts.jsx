import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DiscountEditForm from './editDiscountByType';
import { motion, AnimatePresence } from 'framer-motion';
import { useDiscountContext } from './discounts-context';
import AddDiscountForm from './addDiscount';
import './discount.css';

const DiscountManagementPage = () => {
  const {
    discounts,
    fetchDiscounts,
    deleteDiscountByType,
    applyDiscount,
  } = useDiscountContext();

  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [productType, setProductType] = useState(null);
  const [modalAnimation, setModalAnimation] = useState('');
  const [showAddDiscountForm, setShowAddDiscountForm] = useState(false);

  useEffect(() => {
    fetchDiscounts(); // Fetch discounts from context
  }, [fetchDiscounts]);

  const handleDeleteDiscountByType = async (productType) => {
    try {
      await deleteDiscountByType(productType);
      toast.success(`Discount for ${productType} removed successfully!`);
      setIsEditingDiscount(false);
      setSelectedDiscount(null);
      setProductType(null);
      fetchDiscounts();
    } catch (error) {
      console.error('Error deleting discount by type:', error);
      toast.error('Failed to remove discount.');
    }
  };

  const handleEditDiscount = (discount, productType) => {
    setSelectedDiscount(discount);
    setProductType(productType);
    setModalAnimation('modal-fade-in');
    setIsEditingDiscount(true);
  };

  const handleCloseModal = () => {
    setModalAnimation('modal-fade-out');
    setTimeout(() => {
      setIsEditingDiscount(false);
      setSelectedDiscount(null);
      setProductType(null);
    }, 300);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <div className="product-manager-container">
      <button
        onClick={() => setShowAddDiscountForm(true)}
        style={{ marginTop: '30%' }}
      >
        Add Discount
      </button>
      {showAddDiscountForm && (
        <AddDiscountForm
          onSave={async (discountData) => {
            await applyDiscount(discountData);
            fetchDiscounts();
            setShowAddDiscountForm(false);
          }}
          onClose={() => setShowAddDiscountForm(false)}
        />
      )}

      <h2>Manage Discounts for Products</h2>
      <div>
        {Object.entries(discounts).map(([productType, products]) => {
          const { discountType, discountAmount, discountStartDate, discountEndDate } =
            products[0] || {};

          return (
            <div key={productType}  style={{border:'5px solid #333', borderRadius:'20px', marginTop:'20px', background:'linear-gradient(145deg, #ffffff, #d3d3d3)', marginBottom:'20%' }}>
              <AnimatePresence>
                {isEditingDiscount && selectedDiscount && (
                  <motion.div
                    className={`modal ${modalAnimation}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button
                      onClick={() => handleDeleteDiscountByType(productType)}
                      style={{
                        width: '50%',
                        backgroundColor: 'red',
                        margin: '20px',
                        color: 'white',
                      }}
                    >
                      Delete Discount for {productType}
                    </button>
                    <DiscountEditForm
                      discount={selectedDiscount}
                      productType={productType}
                      onClose={handleCloseModal}
                      onSuccess={() => {
                        fetchDiscounts();
                        handleCloseModal();
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => handleEditDiscount(products, productType)}
                style={{ width: '30%', background: 'linear-gradient(145deg, #007bff, #0056b3)', margin: '20px' }}
              >
                Edit
              </button>
              <h3>{productType}</h3>

              {/* Render Discount Details at the Top */}
              <div >
                <p style={{color:'black'}}>
                  Discount:{' '}
                  {discountType === 'percentage'
                    ? `${discountAmount}% off`
                    : `$${discountAmount} off`}
                </p>
                <p  style={{color:'black'}}>Start Date: {formatDate(discountStartDate)}</p>
                <p  style={{color:'black'}}>End Date: {formatDate(discountEndDate)}</p>
              </div>

              {/* Render Product Grid Without Discount Details */}
              <div className="product-grid">
                {products.map((product) => (
                  <div key={product.id} className="product-card">
                    <img
                      src={`${import.meta.env.VITE_BACKEND}/uploads/${product.thumbnail}`}
                      alt={product.name}
                      className="product-thumbnail"
                    />
                    <div className="product-info">
                      
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DiscountManagementPage;
