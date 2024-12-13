const jwt = require('jsonwebtoken');
const User = require('../../models/user');
const { sendVerificationEmail } = require('../../utils/buildEmail');

exports.requestChange = async (req, res) => {
  const { userId } = req.user;
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '5m' });

  const verificationLink = `http://localhost:4002/verify-change/${token}`;

  const user = await User.findById(userId);

  sendVerificationEmail(user.email, verificationLink);
  res.send('Verification email sent.');
};

exports.verifyChange = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    res.send({ message: 'You can now change your account information.', user });
  } catch (err) {
    res.status(400).send('Verification link expired or invalid.');
  }
};

exports.getPreferences = async (req, res) => {
  try {
    const { email } = req.user; // Extract email from req.user added by the middleware

    if (!email) {
      return res.status(400).json({ message: 'Email is missing from request.' });
    }

    const user = await User.findOne({
      where: { email },
      attributes: ['isOptedInForPromotions', 'isOptedInForEmailUpdates'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return res.status(500).json({ message: 'Error fetching preferences.' });
  }
};


exports.updateInfo = async (req, res) => {
  const { userId } = req.user;
  const { newUsername, newPassword, newEmail } = req.body;

  const user = await User.findById(userId);

  if (newEmail) {
    const emailToken = jwt.sign({ userId, newEmail }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const emailVerificationLink = `http://localhost:4002/verify-email/${emailToken}`;

    sendVerificationEmail(newEmail, emailVerificationLink);
    res.send('Please verify your new email.');
  } else {
    if (newUsername) user.username = newUsername;
    if (newPassword) user.password = newPassword; // Hash password before saving

    await user.save();
    res.send('Account information updated.');
  }
};

exports.verifyEmail = async (req, res) => {
    try {
      const { token } = req.params;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { userId, newEmail } = decoded;
  
      const user = await User.findById(userId);
      user.email = newEmail;
      await user.save();
  
      // Create a token for password reset
      const passwordResetToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '5m' });
      const passwordResetLink = `http://localhost:4002/reset-password/${passwordResetToken}`;
  
      res.send({ message: 'Email verified and updated. Please reset your password.', passwordResetLink });
    } catch (err) {
      res.status(400).send('Verification link expired or invalid.');
    }
  };
  
