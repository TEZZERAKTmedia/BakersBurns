import React, { useEffect } from 'react';


const DiscountList = () => {
  const { fetchProductDiscounts, deleteDiscount, discounts } = useProductContext();

  useEffect(() => {
    fetchProductDiscounts(1);  // Assuming 1 is the product ID for demonstration
  }, [fetchProductDiscounts]);

  const handleDeleteDiscount = (discountId) => {
    deleteDiscount(discountId);
  };

  return (
    <div>
      <h2>Discount List</h2>
      {discounts.length === 0 ? (
        <p>No discounts available</p>
      ) : (
        <ul>
          {discounts.map((discount) => (
            <li key={discount.id}>
              <span>{discount.discountType}: {discount.discountAmount}</span>
              <button onClick={() => handleDeleteDiscount(discount.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DiscountList;
