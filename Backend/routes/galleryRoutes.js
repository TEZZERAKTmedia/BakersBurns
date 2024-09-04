const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { galleryUpload } = require('../config/multer'); // Import galleryUpload
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// Route to handle gallery image upload
router.post('/gallery', adminAuthMiddleware('admin'), galleryUpload.single('image'), (req, res) => {
  try {
    res.status(200).json({ message: 'Gallery image uploaded successfully', imagePath: `/gallery/${req.file.filename}` });
  } catch (error) {
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
});

// Route to fetch image filenames
router.get('/gallery', (req, res) => {
  const directoryPath = path.join(__dirname, '..', 'gallery');
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Unable to scan files', error: err });
    }
    res.json(files);
  });
});

module.exports = router;
