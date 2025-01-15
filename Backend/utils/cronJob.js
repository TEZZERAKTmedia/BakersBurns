const cron = require('node-cron');
const Product = require('../models/product'); // Your Sequelize Product model
const { Op } = require('sequelize'); // Sequelize operator

// Schedule a task to run at midnight every day
cron.schedule('0 0 * * *', async () => {
  try {
    // Get today's date
    const today = new Date();

    // Activate discounts: Find products where today is within the discount period
    await Product.update(
      { isDiscounted: true },
      {
        where: {
          discountStartDate: { [Op.lte]: today }, // Start date is before or equal to today
          discountEndDate: { [Op.gte]: today },   // End date is after or equal to today
        },
      }
    );

    // Deactivate discounts: Find products where today is outside the discount period
    await Product.update(
      { isDiscounted: false },
      {
        where: {
          [Op.or]: [
            { discountEndDate: { [Op.lt]: today } }, // End date is in the past
            { discountStartDate: { [Op.gt]: today } }, // Start date is in the future
          ],
        },
      }
    );

    console.log('Discount status updated successfully.');
  } catch (error) {
    console.error('Failed to update discount status:', error);
  }
});
