// discount-cron.js
require('dotenv').config();
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const Product = require('../../../models/product'); // Adjust path as needed
const User = require('../../../models/user');       // Assuming you have a User model

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true", // true for 465, false for others
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Helper to send an email.
 */
async function sendEmail(to, subject, text) {
  try {
    let info = await transporter.sendMail({
      from: `"Discount Notification" <${process.env.ADMIN_EMAIL}>`,
      to,
      subject,
      text,
    });
    console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

/**
 * Send promotional email to all users who are opted in (promo = 1).
 */
async function sendPromoEmails(subject, text) {
  try {
    const users = await User.findAll({
      where: { promo: 1 },
      attributes: ['email'],
    });
    const emails = users.map((u) => u.email).join(",");
    if (emails) {
      await sendEmail(emails, subject, text);
      console.log("Promotional emails sent to opted-in users.");
    } else {
      console.log("No users opted in for promotions.");
    }
  } catch (error) {
    console.error("Error sending promo emails:", error);
  }
}

/**
 * Starts the cron job that runs every hour to update discount statuses and send notifications.
 */
function startDiscountCron() {
  cron.schedule('0 * * * *', async () => {
    console.log("Running discount cron job...");
    const now = new Date();
    // Find products with discount details set
    const products = await Product.findAll({
      where: {
        discountStartDate: { [Op.ne]: null },
        discountEndDate: { [Op.ne]: null },
      },
    });

    for (const product of products) {
      const start = new Date(product.discountStartDate);
      const end = new Date(product.discountEndDate);
      let updated = false;

      // Check if the discount should be active now.
      if (now >= start && now <= end) {
        if (!product.isDiscounted) {
          product.isDiscounted = true;
          updated = true;
        }
      } else {
        if (product.isDiscounted) {
          // Discount was active but now should not be.
          product.isDiscounted = false;
          updated = true;
          // Notify admin that the discount ended.
          await sendEmail(
            process.env.ADMIN_EMAIL,
            `Discount Ended for Product: ${product.name}`,
            `The discount for product "${product.name}" (ID: ${product.id}) ended on ${end.toISOString()}.`
          );
        }
      }

      // If a discount is scheduled to start within the next 24 hours and is not active yet,
      // notify admin that the discount will be active soon.
      if (!product.isDiscounted && start > now && (start - now) <= 24 * 60 * 60 * 1000) {
        await sendEmail(
          process.env.ADMIN_EMAIL,
          `Upcoming Discount for Product: ${product.name}`,
          `The discount for product "${product.name}" (ID: ${product.id}) will start on ${start.toISOString()}.`
        );
      }

      if (updated) {
        await product.save();
        console.log(`Updated product ${product.id}: isDiscounted = ${product.isDiscounted}`);
      }
    }
  });
}

module.exports = { startDiscountCron, sendPromoEmails, sendEmail };
