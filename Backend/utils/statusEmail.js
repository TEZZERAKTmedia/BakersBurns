const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmailNotification = (userEmail, trackingNumber, status) => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: userEmail,
    subject: `Your Order ${trackingNumber} is ${status}`,
    text: `Dear Customer, your order with tracking number ${trackingNumber} is now ${status}.`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

module.exports = {
 sendEmailNotification
}
