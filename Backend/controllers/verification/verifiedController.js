const User = require('../../models/user');
const bcrypt = require('bcryptjs');

// Update user profile
const updateUserProfile = async (req, res) => {
  const { email, newEmail, phoneNumber } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (newEmail) user.email = newEmail;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    await user.save();
    res.status(200).json({ message: 'User profile updated successfully!' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Update user password
const updateUserPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password saved successfully!' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Error updating password', error: error.message });
  }
};

// Delete user account
const deleteUserAccount = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.status(200).json({ message: 'User account deleted successfully!' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ message: 'Error deleting user account', error: error.message });
  }
};

module.exports = {
  updateUserProfile,
  updateUserPassword,
  deleteUserAccount
};
