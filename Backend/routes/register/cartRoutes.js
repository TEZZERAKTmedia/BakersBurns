const express = require('express');
const { getCartItems, lockInventory, createCheckoutSession, checkQuantity } = require('../../controllers/register/cartController');
const router = express.Router();

// Get all items in the cart
router.post('/items', getCartItems);
router.post('/check-quantity', checkQuantity)
// Lock inventory and create a Stripe checkout session
router.post('/create-checkout-session', lockInventory, createCheckoutSession);


module.exports = router;
