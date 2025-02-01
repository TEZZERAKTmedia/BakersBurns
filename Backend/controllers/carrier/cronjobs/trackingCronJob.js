const { fetchUpsTracking, getUpsAuthToken } = require("../upsApi");
const Order = require("../../../models/order");

async function checkShippedOrders() {
  console.log("🚀 Checking UPS bulk tracking updates...");

  // ✅ Step 1: Fetch orders with status "Shipped" and carrier "UPS"
  const shippedOrders = await Order.findAll({
    where: { status: "Shipped", carrier: "UPS" },
  });

  if (shippedOrders.length === 0) {
    console.log("✅ No UPS orders to track.");
    return;
  }

  // ✅ Step 2: Extract tracking numbers from orders
  const trackingNumbers = shippedOrders.map(order => order.trackingNumber);

  try {
    // ✅ Step 3: Get UPS OAuth Token
    const accessToken = await getUpsAuthToken();

    // ✅ Step 4: Pass trackingNumbers to fetchUpsTracking() in upsApi.js
    const trackingData = await fetchUpsTracking(trackingNumbers, accessToken);

    // ✅ Step 5: Update Order Statuses in Database
    for (const shipment of trackingData.trackResponse.shipment) {
      const trackingNumber = shipment.trackingNumber;
      const latestStatus = shipment.package[0].activity[0].status.description || "Unknown";

      // ✅ Find the matching order in the database
      const order = shippedOrders.find(o => o.trackingNumber === trackingNumber);
      if (order) {
        order.status = latestStatus; // Update status
        await order.save(); // Save updated order to database
        console.log(`✅ Order ${order.id} - Status Updated: ${latestStatus}`);
      }
    }
  } catch (error) {
    console.error("🔴 Error updating UPS bulk tracking:", error.message);
  }
}

// Schedule cron job (runs every hour)
setInterval(checkShippedOrders, 60 * 60 * 1000); // 1 hour

module.exports = { checkShippedOrders };
