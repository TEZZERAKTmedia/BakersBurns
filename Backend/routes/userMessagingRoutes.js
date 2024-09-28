const express = require('express');
const router = express.Router();
const {
  getReceivedMessages,
  getSentMessages,
  markAllMessagesAsRead,
  sendMessageToAdmin,
  sendMessageToPreviousSender,
} = require('../../controllers/admin/inAppMessagingController');

// Middleware for authentication (assumes you already have an adminAuthMiddleware or userAuthMiddleware)
const adminAuthMiddleware = require('../../middleware/adminAuthMiddleware'); 
const userAuthMiddleware = require('../../middleware/userAuthMiddleware');

// Routes for handling messaging

// Get all received messages for the logged-in user
router.get('/received', userAuthMiddleware, getReceivedMessages);

// Get all sent messages for the logged-in user
router.get('/sent', userAuthMiddleware, getSentMessages);

// Mark all unread messages as read
router.put('/mark-all-read', userAuthMiddleware, markAllMessagesAsRead);

// Send a new message to the admin with spam prevention
router.post('/send-to-admin', userAuthMiddleware, sendMessageToAdmin);

// Send a message to the previous sender
router.post('/send-to-previous', userAuthMiddleware, sendMessageToPreviousSender);

module.exports = router;
