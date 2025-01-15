const path = require('path');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const Order = require('../models/order');
const User = require('../models/user');
const OrderItem = require('../models/orderItem'); // Assuming you have an OrderItem model
const { Op } = require('sequelize');

// Public URL for serving images
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3450';

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

// Helper to send email
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
 
// Helper to generate order table in HTML with admin instructions
const generateOrderTable = (orders) => {
  const rows = orders.map((order) => {
    const orderItems = order.items
      .map((item) => {
        const thumbnailUrl = `${PUBLIC_URL}/uploads/${item.thumbnail || 'placeholder.png'}`;
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
        <td><a href="${PUBLIC_URL}/admin/orders/${order.id}" style="color: #1a73e8; text-decoration: none;">View Order</a></td>
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
    <div style="margin-top: 20px; padding: 15px; background-color: #fffbcc; border: 1px solid #ffe4a1; border-radius: 5px;">
      <h3>Instructions:</h3>
      <p>To resolve these orders:</p>
      <ol>
        <li>Click "View Order" for each pending shipment.</li>
        <li>Add a tracking number for the shipment.</li>
        <li>Update the order status to <strong>"Shipped"</strong>.</li>
      </ol>
      <p>Ensure timely processing to maintain customer satisfaction.</p>
    </div>
  `;
};

// Cron job logic
const runCronJobLogic = async () => {
  try {
    console.log('Starting notification cron job...');

    // Fetch all admin users
    const admins = await User.findAll({
      where: { role: 'admin' },
      attributes: ['email'],
    });

    const now = new Date();
    now.setHours(9, 0, 0, 0); // Hardcoding 9:00 AM as processing time

    for (const admin of admins) {
      const { email } = admin;

      // Find orders updated before 9:00 AM
      const stuckOrders = await Order.findAll({
        where: {
          status: 'processing',
          updatedAt: {
            [Op.lte]: now,
          },
        },
        include: [{ model: OrderItem, as: 'items' }],
      });

      if (stuckOrders.length > 0) {
        const orderTable = generateOrderTable(stuckOrders);
        await sendEmailNotification(
          email,
          'Pending Shipments Alert',
          `
            <p>You have ${stuckOrders.length} orders still marked as "processing".</p>
            <p>Please review them and take necessary action.</p>
            ${orderTable}
          `
        );
        console.log(`Notification email sent to ${email}`);
      }
    }

    console.log('Notification cron job completed.');
  } catch (error) {
    console.error('Error in notification cron job:', error.message);
  }
};

// Schedule the cron job to run at 9:00 AM Mountain Time daily
cron.schedule('0 9 * * *', async () => {
  console.log('Running scheduled notification cron job...');
  await runCronJobLogic();
});

module.exports = runCronJobLogic;
