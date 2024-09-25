const express = require('express');
const router = express.Router();  // Import your authentication middleware
const userAuthMiddleware = require('../../middleware/userAuthMiddleware')
const {  getReceivedMessages, getSentMessages, markAllMessagesAsRead, sendMessageToPreviousSender} = require('../../controllers/user/inAppMessagingController');


// If either of these logs `undefined`, there’s an issue with how the controller exports the functions.
  // Fetch user messages without passing userId in the URL
router.put('/mark-all-read',userAuthMiddleware(),  markAllMessagesAsRead);  // Mark all messages as read
router.post('/send-message',userAuthMiddleware(),  sendMessageToPreviousSender);

router.get('/get-received-messages',userAuthMiddleware(), getReceivedMessages);

// Route to get sent messages
router.get('/get-sent-messages', userAuthMiddleware(), getSentMessages);


module.exports = router;
