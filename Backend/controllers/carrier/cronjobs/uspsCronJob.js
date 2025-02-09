const { fetchUspsTracking, getUspsAuthToken } = require("../uspsApi");
const Order = require("../../../models/order");
const nodemailer = require("nodemailer");
const { archiveCompletedOrder } = require("../util/invoiceArchiver");

/**
 * ✅ Periodically check USPS tracking updates for shipped orders.
 */
async function checkShippedOrdersUsps() {
  console.log("🚀 Checking USPS bulk tracking updates...");

  const shippedOrders = await Order.findAll({
    where: { status: "Shipped", carrier: "USPS" },
  });

  if (shippedOrders.length === 0) {
    console.log("✅ No USPS orders to track.");
    return;
  }

  const trackingNumbers = shippedOrders.map((order) => order.trackingNumber);

  try {
    const accessToken = await getUspsAuthToken();
    const trackingData = await fetchUspsTracking(trackingNumbers, accessToken);

    // Process each shipment in the API response
    for (const shipment of trackingData.trackResponse.shipment) {
      const trackingNumber = shipment.inquiryNumber;
      const latestStatus =
        shipment.package?.[0]?.activity?.[0]?.status?.description || "Unknown";

      const order = shippedOrders.find((o) => o.trackingNumber === trackingNumber);
      if (order) {
        order.status = latestStatus;
        await order.save();
        console.log(`✅ Order ${order.id} - Status Updated: ${latestStatus}`);

        // Archive the order if delivered.
        if (latestStatus.toLowerCase() === "delivered") {
          console.log(`Archiving Order ${order.id}...`);
          await archiveCompletedOrder(order.id);
        }
      }
    }

    // (Optional) Send detailed tracking data via email for logging.
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const trackingDataJson = JSON.stringify(trackingData, null, 2);
    const mailOptions = {
      from: `"USPS Tracker" <${process.env.EMAIL_USER}>`,
      to: process.env.ROOT_EMAIL,
      subject: "Detailed USPS Tracking API Response",
      text: "Attached is the detailed USPS tracking data from the API for your review.",
      attachments: [
        {
          filename: "trackingData.json",
          content: trackingDataJson,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Detailed tracking data email sent.");
  } catch (error) {
    console.error("🔴 Error updating USPS bulk tracking:", error.message);
  }
}

// Schedule the job to run every hour.
setInterval(checkShippedOrdersUsps, 60 * 60 * 1000); // 1 hour

module.exports = { checkShippedOrdersUsps };
