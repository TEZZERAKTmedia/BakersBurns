const SocialLinks = require('../../models/socialLinks');

// Fetch social links
const getSocialLinks = async (req, res) => {
  try {
    const socialLinks = await SocialLinks.findOne(); // Assuming there's only one row
    if (!socialLinks) {
      return res.status(404).json({ message: 'Social links not found' });
    }
    res.status(200).json(socialLinks);
  } catch (error) {
    console.error('Error fetching social links:', error);
    res.status(500).json({ message: 'Failed to fetch social links', error });
  }
};

module.exports = { getSocialLinks };