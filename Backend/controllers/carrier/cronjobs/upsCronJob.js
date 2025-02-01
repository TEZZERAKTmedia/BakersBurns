require("dotenv").config();
const nodemailer = require("nodemailer");
const { fetchUpsTracking, getUpsAuthToken } = require("../upsApi");
const Order = require("../../../models/order");

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send email notification
const sendEmailNotification = async (subject, message) => {
  try {
    await transporter.sendMail({
      from: `"UPS Tracking Cron" <${process.env.EMAIL_USER}>`,
      to: process.env.ROOT_EMAIL, // Your email
      subject: subject,
      text: message,
    });

    console.log(`📧 UPS Email Sent: ${subject}`);
  } catch (error) {
    console.error("❌ Error sending UPS email:", error);
  }
};

/**
 * ✅ UPS Tracking Job
 */
async function checkShippedOrders() {
  console.log("🚀 Running UPS bulk tracking job...");

  const shippedOrders = await Order.findAll({ where: { status: "Shipped", carrier: "UPS" } });

  if (shippedOrders.length === 0) {
    console.log("✅ No UPS orders to track.");
    await sendEmailNotification("UPS Tracking Job - No Orders", "No shipped UPS orders found.");
    return;
  }

  const trackingNumbers = shippedOrders.map(order => order.trackingNumber);

  try {
    const accessToken = await getUpsAuthToken();
    const trackingData = await fetchUpsTracking(trackingNumbers, accessToken);

    let updatedOrders = [];
    for (const shipment of trackingData.trackResponse.shipment) {
      const trackingNumber = shipment.trackingNumber;
      const latestStatus = shipment.package?.[0]?.activity?.[0]?.status?.description || "Unknown";

      const order = shippedOrders.find(o => o.trackingNumber === trackingNumber);
      if (order) {
        order.status = latestStatus;
        await order.save();
        updatedOrders.push(`✅ Order ${order.id} - Updated to: ${latestStatus}`);
      }
    }

    await sendEmailNotification("✅ UPS Tracking Job Executed", updatedOrders.join("\n") || "No updates.");
  } catch (error) {
    console.error("🔴 UPS Tracking Job Error:", error.message);
    await sendEmailNotification("❌ UPS Tracking Job Failed", error.message);
  }
}

// Run UPS cron job every hour
setInterval(checkShippedOrders, 60 * 60 * 1000); // 1 hour

module.exports = { checkShippedOrders };
