const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Order = require('../models/order');
const User = require('../models/user');
const OrderItem = require('../models/orderItem');
const Product = require('../models/product');
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
        const thumbnailUrl = item.product?.thumbnail
          ? `${process.env.IMAGE_URL}/${item.product.thumbnail}`
          : `${process.env.IMAGE_URL}/placeholder.png`;

        return `
          <div style="position: relative; width: 60px; height: 60px; margin: 5px; display: inline-block;">
            <img src="${thumbnailUrl}" alt="${item.product?.name || 'Product'}"
              style="width: 100%; height: 100%; object-fit: cover; border: 1px solid #ddd; border-radius: 4px;">
              <span style="
              position: absolute;
              top: 0%;
              left: 0%;
              background-color: rgba(0, 0, 0, 0.8);
              color: white;
              font-size: 12px;
              padding: 3px 6px;
              border-radius: 4px;
              font-weight: bold;
              text-align: center;
              line-height: 1;
            ">
              ${item.quantity}
            </span>
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

    if (admins.length === 0) {
      console.warn('No admins found. Skipping email notifications.');
      return;
    }

    const ordersWithItems = await Order.findAll({
      where: { status: 'processing' },
      include: [
        {
          model: OrderItem,
          as: 'items',
          attributes: ['id', 'productId', 'quantity'],
        },
      ],
    });

    if (ordersWithItems.length === 0) {
      console.log('No stuck orders found.');
      return;
    }

    // Extract productIds from OrderItems
    const productIds = Array.from(
      new Set(
        ordersWithItems.flatMap((order) => order.items.map((item) => item.productId))
      )
    );

    // Fetch Product data
    const products = await Product.findAll({
      where: { id: productIds },
      attributes: ['id', 'thumbnail', 'name'],
    });

    // Create a product map for quick lookup
    const productMap = products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});

    // Enrich orders with product data
    const enrichedOrders = ordersWithItems.map((order) => ({
      ...order.toJSON(),
      items: order.items.map((item) => ({
        ...item.toJSON(),
        product: productMap[item.productId] || null,
      })),
    }));

    console.log('Enriched orders:', JSON.stringify(enrichedOrders, null, 2));

    for (const admin of admins) {
      const { email } = admin;
      const orderTable = generateOrderTable(enrichedOrders);

      await sendEmailNotification(
        email,
        'Pending Shipments Alert',
        `<p>You have ${enrichedOrders.length} orders still marked as "processing".</p>
         <p>Please review them and take necessary action.</p>
         ${orderTable}`
      );

      console.log(`Notification email sent to admin: ${email}`);
    }

    console.log('Order notification cron job execution complete.');
  } catch (error) {
    console.error('Error in order notification cron job:', error.message);
  }
};

// Schedule the cron job
cron.schedule('0 9 * * *', runCronJobLogic); // Runs daily at 9:00 AM

module.exports = runCronJobLogic;
