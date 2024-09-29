const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../../middleware/adminAuthMiddleware');
const { 
  sendMessage,       // In-app and email messaging
  getMessages        // In-app and email messaging
} = require('../../controllers/admin/messagingController');
const { 
    searchInAppUsers,  // Search users by username/email
    sendInAppMessage,       // In-app and email messaging 
    getOrCreateThreadId,       // In-app and email messaging
    fetchAllThreadIds,
    fetchMessagesByThreadId,
    getRolesByThreadId,
    getUsernamesByThreadId,
    checkThread,

  } = require('../../controllers/admin/inAppMessagingController');

// In-app messaging routes

// Route to search for users in-app by username or email
router.get('/search', searchInAppUsers);

// Route to send a message to a user in-app
router.post('/messages/send', adminAuthMiddleware(), sendInAppMessage);

// Route to get all messages for the logged-in user (admin or user)
router.get('/fetch-all-threads', adminAuthMiddleware(), fetchAllThreadIds);


router.get('/fetch-messages-by-thread',adminAuthMiddleware(), fetchMessagesByThreadId);

router.get('/threads', adminAuthMiddleware(), getOrCreateThreadId);

router.get('/get-roles-thread/:threadId', adminAuthMiddleware(), getRolesByThreadId);

// Define a route to get usernames by thread ID
router.get('/get-usernames-by-thread/:threadId', adminAuthMiddleware(), getUsernamesByThreadId);

router.get('/check-thread', adminAuthMiddleware(), checkThread);

// Email messaging routes

// Route to send an email message to a user
router.post('/email/send', adminAuthMiddleware(), sendMessage);

// Route to get email messages for a specific user
router.get('/email/messages', adminAuthMiddleware(), getMessages);

module.exports = router;
