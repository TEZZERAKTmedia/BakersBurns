const { fetchUspsTracking, getUspsAuthToken } = require("../uspsApi");
const Order = require("../../../models/order");

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

    for (const shipment of trackingData.trackResponse.shipment) {
      const trackingNumber = shipment.inquiryNumber;
      const latestStatus = shipment.package?.[0]?.activity?.[0]?.status?.description || "Unknown";

      const order = shippedOrders.find((o) => o.trackingNumber === trackingNumber);
      if (order) {
        order.status = latestStatus;
        await order.save();

        console.log(`✅ Order ${order.id} - Status Updated: ${latestStatus}`);
      }
    }
  } catch (error) {
    console.error("🔴 Error updating USPS bulk tracking:", error.message);
  }
}

// Schedule cron job (runs every hour)
setInterval(checkShippedOrdersUsps, 60 * 60 * 1000); // Runs every 1 hour

module.exports = { checkShippedOrdersUsps };
