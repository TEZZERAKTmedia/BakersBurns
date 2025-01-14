const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmailNotification = (userEmail, trackingNumber, status, orderDetails) => {
  const { shippingAddress, carrier, total, orderItems } = orderDetails; // Extract details from the order

  // Configure nodemailer transporter with Hostinger settings
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
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
          <p>Dear Customer,</p>
          <p>We have received your order and it's now being processed. You will receive an update once your order is shipped.</p>
          <h3>Order Details:</h3>
          <ul>
            ${orderItems.map(
              (item) =>
                `<li>${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}</li>`
            ).join('')}
          </ul>
          <p><strong>Total:</strong> $${total.toFixed(2)}</p>
          <h3>Shipping Details:</h3>
          <p><strong>Address:</strong> ${shippingAddress}</p>
          <p><strong>Carrier:</strong> ${carrier || 'N/A'}</p>
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
            <p>Dear Customer,</p>
            <p>Your order with tracking number <strong>${trackingNumber}</strong> has been shipped.</p>
            <a href="https://www.trackingwebsite.com/track?number=${trackingNumber}" style="font-size: 16px; color: #4CAF50;">Track Your Order</a>
            <h3>Order Details:</h3>
            <ul>
              ${orderItems.map(
                (item) =>
                  `<li>${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}</li>`
              ).join('')}
            </ul>
            <p><strong>Total:</strong> $${(Number(total) || 0).toFixed(2)}</p>
            <h3>Shipping Details:</h3>
            <p><strong>Address:</strong> ${shippingAddress}</p>
            <p><strong>Carrier:</strong> ${carrier}</p>
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
          <p>Dear Customer,</p>
          <p>Your order with tracking number <strong>${trackingNumber || 'N/A'}</strong> is now <strong>${status}</strong>.</p>
          <h3>Order Details:</h3>
          <ul>
            ${orderItems.map(
              (item) =>
                `<li>${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}</li>`
            ).join('')}
          </ul>
          <p><strong>Total:</strong> $${total.toFixed(2)}</p>
          <h3>Shipping Details:</h3>
          <p><strong>Address:</strong> ${shippingAddress}</p>
          <p><strong>Carrier:</strong> ${carrier || 'N/A'}</p>
          <footer style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #aaa;">&copy; 2024 BakerBurns. All rights reserved.</p>
          </footer>
        </div>
      `;
      break;
  }

  // Define the email content
  const mailOptions = {
    from: `BakerBurns <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: subject,
    html: htmlContent,
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
