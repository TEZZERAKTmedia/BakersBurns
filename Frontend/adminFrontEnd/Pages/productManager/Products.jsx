import React, { useState } from 'react';
import { ProductsProvider, useProductContext } from './ProductsContext'; // Import the provider
import LoadingPage from '../../Components/loading';
import ProductForm from './productForm';
import DiscountForm from './discountForm';
import ProductList from './productList';
import SortingControls from './sortingControls';
import './product_management.css';

const ProductManagementContent = () => {
  const {
    products,
    productTypes,
    isLoading,
    fetchProducts,
    handleDeleteProduct,
    applyDiscount,
  } = useProductContext();


  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [showAddDiscountForm, setShowAddDiscountForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingDiscount, setEditingDiscount] = useState(null);



  return isLoading ? (
    <LoadingPage />
  ) : (
    <div className="product-manager-container">
      <h1 className="page-header" style={{marginTop:'100px'}}></h1>

      <div className="add-forms">
        {!showAddProductForm && !showAddDiscountForm && (
          <div className="add-buttons">
            <button style={{padding:'10px'}} onClick={() => setShowAddProductForm(true)}>Add Product</button>
            <button onClick={() => setShowAddDiscountForm(true)}>Add Discount</button>
          </div>
        )}
      </div>

      {showAddProductForm && (
        <ProductForm
          productTypes={productTypes}
          onClose={() => setShowAddProductForm(false)}
          
        />
      )}

      {showAddDiscountForm && (
        <DiscountForm
          productTypes={productTypes}
          discount={editingDiscount ? editingDiscount : {}}
          onSave={(discountData) => {
            if (editingDiscount) {
              // Update existing discount logic can go here
            } else {
              applyDiscount(discountData); // Add new discount
            }
          }}
          onClose={() => {
            setEditingDiscount(null);
            setShowAddDiscountForm(false);
          }}
        />
      )}



      <ProductList
  products={products}
  onDeleteProduct={handleDeleteProduct}
  onEditProduct={(product) => {
    setEditingProduct(product);
    setShowAddProductForm(true);
  }}
  onEditDiscount={(discount) => {
    setEditingDiscount(discount);
    setShowAddDiscountForm(true);
  }}
  setEditingProduct={setEditingProduct} // Pass it as a prop
/>
    </div>
  );
};

const ProductManagement = () => {
  return (
    <ProductsProvider>
      <ProductManagementContent />
    </ProductsProvider>
  );
};

export default ProductManagement;
