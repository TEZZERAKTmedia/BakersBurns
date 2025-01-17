// controllers/adminSocialLinksController.js
const SocialLink = require('../../models/socialLinks');

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

    // Validate input
    if (!platform || !url) {
      return res.status(400).json({ message: 'Platform and URL are required.' });
    }

    // Create the social link
    const newLink = await SocialLink.create({ platform, url });

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

    // Find the social link
    const socialLink = await SocialLink.findByPk(id);
    if (!socialLink) {
      return res.status(404).json({ message: 'Social link not found.' });
    }

    // Update the social link
    socialLink.platform = platform || socialLink.platform;
    socialLink.url = url || socialLink.url;
    await socialLink.save();

    res.status(200).json({ message: 'Social link updated successfully.', link: socialLink });
  } catch (error) {
    console.error('Error updating social link:', error);
    res.status(500).json({ message: 'Failed to update social link.', error });
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
  getSocialLinks
};
