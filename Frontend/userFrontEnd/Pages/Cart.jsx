import React, { useState, useEffect } from 'react';
import { userApi } from '../config/axios';
import { loadStripe } from '@stripe/stripe-js';
import '../Componentcss/cart.css';
import LoadingPage from '../Components/loading'; // Import the loading component
import { useNotification } from '../Components/notification/notification'; // Import notification context
import Modal from '../Components/modalProductDetails'; // Import the modal component

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true); // Add loading state
  const { showNotification } = useNotification(); // Use notification context
  const [selectedProductId, setSelectedProductId] = useState(null); // State to track selected product for the modal
  const [isModalOpen, setModalOpen] = useState(false); // State to control modal visibility

  useEffect(() => {
    getCart();
  }, []);

  // Fetch cart items from the backend
  const getCart = async () => {
    setLoading(true);
    try {
      const response = await userApi.get('/cart');
      console.log('Cart items response:', response.data); // Debug log
      setCartItems(response.data);
      calculateTotal(response.data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate the total amount of the cart
  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    setTotalAmount(total);
  };

  // Handle Stripe Checkout
  const handleCheckout = async () => {
    setLoading(true); // Start loading
    try {
      const stripe = await stripePromise;
      const cartData = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        thumbnail: item.product.thumbnail,
      }));

      const response = await userApi.post('/stripe/create-checkout-session', { cartItems: cartData, totalAmount });
      const { sessionId } = response.data;
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        console.error('Stripe checkout error:', error);
        showNotification('Checkout failed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      showNotification('Unable to proceed to checkout.', 'error');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Delete a cart item
  const deleteCartItem = async (itemId) => {
    setLoading(true); // Start loading
    try {
      await userApi.delete(`/cart/${itemId}`);
      showNotification('Item removed from cart.', 'success'); // Show success message
      getCart();
    } catch (error) {
      console.error('Error deleting cart item:', error);
      showNotification('Failed to remove item from cart.', 'error'); // Show error message
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Open modal and set selected product
  const openProductModal = (productId) => {
    console.log('Clicked product ID:', productId); // Debug log
    setSelectedProductId(productId);
    setModalOpen(true);
  };
  
  // Close modal
  const closeProductModal = () => {
    setSelectedProductId(null);
    setModalOpen(false);
  };

  return loading ? (
    <LoadingPage /> // Display loading page while loading
  ) : (
    <div className="cart-container" >
      <h2 style={{backgroundColor: 'white', padding: '20px', borderRadius: '20px'}}>Your Cart</h2>
      <div className="cart-items">
        {cartItems.map(item => (
          <div
          key={item.id}
          className="cart-item"
          onClick={() => {
            console.log('Cart Item:', item); // Check the structure of `item`
            console.log('Product ID:', item.productId); // Specifically log the `productId`
            openProductModal(item.productId); // Pass `productId` instead of `product.id`
          }}
          style={{ cursor: 'pointer' }}
        >
        
        
            {item.product.thumbnail ? (
              <img
                className="product-image"
                src={`${import.meta.env.VITE_IMAGE_BASE_URL}/${item.product.thumbnail}`}
                alt={item.product.name}
                style={{ width: '100px', height: '100px' }}
              />
            ) : (
              <p>No image available</p>
            )}
            <h3>{item.product.name}</h3>
            <p>Price: ${item.product.price}</p>
            <p>Quantity: {item.quantity}</p>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent modal opening on button click
                deleteCartItem(item.productId);
              }}
              className="delete-button"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="cart-total">
        <h3>Total: ${totalAmount.toFixed(2)}</h3>
      </div>
      <button onClick={handleCheckout} className="checkout-button">
        Proceed to Checkout
      </button>

      {/* Modal Component */}
      <Modal
        isOpen={isModalOpen}
        productId={selectedProductId}
        onClose={closeProductModal}
      />
    </div>
  );
};

export default Cart;
