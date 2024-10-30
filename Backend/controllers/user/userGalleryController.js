// userGalleryController.js
const Gallery = require('../../models/gallery'); // Ensure the path is correct

// Controller function to get gallery items
const getUserGallery = async (req, res) => {
  try {
    const galleryItems = await Gallery.findAll({
      attributes: ['id', 'title', 'image', 'description'] // Use 'image' instead of 'imageUrl'
    });

    res.status(200).json(galleryItems);
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    res.status(500).json({ message: 'Error fetching gallery items' });
  }
};

module.exports = {
  getUserGallery,
};
