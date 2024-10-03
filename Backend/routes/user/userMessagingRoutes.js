const express = require('express');
const router = express.Router();  // Import your authentication middleware
const userAuthMiddleware = require('../../middleware/userAuthMiddleware')
const {  getThreadId, sendInAppMessage, fetchMessagesByThreadId, getRolesByThreadId} = require('../../controllers/user/inAppMessagingController');




// If either of these logs `undefined`, there’s an issue with how the controller exports the functions.
  // Fetch user messages without passing userId in the URL
router.get('/get-thread', userAuthMiddleware(), getThreadId);



router.post('/send-message',userAuthMiddleware(),  sendInAppMessage);

router.get('/fetch-messages-by-thread', userAuthMiddleware(), fetchMessagesByThreadId);


router.get('/get-roles-by-thread/:threadId', userAuthMiddleware(), getRolesByThreadId);


// Route to get sent messages


module.exports = router;





