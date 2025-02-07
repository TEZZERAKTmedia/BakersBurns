const SocialLink = require('../../models/socialLinks');
const path = require('path');

// Fetch all social links
const getSocialLinks = async (req, res) => {
  try {
    const socialLinks = await SocialLink.findAll();

    if (!socialLinks || socialLinks.length === 0) {
      return res.status(404).json({ message: 'No social links found.' });
    }

    res.status(200).json(socialLinks);
  } catch (error) {
    console.error('Error fetching social links:', error);
    res.status(500).json({ message: 'Failed to fetch social links.', error });
  }
};

// Add a new social link
const addSocialLink = async (req, res) => {
    try {
      const { platform, url } = req.body;
  
      console.log('Received data:', { platform, url });
      console.log('Files received:', req.files); // Log to verify files
  
      if (!platform || !url || !req.files?.image?.[0]) {
        return res.status(400).json({ message: 'Platform, URL, and image are required.' });
      }
  
      const image = req.files.image[0].filename; // Access the filename
      console.log('Image to save in database:', image);
  
      const newLink = await SocialLink.create({ platform, url, image });
      res.status(201).json({ message: 'Social link added successfully.', link: newLink });
    } catch (error) {
      console.error('Error adding social link:', error);
      res.status(500).json({ message: 'Failed to add social link.', error });
    }
  };
  
  
// Update an existing social link
const updateSocialLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, url } = req.body;

    console.log("Received data for update:", { id, platform, url });
    console.log("File received for update:", req.file); // ✅ Debugging: Check if file is received

    // Find the social link
    const socialLink = await SocialLink.findByPk(id);
    if (!socialLink) {
      return res.status(404).json({ message: "Social link not found." });
    }

    console.log("Existing social link found:", socialLink);

    // ✅ Update fields if provided
    if (platform) socialLink.platform = platform;
    if (url) socialLink.url = url;

    // ✅ Use new file if uploaded, otherwise keep existing image
    if (req.file) {
      socialLink.image = req.file.filename;
    }

    await socialLink.save();
    console.log("✅ Social link updated successfully:", socialLink);

    res.status(200).json({ message: "Social link updated successfully.", link: socialLink });
  } catch (error) {
    console.error("❌ Error updating social link:", error);
    res.status(500).json({ message: "Failed to update social link.", error });
  }
};



// Delete a social link
const deleteSocialLink = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the social link
    const socialLink = await SocialLink.findByPk(id);
    if (!socialLink) {
      return res.status(404).json({ message: 'Social link not found.' });
    }

    // Delete the social link
    await socialLink.destroy();

    res.status(200).json({ message: 'Social link deleted successfully.' });
  } catch (error) {
    console.error('Error deleting social link:', error);
    res.status(500).json({ message: 'Failed to delete social link.', error });
  }
};

module.exports = {
  addSocialLink,
  updateSocialLink,
  deleteSocialLink,
  getSocialLinks,
};
