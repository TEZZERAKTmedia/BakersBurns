const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, updatePreferences } = require('../../controllers/admin/messagingController');
const { sendMessageInApp, getMessagesInApp, updatePreferencesInApp } = require('../../controllers/admin/inAppMessagingController');





//In app ADMIN messaging routes
router.post('/in-app/send',  sendMessageInApp);  // Endpoint for sending messages
router.get('/in-app/:userId', getMessagesInApp);  // Get messages for a specific user
router.put('/in-app/preferences/:userId', updatePreferencesInApp);  // Update messaging preferences
router.post('/send', sendMessage);
router.get('/:userId', getMessages);
router.put('/preferences/:userId', updatePreferences);
//In app USER messaging routes

module.exports = router;
