// user/userBackEnd/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { requestChange, verifyChange, updateInfo, verifyEmail } = require('../controllers/infoChangeAuthController');

router.post('/request-change', requestChange);
router.get('/verify-change/:token', verifyChange);
router.post('/update-info', updateInfo);
router.get('/verify-email/:token', verifyEmail);
router.get('/dashboard', (req, res) => {
  res.send('User Dashboard');
});

module.exports = router;
