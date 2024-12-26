import React, { useState } from 'react';
import { ProductsProvider, useProductContext } from '../Components/productManager/ProductsContext'; // Import the provider
import LoadingPage from '../Components/loading';
import ProductForm from '../Components/productManager/productForm';
import DiscountForm from '../Components/productManager/discountForm';
import ProductList from '../Components/productManager/productList';
import SortingControls from '../Components/productManager/sortingControls';
import '../Componentcss/product_management.css';

const ProductManagementContent = () => {
  const {
    products,
    productTypes,
    isLoading,
    fetchProducts,
    handleDeleteProduct,
    applyDiscount,
  } = useProductContext();

  const [sortCriteria, setSortCriteria] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [showAddDiscountForm, setShowAddDiscountForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingDiscount, setEditingDiscount] = useState(null);

  const handleSort = (criteria) => {
    const sortedProducts = [...products].sort((a, b) => {
      let valueA = a[criteria];
      let valueB = b[criteria];

      if (criteria === 'price') {
        valueA = parseFloat(a.price);
        valueB = parseFloat(b.price);
      }

      return sortOrder === 'asc' ? valueA > valueB : valueA < valueB;
    });

    setProducts(sortedProducts);
    setSortCriteria(criteria);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return isLoading ? (
    <LoadingPage />
  ) : (
    <div className="product-manager-container">
      <h1 className="page-header">Product Management</h1>

      <div className="add-forms">
        {!showAddProductForm && !showAddDiscountForm && (
          <div className="add-buttons">
            <button onClick={() => setShowAddProductForm(true)}>Add Product</button>
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

      <SortingControls onSort={handleSort} sortCriteria={sortCriteria} sortOrder={sortOrder} />

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
