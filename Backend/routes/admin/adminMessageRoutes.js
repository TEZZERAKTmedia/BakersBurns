const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../../middleware/adminAuthMiddleware');
const { 
  sendMessage,       // In-app and email messaging
  getMessages        // In-app and email messaging
} = require('../../controllers/admin/messagingController');
const inAppMessagingController = require('../../controllers/admin/inAppMessagingController');

//GET
router.get('/search', inAppMessagingController.searchInAppUsers);
router.get('/fetch-all-threads', adminAuthMiddleware(), inAppMessagingController.fetchAllThreadIds);
router.get('/fetch-messages-by-thread', adminAuthMiddleware(), inAppMessagingController.fetchMessagesByThreadId);


router.get('/get-roles-thread/:threadId', adminAuthMiddleware(), inAppMessagingController.getRolesByThreadId);
router.get('/get-usernames-by-thread/:threadId', adminAuthMiddleware(), inAppMessagingController.getUsernamesByThreadId);
router.get('/check-thread', adminAuthMiddleware(), inAppMessagingController.checkThread);
//POST
router.post('/messages/send', adminAuthMiddleware(), inAppMessagingController.sendInAppMessage);
//DELETE
router.delete('/delete-thread/:threadId',adminAuthMiddleware(), inAppMessagingController.deleteThreadId);


// EMAIL 

// Route to send an email message to a user
router.post('/email/send', adminAuthMiddleware(), sendMessage);
// Route to get email messages for a specific user
router.get('/email/messages', adminAuthMiddleware(), getMessages);

module.exports = router;
