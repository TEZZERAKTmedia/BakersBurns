const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // Hostinger's SMTP server (e.g., smtp.hostinger.com)
  port: process.env.EMAIL_PORT, // Port (e.g., 465 for SSL, 587 for TLS)
  secure: process.env.EMAIL_SECURE === 'true', // true for SSL, false for TLS
  auth: {
    user: process.env.EMAIL_USER, // Your Hostinger email address
    pass: process.env.EMAIL_PASS  // Your Hostinger email password
  },
  logger: true, // Log SMTP communication
  debug: true,  // Enable debugging
});

const sendOrderEmail = async (type, email, data = {}) => {
  try {
    let subject = '';
    let html = '';

    switch (type) {
      case 'newGuest':
        subject = 'Welcome to Our Store!';
        html = `
          <h1>Thank You for Your Order!</h1>
          <p>Your order has been placed successfully.</p>
          <p>Complete your account setup by setting a password:</p>
          <a href="${process.env.PASSWORD_SETUP_URL}" style="background: #4caf50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Set Password</a>
          <p>Order Summary:</p>
          <ul>
            ${data.orderItems.map(item => `<li>${item.name} - ${item.quantity} x $${item.price}</li>`).join('')}
          </ul>
          <p>Total: $${data.total}</p>
        `;
        break;

      case 'existingUser':
        subject = 'Order Confirmation';
        html = `
          <h1>Thank You for Your Purchase!</h1>
          <p>Your order has been placed successfully. You can view your order details anytime:</p>
          <a href="${data.orderUrl}" style="background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">View Order</a>
          <p>Order Summary:</p>
          <ul>
            ${data.orderItems.map(item => `<li>${item.name} - ${item.quantity} x $${item.price}</li>`).join('')}
          </ul>
          <p>Total: $${data.total}</p>
        `;
        break;

      case 'adminNotification':
        subject = 'New Order Notification';
        html = `
          <h1>New Order Received</h1>
          <p>User: ${email}</p>
          <p>Order Summary:</p>
          <ul>
            ${data.orderItems.map(item => `<li>${item.name} - ${item.quantity} x $${item.price}</li>`).join('')}
          </ul>
          <p>Total: $${data.total}</p>
          <p>Status: ${data.status}</p>
        `;
        break;

      default:
        throw new Error('Unknown email type');
    }

    const mailOptions = {
      from: `"Store Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}:`, info.response);

  } catch (error) {
    console.error(`Error sending ${type} email to ${email}:`, error.message);
  }
};

module.exports = {sendOrderEmail};
