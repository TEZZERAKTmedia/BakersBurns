const Product = require('../../models/product'); // Import Product model

// Fetch all discounted products, grouped by their type
const getDiscountedProductsByType = async (req, res) => {
  try {
    // Fetch products that have discounts (isDiscounted = true)
    const products = await Product.findAll({
      where: {
        isDiscounted: true, // Only get products that have a discount
      },
      attributes: ['id', 'name', 'thumbnail', 'price', 'type', 'discountAmount', 'discountType', 'discountStartDate', 'discountEndDate'], // Include relevant fields
    });

    // Group products by their type
    const groupedByProductType = products.reduce((acc, product) => {
      const productType = product.type; // Grouping by product type
      if (!acc[productType]) {
        acc[productType] = [];
      }
      acc[productType].push(product);
      return acc;
    }, {});

    return res.json(groupedByProductType); // Return the grouped products
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching products with discounts' });
  }
};

// Create or apply a new discount to a product

const addDiscountByType = async (req, res) => {
  const { type, discountType, discountAmount, discountStartDate, discountEndDate } = req.body;

  if (!discountStartDate || !discountEndDate || !type) {
    return res.status(400).json({ error: 'Please provide a type, start date, and end date for the discount.' });
  }

  try {
    const products = await Product.findAll({ where: { type } }); // Find all products of the specified type

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
      product.isDiscounted = 1;

      await product.save(); // Save the updated product
      updatedProducts.push(product); // Add to the updated products array
    }

    res.json({ message: 'Discount applied to all products of the specified type.', updatedProducts });
  } catch (error) {
    console.error('Error applying discount by type:', error);
    res.status(500).json({ error: error.message });
  }
};


// Delete a discount by productId
const deleteDiscount = async (req, res) => {
  try {
    const { productId } = req.params;

    // Find the product by productId
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Remove the discount
    product.isDiscounted = false;
    product.discountType = null;
    product.discountAmount = null;
    product.discountStartDate = null;
    product.discountEndDate = null;

    // Save the updated product
    await product.save();

    return res.status(200).json({ message: 'Discount deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error deleting discount' });
  }
};

// Update the discount for a product
const updateDiscountByType = async (req, res) => {
  const { productType, discountType, discountAmount, discountStartDate, discountEndDate } = req.body;

  try {
    // Find all products that match the productType
    const products = await Product.findAll({
      where: {
        type: productType
      }
    });

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found for this type." });
    }

    // Loop through each product and calculate the discount price
    for (let product of products) {
      let discountPrice;

      // Calculate the discount price based on the discount type
      if (discountType === 'percentage') {
        discountPrice = product.price * (1 - discountAmount / 100);
      } else if (discountType === 'fixed') {
        discountPrice = product.price - discountAmount;
      }

      // Update the product's discount information
      await product.update({
        discountType,
        discountAmount,
        discountPrice,
        discountStartDate,
        discountEndDate,
        isDiscounted: true // Mark the product as discounted
      });
    }

    return res.status(200).json({ message: "Discounts updated for all products of this type." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating discounts." });
  }
};
const getAllProductTypes = async (req, res) => {
  try {
    // Fetch all products
    const products = await Product.findAll({ attributes: ['type'], raw: true }); // Fetch only 'type'

    // Extract unique types
    const uniqueTypes = [...new Set(products.map((product) => product.type))];

    res.json(uniqueTypes); // Send unique types as a response
  } catch (error) {
    console.error('Error fetching product types:', error);
    res.status(500).json({ error: 'Error fetching product types' });
  }
};


module.exports = {
  getDiscountedProductsByType,
  getAllProductTypes,
  deleteDiscount,
  updateDiscountByType,
  addDiscountByType,
};
