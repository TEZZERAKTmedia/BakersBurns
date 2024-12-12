const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmailNotification = (userEmail, trackingNumber, status) => {
  // Configure nodemailer transporter with Hostinger settings
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // SMTP host (e.g., smtp.hostinger.com)
    port: process.env.EMAIL_PORT, // SMTP port (e.g., 465 for SSL)
    secure: process.env.EMAIL_SECURE === 'true', // true for SSL
    auth: {
      user: process.env.EMAIL_USER, // Your Hostinger email address
      pass: process.env.EMAIL_PASS  // Your Hostinger email password
    }
  });

  // Customize email content based on order status
  let subject;
  let htmlContent;

  switch (status) {
    case 'Pending':
      subject = `Order Received: We're Processing Your Order!`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #4CAF50;">Order Status: Pending</h2>
          <p style="font-size: 16px;">Dear Customer,</p>
          <p style="font-size: 16px;">We have received your order and it's now being processed. You will receive an update once your order is shipped.</p>
          <footer style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #aaa;">&copy; 2024 BakerBurns. All rights reserved.</p>
          </footer>
        </div>
      `;
      break;

    case 'Shipped':
      subject = `Your Order ${trackingNumber} is on its Way!`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #4CAF50;">Order Status: Shipped</h2>
          <p style="font-size: 16px;">Dear Customer,</p>
          <p style="font-size: 16px;">Your order with tracking number <strong>${trackingNumber}</strong> has been shipped. You can track your package here:</p>
          <a href="https://www.trackingwebsite.com/track?number=${trackingNumber}" style="font-size: 16px; color: #4CAF50;">Track Your Order</a>
          <footer style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #aaa;">&copy; 2024 BakerBurns. All rights reserved.</p>
          </footer>
        </div>
      `;
      break;

    case 'Delivered':
      subject = `Order Delivered: Thank You for Shopping!`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #4CAF50;">Order Status: Delivered</h2>
          <p style="font-size: 16px;">Dear Customer,</p>
          <p style="font-size: 16px;">Your order with tracking number <strong>${trackingNumber}</strong> has been delivered. We hope you enjoy your purchase!</p>
          <footer style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #aaa;">&copy; 2024 BakerBurns. All rights reserved.</p>
          </footer>
        </div>
      `;
      break;

    case 'Cancelled':
      subject = `Order Cancelled: We're Sorry to See You Go`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #FF5722;">Order Status: Cancelled</h2>
          <p style="font-size: 16px;">Dear Customer,</p>
          <p style="font-size: 16px;">We regret to inform you that your order with tracking number <strong>${trackingNumber}</strong> has been cancelled. If you have any questions, please contact our support team.</p>
          <footer style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #aaa;">&copy; 2024 BakerBurns. All rights reserved.</p>
          </footer>
        </div>
      `;
      break;

    default:
      subject = `Order Update: ${status}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #4CAF50;">Order Status Update</h2>
          <p style="font-size: 16px;">Dear Customer,</p>
          <p style="font-size: 16px;">Your order with tracking number <strong>${trackingNumber}</strong> is now <strong>${status}</strong>.</p>
          <footer style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #aaa;">&copy; 2024 BakerBurns. All rights reserved.</p>
          </footer>
        </div>
      `;
      break;
  }

  // Define the email content
  const mailOptions = {
    from: `BakerBurns <${process.env.EMAIL_USER}>`, // Sender email
    to: userEmail, // Recipient email
    subject: subject, // Subject line
    html: htmlContent // Email body
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

module.exports = {
  sendEmailNotification
};
