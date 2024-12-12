const { User, Order, Message, } = require('../../models');
const Cart = require('../../models/cart');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

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
  try {
    const userId = req.user.id; // Assuming user ID is available in req.user.id
    const usernameToDelete = req.user.username; // Assuming username is available in req.user.username
    
    await Promise.all([
      Message.destroy({ 
        where: {
          [Op.or]: [
            { senderUsername: usernameToDelete },
            { receiverUsername: usernameToDelete }
          ]
        }
      }),
      Cart.destroy({ where: { userId } }),
      User.destroy({ where: { id: userId } })
      // Add other deletions here if necessary
    ]);

    res.status(200).json({ message: 'User account has been successfully deleted' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ message: 'An error occurred while deleting the account.' });
  }
};



module.exports = {
  updateUserProfile,
  updateUserPassword,
  deleteUserAccount
};
