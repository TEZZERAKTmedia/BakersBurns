const express = require('express');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const router = express.Router();

// Example protected admin route
router.get('/dashboard', adminAuthMiddleware('/admin'), (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard!' });
});

module.exports = router;
