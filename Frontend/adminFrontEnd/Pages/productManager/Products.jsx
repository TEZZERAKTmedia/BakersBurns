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
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingDiscount, setEditingDiscount] = useState(null); // Specific product discount editing

  return isLoading ? (
    <LoadingPage />
  ) : (
    <div className="product-manager-container" style={{width:'1000px'}}>
      <h1 className="page-header" style={{ marginTop: '100px' }}></h1>

      <div className="add-forms">
        {!showAddProductForm && (
          <div className="add-buttons">
            <button style={{ padding: '10px' }} onClick={() => setShowAddProductForm(true)}>
              Add Product
            </button>
          </div>
        )}
      </div>

      {showAddProductForm && (
        <ProductForm
          productTypes={productTypes}
          onClose={() => setShowAddProductForm(false)}
        />
      )}

      {editingDiscount && (
        <DiscountForm
          discount={editingDiscount} // Pass the selected product's discount
          onSave={(discountData) => {
            applyDiscount(discountData); // Add or update discount for a specific product
          }}
          onClose={() => setEditingDiscount(null)}
        />
      )}

      <ProductList
        products={products}
        onDeleteProduct={handleDeleteProduct}
        onEditProduct={(product) => {
          setEditingProduct(product);
          setShowAddProductForm(true);
        }}
        onAddDiscount={(product) => {
          setEditingDiscount({ productId: product.id, ...product.discount });
        }}
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
