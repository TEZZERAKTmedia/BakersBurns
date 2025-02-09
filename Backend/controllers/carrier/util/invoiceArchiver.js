// archiveController.js
const Order = require("../../../models/order");
const OrderItem = require("../../../models/orderItem"); // adjust the path as needed
const Invoice = require("../../../models/invoice"); // adjust the path as needed

/**
 * Archive a completed order by copying its data (including order items)
 * into an Invoice record.
 * 
 * @param {number} orderId - The ID of the completed order.
 * @returns {Promise<Object>} - The created invoice record.
 */
async function archiveCompletedOrder(orderId) {
  try {
    // Fetch the order by ID.
    const order = await Order.findByPk(orderId);
    if (!order) {
      console.error(`Order with id ${orderId} not found.`);
      return;
    }

    // Fetch associated order items.
    const orderItems = await OrderItem.findAll({ where: { orderId } });

    // Prepare data for the Invoice.
    const invoiceData = {
      orderId: order.id,
      invoiceType: "order", // You can later change this to 'monthly', 'yearly', etc.
      invoiceDate: new Date(),
      total: order.total,
      userId: order.userId,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      carrier: order.carrier,
      trackingNumber: order.trackingNumber,
      // Store order items as JSON.
      orderItems: orderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    // Create the Invoice record.
    const invoice = await Invoice.create(invoiceData);
    console.log(`Archived Order ${order.id} as Invoice ${invoice.id}.`);

    // Optionally mark the original order as archived.
    order.status = "Archived";
    await order.save();

    return invoice;
  } catch (error) {
    console.error("Error archiving order:", error);
  }
}

module.exports = {
  archiveCompletedOrder,
};
