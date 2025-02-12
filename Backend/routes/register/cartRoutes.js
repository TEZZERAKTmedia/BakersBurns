const express = require('express');
const { addToGuestCart, getCartItems, createCheckoutSession, cancelCheckoutSession, deleteCartItem, setPassword, updateShippingDetails } = require('../../controllers/register/cartController');

const router = express.Router();

// Get all items in the cart
router.post('/add-guest-cart', addToGuestCart);
router.post('/delete-cart-item', deleteCartItem);
router.post('/items', getCartItems);
router.post('/update-shipping', updateShippingDetails)

// Lock inventory and create a Stripe checkout session
router.post('/create-checkout-session', createCheckoutSession);
router.post('/cancel-checkout', cancelCheckoutSession);
router.post('/set-password', setPassword);

module.exports = router;
