// user/userBackEnd/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { requestChange, verifyChange, updateInfo, verifyEmail, getPreferences } = require('../../controllers/verification/infoChangeAuthController');
const userAuthMiddleware = require('../../middleware/userAuthMiddleware');

router.post('/request-change', requestChange);
router.get('/preferences', userAuthMiddleware, getPreferences);
router.get('/verify-change/:token', verifyChange);
router.post('/update-info', updateInfo);
router.get('/verify-email/:token', verifyEmail);
router.get('/dashboard', (req, res) => {
  res.send('User Dashboard');
});
router.get('/verify-session', (req, res) => {
  if (req.user) {
    return res.status(200).json({ message: 'User authenticated', user: req.user });
  }
  return res.status(401).json({ message: 'Unauthorized' });
});


module.exports = router;
