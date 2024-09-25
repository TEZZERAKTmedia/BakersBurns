const express = require('express');
const router = express.Router();
const emailController = require('../../controllers/admin/adminEmailController');

// Route to send an email to a specific user
router.post('/send-to-user', emailController.sendEmailToUser);

// Route to send an email to all users
router.post('/send-to-all', emailController.sendEmailToAll);

// route to search for users to email
router.get('/search-users', emailController.searchUsers);



module.exports = router;
