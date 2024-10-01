const express = require('express');
const router = express.Router();  // Import your authentication middleware
const userAuthMiddleware = require('../../middleware/userAuthMiddleware')
const {  getThreadId, createThreadId, sendInAppMessage, fetchMessagesByThreadId, getRolesByThreadId, funtion} = require('../../controllers/user/inAppMessagingController');




// If either of these logs `undefined`, there’s an issue with how the controller exports the functions.
  // Fetch user messages without passing userId in the URL
router.get('/get-thread', userAuthMiddleware(), getThreadId);

router.post('/new-thread', userAuthMiddleware(), createThreadId)

router.post('/send-message',userAuthMiddleware(),  sendInAppMessage);

router.get('/fetch-messages-by-thread', userAuthMiddleware(), fetchMessagesByThreadId);


router.get('/get-roles-by-thread/:threadId', userAuthMiddleware(), getRolesByThreadId);


// Route to get sent messages


module.exports = router;




function clearAllCookies() {
  const cookies = document.cookie.split(";");

  cookies.forEach((cookie) => {
    const cookieName = cookie.split("=")[0].trim();
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
}
