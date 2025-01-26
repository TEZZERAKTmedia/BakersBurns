const Gallery = require('../../models/gallery');

// Get all gallery items
const getGalleryItems = async (req, res) => {
  try {
    console.log('Fetching all gallery items');
    const galleryItems = await Gallery.findAll();
    console.log('Gallery items fetched successfully');
    res.json(galleryItems);
  } catch (error) {
    console.error('Error fetching gallery items');
    res.status(500).json({ error: error.message });
  }
};

// Add a new gallery item
// Add a new gallery item
const addGalleryItem = async (req, res) => {
  const { title, description } = req.body;

  // Use the updated `req.files` from `.any()`
  const files = req.files || []; // Ensure `files` is always an array

  if (files.length === 0) {
    return res.status(400).json({ error: 'At least one media file is required' });
  }

  try {
    // Extract file names to store in the database
    const imageFilenames = files.map((file) => file.filename);

    // Save the data in the database
    const newGalleryItem = await Gallery.create({
      title,
      description,
      image: JSON.stringify(imageFilenames), // Store image filenames as JSON array string
    });

    console.log('Gallery item added:', newGalleryItem);
    res.status(201).json(newGalleryItem);
  } catch (error) {
    console.error('Error adding gallery item:', error);
    res.status(500).json({ error: error.message });
  }
};




// Update a gallery item
// Update gallery item
const updateGalleryItem = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const image = req.file ? req.file.filename : null;  // Check for new image

  try {
    console.log('Updating gallery item with id:', id);
    const galleryItem = await Gallery.findByPk(id);
    if (galleryItem) {
      console.log('Gallery item found:', galleryItem);
      galleryItem.title = title || galleryItem.title;
      galleryItem.description = description || galleryItem.description;
      if (image) galleryItem.image = image;  // Only update image if a new one is provided
      await galleryItem.save();
      console.log('Gallery item updated successfully', galleryItem);
      res.json(galleryItem);
    } else {
      console.warn('Gallery item not found with ID:', id);
      res.status(404).json({ error: 'Gallery item not found' });
    }
  } catch (error) {
    console.error('Error updating gallery item:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a gallery item
const deleteGalleryItem = async (req, res) => {
  const { id } = req.params;

  try {
    const galleryItem = await Gallery.findByPk(id);
    console.log('Deleting gallery item with ID:', id);
    if (galleryItem) {
      console.log('Gallery item found:', galleryItem);
      await galleryItem.destroy();
      console.log('Gallery item has been deleted:', galleryItem);
      res.json({ message: 'Gallery item deleted' });
    } else {
      console.warn('Gallery item not found with ID:', id);
      res.status(404).json({ error: 'Gallery item not found' });
    }
  } catch (error) {
    console.warn('Error deleting gallery item:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getGalleryItems, addGalleryItem, updateGalleryItem, deleteGalleryItem };
