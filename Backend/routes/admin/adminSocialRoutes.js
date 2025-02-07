const express = require('express');
const {
  addSocialLink,
  updateSocialLink,
  deleteSocialLink,
  getSocialLinks,
} = require('../../controllers/admin/adminSocialLinks');
const { socialIconUploadMiddleware } = require('../../config/multer');
const adminAuthMiddleware = require('../../middleware/adminAuthMiddleware');

const router = express.Router();

// Middleware to log incoming requests
const logRouteMiddleware = (req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Files:', req.files || req.file);
  next();
};

// Fetch all social links
router.get(
  '/social-links',
  logRouteMiddleware,
  adminAuthMiddleware('admin'),
  (req, res, next) => {
    console.log('Fetching social links...');
    next();
  },
  getSocialLinks
);

// Add a new social link with image
router.post(
  '/social-links',
  logRouteMiddleware,
  adminAuthMiddleware('admin'),
  (req, res, next) => {
    console.log('Adding a new social link...');
    next();
  },
  socialIconUploadMiddleware, // Process the image upload
  (req, res, next) => {
    console.log('After image upload middleware...');
    console.log('File received:', req.file);
    next();
  },
  addSocialLink
);

// Update an existing social link with image
router.put(
  "/social-links/:id",
  logRouteMiddleware,
  adminAuthMiddleware("admin"),
  (req, res, next) => {
    console.log(`Updating social link with ID: ${req.params.id}`);
    next();
  },
  socialIconUploadMiddleware, // ✅ Now using `.single("image")` correctly
  (req, res, next) => {
    console.log("After image upload middleware for update...");
    console.log("File received:", req.file); // ✅ Should now log a file, if present
    next();
  },
  updateSocialLink
);


// Delete a social link
router.delete(
  '/social-links/:id',
  logRouteMiddleware,
  adminAuthMiddleware('admin'),
  (req, res, next) => {
    console.log(`Deleting social link with ID: ${req.params.id}`);
    next();
  },
  deleteSocialLink
);

module.exports = router;
