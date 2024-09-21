const User = require('../../models/user');
const sequelize = require('../../config/database');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer'); // Nodemailer for sending emails

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can configure it for any other email service
  auth: {
    user: process.env.EMAIL_USER, // Your email address (environment variable)
    pass: process.env.EMAIL_PASS  // Your email password (environment variable)
  }
});

// Helper function to send email
const sendEmail = async (recipient, subject, messageBody) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,  // Your email address
    to: recipient,                 // Recipient email address
    subject: subject,              // Email subject
    text: messageBody              // Email content
  };

  return transporter.sendMail(mailOptions);
};

// Send an email to a specific user
exports.sendEmailToUser = async (req, res) => {
  const { userId, subject, messageBody } = req.body;

  try {
    // Find the user by their ID
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send email
    await sendEmail(user.email, subject, messageBody);

    res.status(200).json({ message: 'Email sent successfully to user' });
  } catch (error) {
    console.error('Error sending email to user:', error);
    res.status(500).json({ message: 'Failed to send email to user', error: error.message });
  }
};

// Send an email to all users
exports.sendEmailToAll = async (req, res) => {
  const { subject, messageBody } = req.body;

  try {
    // Find all users who have opted in for email notifications
    const users = await User.findAll({
      where: { isOptedInForEmail: true }
    });

    // Loop through users and send an email to each one
    const emailPromises = users.map(user => sendEmail(user.email, subject, messageBody));
    await Promise.all(emailPromises);

    res.status(200).json({ message: 'Email sent successfully to all opted-in users' });
  } catch (error) {
    console.error('Error sending email to all users:', error);
    res.status(500).json({ message: 'Failed to send email to all users', error: error.message });
  }
};

// Search for users by username or email
exports.searchUsers = async (req, res) => {
  const { searchTerm } = req.query;

  try {
    const users = await User.findAll({
      where: {
        [Op.or]: [
          sequelize.where(sequelize.fn('LOWER', sequelize.col('username')), 'LIKE', `%${searchTerm.toLowerCase()}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), 'LIKE', `%${searchTerm.toLowerCase()}%`)
        ]
      }
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error searching for users:', error);
    res.status(500).json({ message: 'Failed to search users', error: error.message });
  }
};
