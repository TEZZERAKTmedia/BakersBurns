const { fetchUpsTracking, getUpsAuthToken } = require("../upsApi");
const Order = require("../../../models/order");
const { archiveCompletedOrder } = require("../util/invoiceArchiver");

async function checkShippedOrders() {
  console.log("🚀 Checking UPS bulk tracking updates...");

  const shippedOrders = await Order.findAll({
    where: { status: "Shipped", carrier: "UPS" },
  });

  if (shippedOrders.length === 0) {
    console.log("✅ No UPS orders to track.");
    return;
  }

  const trackingNumbers = shippedOrders.map(order => order.trackingNumber);

  try {
    const accessToken = await getUpsAuthToken();
    const trackingData = await fetchUpsTracking(trackingNumbers, accessToken);

    for (const shipment of trackingData.trackResponse.shipment) {
      const trackingNumber = shipment.trackingNumber;
      const latestStatus = shipment.package[0].activity[0].status.description || "Unknown";

      const order = shippedOrders.find(o => o.trackingNumber === trackingNumber);
      if (order) {
        order.status = latestStatus;
        await order.save();
        console.log(`✅ Order ${order.id} - Status Updated: ${latestStatus}`);

        // If delivered, archive the order.
        if (latestStatus.toLowerCase() === "delivered") {
          console.log(`Archiving Order ${order.id}...`);
          await archiveCompletedOrder(order.id);
        }
      }
    }
  } catch (error) {
    console.error("🔴 Error updating UPS bulk tracking:", error.message);
  }
}

// Schedule cron job (runs every hour)
setInterval(checkShippedOrders, 60 * 60 * 1000); // 1 hour

module.exports = { checkShippedOrders };
