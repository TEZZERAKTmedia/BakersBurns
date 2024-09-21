const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, updatePreferences } = require('../controllers/admin/messagingController');

// Routes for messaging
router.post('/send', sendMessage);
router.get('/:userId', getMessages);
router.put('/preferences/:userId', updatePreferences);

module.exports = router;
