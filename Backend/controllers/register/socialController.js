const SocialLink = require('../../models/socialLinks'); // Import the Sequelize model

// Fetch all social links
const getSocialLinks = async (req, res) => {
  try {
    const socialLinks = await SocialLink.findAll(); // Use Sequelize's findAll method
    if (!socialLinks || socialLinks.length === 0) {
      return res.status(404).json({ message: 'No social links found' });
    }
    res.status(200).json(socialLinks); // Return the array of links
  } catch (error) {
    console.error('Error fetching social links:', error);
    res.status(500).json({ message: 'Failed to fetch social links', error });
  }
};

module.exports = { getSocialLinks };
