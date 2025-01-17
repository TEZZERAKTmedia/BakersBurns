// routes/adminSocialLinksRoutes.js
const express = require('express');
const {
  addSocialLink,
  updateSocialLink,
  deleteSocialLink,
  getSocialLinks
} = require('../../controllers/admin/adminSocialLinks');
const adminAuthMiddleware = require('../../middleware/adminAuthMiddleware');

const router = express.Router();
router.get('/social-links', getSocialLinks);



// Route to add a social link
router.post('/social-links', addSocialLink);

// Route to update a social link
router.put('/social-links/:id', updateSocialLink);

// Route to delete a social link
router.delete('/social-links/:id',  deleteSocialLink);

module.exports = router;
