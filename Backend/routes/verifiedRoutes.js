const express = require('express');
const router = express.Router();
const verifiedController = require('../controllers/verification/accountCRUDController');

// Route to update user profile
router.post('/update-profile', verifiedController.updateUserProfile);

// Route to update user password
router.post('/update-password', verifiedController.updateUserPassword);

// Route to delete user account
router.post('/delete-account', verifiedController.deleteUserAccount);

module.exports = router;
