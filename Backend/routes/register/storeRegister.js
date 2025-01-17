// routes/registerStoreRouter.js

const express = require('express');
const { getProducts, addToCart, getProductMedia, getProductTypes } = require('../../controllers/register/registerStoreController');
const { getFeaturedProducts }= require('../../controllers/user/storeController');
const router = express.Router();

// Route to get all available products (public, no auth required)
router.get('/products', getProducts);

// Route to add an item to the cart (no auth required, uses guest session or temp ID)
router.post('/add-to-cart', addToCart);

router.get('/get-featured-products', getFeaturedProducts);

router.get('/products/:productId/media', getProductMedia);
router.get('/product-types', getProductTypes);


module.exports = router;
