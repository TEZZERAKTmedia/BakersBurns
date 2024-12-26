import React, { useState } from 'react';
import ProductCard from './productCard';
import EditProductForm from './editProduct';
import DiscountByProductForm from './discountForm'; // Import the discount form

const ProductList = ({ products, onEditMedia, onDeleteProduct }) => {
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingDiscountId, setEditingDiscountId] = useState(null); // Track which product is being discounted

  return (
    <div className="product-list">
      {products.map((product) => (
        <div key={product.id} className="product-item-container">
          {/* Render Edit Form if editingProductId matches */}
          
            <ProductCard
              product={product}
              onEditMedia={() => {}}
              onEditProduct={() => setEditingProductId(product.id)}
              onEditDiscount={() => setEditingDiscountId(product.id)}
              onDeleteProduct={onDeleteProduct}
            />
         
        </div>
      ))}
    </div>
  );
};

export default ProductList;
