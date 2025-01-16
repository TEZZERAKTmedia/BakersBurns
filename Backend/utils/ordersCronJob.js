const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Order = require('../models/order');
const User = require('../models/user');
const OrderItem = require('../models/orderItem');
const { Op } = require('sequelize');

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
  debug: true,
});

// Helper function to send email
const sendEmailNotification = async (to, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: `BakersBurns <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
};

// Helper function to generate HTML for email
const generateOrderTable = (orders) => {
  const rows = orders.map((order) => {
    const orderItems = order.items
      .map((item) => {
        const thumbnailUrl = `${process.env.IMAGE_URL}/${item.thumbnail || 'placeholder.png'}`;
        return `
          <div style="position: relative; display: inline-block; margin: 5px;">
            <img src="${thumbnailUrl}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border: 1px solid #ddd; border-radius: 4px;">
            <span style="
              position: absolute;
              top: 0;
              left: 0;
              background-color: rgba(0, 0, 0, 0.7);
              color: white;
              font-size: 10px;
              padding: 2px 5px;
              border-radius: 3px;
              font-weight: bold;
            ">${item.quantity}</span>
          </div>
        `;
      })
      .join('');
    return `
      <tr>
        <td>${order.id}</td>
        <td>${order.status}</td>
        <td>${new Date(order.updatedAt).toLocaleString()}</td>
        <td>
          <div style="display: flex; flex-wrap: wrap;">
            ${orderItems}
          </div>
        </td>
        <td><a href="${process.env.ADMIN_FRONTEND}/orders/${order.id}" style="color: #1a73e8; text-decoration: none;">View Order</a></td>
      </tr>
    `;
  });

  return `
    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 14px;">
      <thead>
        <tr style="background-color: #f2f2f2; text-align: left;">
          <th>Order ID</th>
          <th>Status</th>
          <th>Last Updated</th>
          <th>Order Items</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        ${rows.join('')}
      </tbody>
    </table>
  `;
};

const runCronJobLogic = async () => {
  try {
    console.log('Executing order notification cron job...');
    const admins = await User.findAll({ where: { role: 'admin' }, attributes: ['email'] });
    const now = new Date();
    now.setHours(9, 0, 0, 0); // Set to 9:00 AM

    for (const admin of admins) {
      const { email } = admin;
      const stuckOrders = await Order.findAll({
        where: { status: 'processing', updatedAt: { [Op.lte]: now } },
        include: [{ model: OrderItem, as: 'items' }],
      });

      if (stuckOrders.length > 0) {
        const orderTable = generateOrderTable(stuckOrders);
        await sendEmailNotification(
          email,
          'Pending Shipments Alert',
          `<p>You have ${stuckOrders.length} orders still marked as "processing".</p>
           <p>Please review them and take necessary action.</p>
           ${orderTable}`
        );
        console.log(`Notification email sent to ${email}`);
      }
    }
    console.log('Order notification cron job execution complete.');
  } catch (error) {
    console.error('Error in order notification cron job:', error.message);
  }
};

// Schedule the cron job
cron.schedule('0 9 * * *', runCronJobLogic);

module.exports = runCronJobLogic;
