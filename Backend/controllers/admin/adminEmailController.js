const User = require('../../models/user');
const sequelize = require('../../config/database');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer'); // Nodemailer for sending emails
require('dotenv').config();

// Create a reusable transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // SMTP server (e.g., smtp.hostinger.com)
  port: process.env.EMAIL_PORT, // Port (e.g., 465 for SSL, 587 for TLS)
  secure: process.env.EMAIL_SECURE === 'true', // true for SSL, false for TLS
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password
  },
  logger: true, // Enable logging
  debug: true,  // Enable debugging
});

// Function to send a custom email
const sendCustomEmail = async (req, res) => {
  const { recipientIds, subject, messageBody } = req.body;

  try {
    // Fetch all users by their IDs
    const users = await User.findAll({
      where: {
        id: recipientIds,
      },
      attributes: ['username', 'email', 'isOptedInForEmailUpdates'],
    });

    // Check if any user is not opted in for email updates
    const notOptedInUsers = users.filter((user) => !user.isOptedInForEmailUpdates);

    if (notOptedInUsers.length > 0) {
      const notOptedInUsernames = notOptedInUsers.map((user) => user.username);
      return res.status(400).json({
        message: `${notOptedInUsernames.join(', ')} is/are not opted in for messaging.`,
      });
    }

    // Gather recipient emails
    const recipientEmails = users.map((user) => user.email);

    // Send the email
    await transporter.sendMail({
      from: `Bakers Burns <${process.env.EMAIL_USER}>`,
      to: recipientEmails.join(','),
      subject: subject || 'Custom Subject',
      text: messageBody,
    });

    res.status(200).json({ message: 'Custom email sent successfully!' });
  } catch (error) {
    console.error('Error sending custom email:', error);
    res.status(500).json({ message: 'Failed to send custom email', error: error.message });
  }
};

// Function to send promotional email
const sendPromotionalEmail = async (req, res) => {
  const { subject, messageBody } = req.body;

  try {
    // Fetch all users opted in for promotions
    const users = await User.findAll({
      where: {
        isOptedInForPromotions: true, // Only users opted in for promotional emails
      },
      attributes: ['email'], // Only select email field
    });

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users opted in for promotional emails.' });
    }

    // Extract recipient emails
    const recipientEmails = users.map((user) => user.email);

    // Send the email
    await transporter.sendMail({
      from: `Bakers Burns <${process.env.EMAIL_USER}>`,
      to: recipientEmails.join(','),
      subject: subject || 'Latest Promotions',
      text: messageBody,
    });

    res.status(200).json({ message: 'Promotional email sent successfully!' });
  } catch (error) {
    console.error('Error sending promotional email:', error);
    res.status(500).json({ message: 'Failed to send promotional email', error: error.message });
  }
};

// Function to send order update email
const sendOrderUpdateEmail = async (req, res) => {
  const { recipientIds, subject, messageBody } = req.body;

  try {
    const users = await User.findAll({
      where: {
        id: recipientIds,
        isOptedInForEmailUpdates: true, // Only users opted in for email updates
      },
      attributes: ['email'],
    });

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found or opted in for email updates' });
    }

    const recipientEmails = users.map((user) => user.email);

    // Send the email
    await transporter.sendMail({
      from: `Bakers Burns <${process.env.EMAIL_USER}>`,
      to: recipientEmails.join(','),
      subject: subject || 'Important Order Update',
      text: messageBody,
    });

    res.status(200).json({ message: 'Order update email sent successfully!' });
  } catch (error) {
    console.error('Error sending order update email:', error);
    res.status(500).json({ message: 'Failed to send order update email' });
  }
};

// Function to send newsletter email
const sendNewsletterEmail = async (req, res) => {
  const { subject, messageBody } = req.body;

  try {
    const users = await User.findAll({
      where: {
        isOptedInForPromotions: true, // Assuming newsletters fall under promotions opt-in
      },
      attributes: ['email'],
    });

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users opted in for newsletters.' });
    }

    const recipientEmails = users.map((user) => user.email);

    // Send the email
    await transporter.sendMail({
      from: `Bakers Burns <${process.env.EMAIL_USER}>`,
      to: recipientEmails.join(','),
      subject: subject || 'Our Latest Newsletter',
      text: messageBody,
    });

    res.status(200).json({ message: 'Newsletter email sent successfully!' });
  } catch (error) {
    console.error('Error sending newsletter email:', error);
    res.status(500).json({ message: 'Failed to send newsletter email' });
  }
};

// Search for users by username or email
const searchUsers = async (req, res) => {
  const { searchTerm } = req.query;

  try {
    const users = await User.findAll({
      where: {
        [Op.or]: [
          sequelize.where(sequelize.fn('LOWER', sequelize.col('username')), 'LIKE', `%${searchTerm.toLowerCase()}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), 'LIKE', `%${searchTerm.toLowerCase()}%`),
        ],
      },
      attributes: ['id', 'username', 'email', 'isOptedInForEmailUpdates'],
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error searching for users:', error);
    res.status(500).json({ message: 'Failed to search users', error: error.message });
  }
};

module.exports = {
  sendCustomEmail,
  sendPromotionalEmail,
  sendOrderUpdateEmail,
  sendNewsletterEmail,
  searchUsers,
};
