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
    deleteThreadId

  } = require('../../controllers/admin/inAppMessagingController');

//GET
router.get('/search', searchInAppUsers);
router.get('/fetch-all-threads', adminAuthMiddleware(), fetchAllThreadIds);
router.get('/fetch-messages-by-thread',adminAuthMiddleware(), fetchMessagesByThreadId);
router.get('/threads', adminAuthMiddleware(), getOrCreateThreadId);
router.get('/get-roles-thread/:threadId', adminAuthMiddleware(), getRolesByThreadId);
router.get('/get-usernames-by-thread/:threadId', adminAuthMiddleware(), getUsernamesByThreadId);
router.get('/check-thread', adminAuthMiddleware(), checkThread);
//POST
router.post('/messages/send', adminAuthMiddleware(), sendInAppMessage);
//DELETE
router.delete('/delete-thread/:threadId',adminAuthMiddleware(), deleteThreadId);


// EMAIL 

// Route to send an email message to a user
router.post('/email/send', adminAuthMiddleware(), sendMessage);
// Route to get email messages for a specific user
router.get('/email/messages', adminAuthMiddleware(), getMessages);

module.exports = router;
