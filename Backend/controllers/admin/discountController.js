const { Op } = require('sequelize'); // Needed for query operators
const Product = require('../../models/product'); // Import Product model

/**
 * Helper function to update the isDiscounted property based on the current date.
 * Sets isDiscounted to true if current date is between discountStartDate and discountEndDate.
 *
 * @param {Product} product - The product instance to update.
 */
function updateDiscountStatus(product) {
  const now = new Date();
  const start = new Date(product.discountStartDate);
  const end = new Date(product.discountEndDate);
  product.isDiscounted = now >= start && now <= end;
}

// -------------------------------------------------------------------------
// Fetch all discounted products, grouped by their type
// Instead of relying solely on isDiscounted flag, we recalc based on dates.
const getDiscountedProductsByType = async (req, res) => {
  try {
    const now = new Date();
    // Fetch products where discountStartDate is in the past and discountEndDate is in the future.
    const products = await Product.findAll({
      where: {
        discountStartDate: { [Op.lte]: now },
        discountEndDate: { [Op.gte]: now }
      },
      attributes: [
        'id',
        'name',
        'thumbnail',
        'price',
        'type',
        'discountAmount',
        'discountType',
        'discountStartDate',
        'discountEndDate'
      ],
    });

    // Ensure each product's isDiscounted value is correctly set
    products.forEach(product => {
      updateDiscountStatus(product);
    });

    // Optionally group products by type
    const groupedByProductType = products.reduce((acc, product) => {
      const productType = product.type;
      if (!acc[productType]) {
        acc[productType] = [];
      }
      acc[productType].push(product);
      return acc;
    }, {});

    return res.json(groupedByProductType);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching products with discounts' });
  }
};

// -------------------------------------------------------------------------
// Create or apply a new discount to products of a given type.
const addDiscountByType = async (req, res) => {
  const { type, discountType, discountAmount, discountStartDate, discountEndDate } = req.body;

  if (!discountStartDate || !discountEndDate || !type) {
    return res.status(400).json({ error: 'Please provide a type, start date, and end date for the discount.' });
  }

  try {
    const products = await Product.findAll({ where: { type } });

    if (!products.length) {
      return res.status(404).json({ error: 'No products found for the specified type.' });
    }

    const updatedProducts = [];

    for (const product of products) {
      let discountPrice = product.price;

      // Calculate the discounted price
      if (discountType === 'percentage') {
        discountPrice = product.price - (product.price * discountAmount) / 100;
      } else if (discountType === 'fixed') {
        discountPrice = product.price - discountAmount;
      }

      const priceDifference = (product.price - discountPrice).toFixed(2);

      // Update the product's discount details
      product.discountType = discountType;
      product.discountAmount = discountAmount;
      product.discountStartDate = discountStartDate;
      product.discountEndDate = discountEndDate;
      product.discountPrice = discountPrice > 0 ? discountPrice : 0;
      product.priceDifference = priceDifference;
      
      // Set isDiscounted based on current date and discount dates
      updateDiscountStatus(product);

      await product.save();
      updatedProducts.push(product);
    }

    res.json({ message: 'Discount applied to all products of the specified type.', updatedProducts });
  } catch (error) {
    console.error('Error applying discount by type:', error);
    res.status(500).json({ error: error.message });
  }
};

// -------------------------------------------------------------------------
// Delete a discount by product type (clear discount details)
const deleteDiscountByType = async (req, res) => {
  const { productType } = req.body;

  if (!productType) {
    return res.status(400).json({ error: "Product type is required." });
  }

  try {
    const products = await Product.findAll({ where: { type: productType } });

    if (!products.length) {
      return res.status(404).json({ error: "No products found for the specified type." });
    }

    for (const product of products) {
      await product.update({
        isDiscounted: false,
        discountType: null,
        discountAmount: null,
        discountStartDate: null,
        discountEndDate: null,
        discountPrice: null,
      });
    }

    return res.status(200).json({ message: `Discounts removed for type: ${productType}` });
  } catch (error) {
    console.error("Error deleting discounts by type:", error);
    return res.status(500).json({ error: "Failed to remove discounts." });
  }
};

// -------------------------------------------------------------------------
// Update the discount for products of a given type.
const updateDiscountByType = async (req, res) => {
  const { productType, discountType, discountAmount, discountStartDate, discountEndDate } = req.body;

  console.log("Received request to update discounts");
  console.log("Request Body:", { productType, discountType, discountAmount, discountStartDate, discountEndDate });

  try {
    // Find all products that match the productType
    const products = await Product.findAll({
      where: { type: productType },
    });

    if (products.length === 0) {
      console.log("No products found for the specified type:", productType);
      return res.status(404).json({ message: "No products found for this type." });
    }

    console.log(`Found ${products.length} products for type: ${productType}`);

    // Loop through each product and calculate the discount price
    for (let product of products) {
      const originalPrice = product.price;
      let discountPrice;

      console.log("Processing product:", {
        id: product.id,
        name: product.name,
        originalPrice,
      });

      if (discountType === 'percentage') {
        discountPrice = originalPrice - (originalPrice * discountAmount) / 100;
        console.log("Calculated percentage discount price:", discountPrice);
      } else if (discountType === 'fixed') {
        discountPrice = originalPrice - discountAmount;
        console.log("Calculated fixed discount price:", discountPrice);
      }

      discountPrice = discountPrice > 0 ? discountPrice : 0;
      console.log("Final discount price (after ensuring non-negative):", discountPrice);

      // Update the product's discount information
      product.discountType = discountType;
      product.discountAmount = discountAmount;
      product.discountPrice = discountPrice;
      product.discountStartDate = discountStartDate;
      product.discountEndDate = discountEndDate;
      
      // Set isDiscounted based on current date and discount dates
      updateDiscountStatus(product);

      await product.save();

      console.log("Product updated successfully:", {
        id: product.id,
        discountType,
        discountAmount,
        discountPrice,
        discountStartDate,
        discountEndDate,
      });
    }

    console.log("All products updated successfully for type:", productType);
    return res.status(200).json({ message: "Discounts updated for all products of this type." });
  } catch (error) {
    console.error("Error updating discounts:", error);
    return res.status(500).json({ message: "Error updating discounts." });
  }
};

// -------------------------------------------------------------------------
// Fetch unique product types (unchanged)
const getAllProductTypes = async (req, res) => {
  try {
    const products = await Product.findAll({ attributes: ['type'], raw: true });
    const uniqueTypes = [...new Set(products.map((product) => product.type))];
    res.json(uniqueTypes);
  } catch (error) {
    console.error('Error fetching product types:', error);
    res.status(500).json({ error: 'Error fetching product types' });
  }
};

module.exports = {
  getDiscountedProductsByType,
  getAllProductTypes,
  deleteDiscountByType,
  updateDiscountByType,
  addDiscountByType,
};
