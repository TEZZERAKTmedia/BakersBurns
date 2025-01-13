const nodemailer = require('nodemailer');

// Configure the email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com', // Change this based on your SMTP provider
  port: process.env.SMTP_PORT || 587, // Default port for secure email
  secure: false, // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER, // SMTP username
    pass: process.env.SMTP_PASS, // SMTP password
  },
});

// Send email function
const sendEmailNotification = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Your App" <no-reply@yourapp.com>',
      to, // Recipient
      subject, // Subject line
      html, // HTML body
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
};

// Export the utility
module.exports = {
  sendEmailNotification,
};
