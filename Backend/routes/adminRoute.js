const express = require('express');

const router = express.Router();

// Example protected admin route
router.get('/dashboard',  (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard!' });
});

module.exports = router;
