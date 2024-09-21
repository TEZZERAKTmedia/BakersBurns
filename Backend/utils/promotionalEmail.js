const nodemailer = require('nodemailer');

// Nodemailer setup (example)
const transporter = nodemailer.createTransport({
  service: 'gmail',  // or use your email service provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  };

  return transporter.sendMail(mailOptions);
};
