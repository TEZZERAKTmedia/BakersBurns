// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart } = require('../controllers/user/cartController');

router.get('/:userId/', getCart);
router.post('/', addToCart);
router.delete('/:userId/:productId', removeFromCart);

module.exports = router;
