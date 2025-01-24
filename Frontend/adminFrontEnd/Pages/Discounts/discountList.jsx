import React, { useEffect } from 'react';
import { useDiscountContext } from './DiscountContext';

const DiscountList = () => {
  const { fetchDiscounts, deleteDiscountByType, discounts } = useDiscountContext();

  useEffect(() => {
    fetchDiscounts(); // Fetch discounts when the component mounts
  }, [fetchDiscounts]);

  const handleDeleteDiscount = (productType) => {
    deleteDiscountByType(productType); // Trigger the context function
  };

  return (
    <div>
      <h2>Discount List</h2>
      {discounts.length === 0 ? (
        <p>No discounts available</p>
      ) : (
        <ul>
          {Object.entries(discounts).map(([productType, products]) => (
            <li key={productType}>
              {/* Render only the product type */}
              <h3>{productType}</h3>

              {/* Render the discount details for each product */}
              <ul>
                {products.map(({ id, discountType, discountAmount }) => (
                  <li key={id}>
                    {/* Render only the discount information */}
                    {discountType === 'percentage'
                      ? `${discountAmount}%`
                      : `$${discountAmount}`}
                  </li>
                ))}
              </ul>

              {/* Delete button for the product type */}
              <button onClick={() => handleDeleteDiscount(productType)}>
                Delete All Discounts for {productType}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DiscountList;
