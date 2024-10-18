const User = require('../../models/user');
const sequelize = require('../../config/database');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer'); // Nodemailer for sending emails
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send a custom email
const sendCustomEmail = async (req, res) => {
  const { recipientIds, subject, messageBody } = req.body;

  try {
    // Fetch all users by their IDs
    const users = await User.findAll({
      where: {
        id: recipientIds
      },
      attributes: ['username', 'email', 'isOptedInForEmailUpdates'],
    });

    // Check if any user is not opted in for email updates
    const notOptedInUsers = users.filter(user => !user.isOptedInForEmailUpdates);

    if (notOptedInUsers.length > 0) {
      const notOptedInUsernames = notOptedInUsers.map(user => user.username);
      return res.status(400).json({
        message: `${notOptedInUsernames.join(', ')} is/are not opted in for messaging.`,
      });
    }

    // Gather recipient emails
    const recipientEmails = users.map(user => user.email);

    // Send the email using NodeMailer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipientEmails,  // Send to all selected recipients
      subject: subject || 'Custom Subject',
      text: messageBody,
    });

    // Send success response
    res.status(200).json({ message: 'Custom email sent successfully!' });

  } catch (error) {
    console.error('Error sending custom email:', error);
    res.status(500).json({ message: 'Failed to send custom email', error: error.message });
  }
};


// Function to send promotional email
const sendPromotionalEmail = async (req, res) => {
  const { recipientIds, subject, messageBody } = req.body;

  try {
    // Find all the users by their IDs
    const users = await User.findAll({
      where: {
        id: recipientIds,
        isOptedInForPromotions: true,  // Check opt-in for promotional emails
      },
      attributes: ['email'],
    });

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found or opted in for promotions' });
    }

    const recipientEmails = users.map(user => user.email);

    // Send the email using NodeMailer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipientEmails,
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
        isOptedInForEmailUpdates: true,  // Only users opted in for email updates
      },
      attributes: ['email'],
    });

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found or opted in for email updates' });
    }

    const recipientEmails = users.map((user) => user.email);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipientEmails,
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
  const { recipientIds, subject, messageBody } = req.body;

  try {
    const users = await User.findAll({
      where: {
        id: recipientIds,
        isOptedInForPromotions: true,  // Assuming newsletters fall under promotions opt-in
      },
      attributes: ['email'],
    });

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found or opted in for newsletters' });
    }

    const recipientEmails = users.map((user) => user.email);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipientEmails,
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
          sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), 'LIKE', `%${searchTerm.toLowerCase()}%`)
        ]
      },
      attributes: ['id', 'username', 'email', 'isOptedInForEmailUpdates']
    });
    

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error searching for users:', error);
    res.status(500).json({ message: 'Failed to search users', error: error.message });
  }
};

// Export all functions
module.exports = {
  sendCustomEmail,
  sendPromotionalEmail,
  sendOrderUpdateEmail,
  sendNewsletterEmail,
  searchUsers
};
