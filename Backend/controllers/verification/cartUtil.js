
const Cart = require("../../models/cart");
const GuestCart = require("../../models/guestCart");
const Product = require("../../models/product");

const mergeGuestCartToUserCart = async (guestSessionId, userId) => {
  if (!guestSessionId) return;

  try {
    // Fetch guest cart items
    const guestCartItems = await GuestCart.findAll({
      where: { sessionId: guestSessionId },
      include: [{ model: Product, as: "Product" }],
    });

    if (!guestCartItems.length) return;

    console.log(`🔄 Merging guest cart (Session: ${guestSessionId}) to User ID: ${userId}`);

    for (const guestItem of guestCartItems) {
      const existingCartItem = await Cart.findOne({
        where: { userId, productId: guestItem.productId },
      });

      if (existingCartItem) {
        // If product exists in user cart, update quantity
        existingCartItem.quantity += guestItem.quantity;
        await existingCartItem.save();
      } else {
        // Otherwise, add as a new item in the user's cart
        await Cart.create({
          userId,
          productId: guestItem.productId,
          quantity: guestItem.quantity,
        });
      }
    }

    // Remove guest cart after merging
    await GuestCart.destroy({ where: { sessionId: guestSessionId } });

    console.log("✅ Guest cart merged successfully.");
  } catch (error) {
    console.error("❌ Error merging guest cart:", error);
  }
};

module.exports = { mergeGuestCartToUserCart };
