const express = require('express');
const { forgotPassword } = require('../controllers/forgotPassword');
const { resetPassword } = require('../controllers/resetPassword');

const router = express.Router();

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
