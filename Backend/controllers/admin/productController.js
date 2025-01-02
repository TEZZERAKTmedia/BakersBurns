const Product = require('../../models/product');
const Media = require('../../models/media');
const path = require('path');
const fs = require('fs'); // Correct way to import the file system module



const { Sequelize } = require('sequelize');

// Get all products (existing)
const getProducts = async (req, res) => {
  try {
    console.log('Fetching all products with media');
    
    const products = await Product.findAll({
      include: [
        {
          model: Media,
          as: 'media', // Use the alias defined in your association, if any
          attributes: ['id', 'type', 'url'], // Fetch specific fields from the Media table
        },
      ],
    });
    
    console.log('Products with media fetched successfully');
    res.json(products);
  } catch (error) {
    console.error('Error fetching products with media:', error);
    res.status(500).json({ error: error.message });
  }
};
// Add a new product (existing)
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      type,
      quantity,
      length,
      width,
      height,
      weight,
      unit,
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !type || !quantity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Ensure numeric values for optional fields
    const lengthValue = parseFloat(length) || 0;
    const widthValue = parseFloat(width) || 0;
    const heightValue = parseFloat(height) || 0;
    const weightValue = parseFloat(weight) || 0;

    // Extract thumbnail file
    const thumbnailFile = req.files?.thumbnail?.[0];
    if (!thumbnailFile) {
      return res.status(400).json({ message: 'Thumbnail is required' });
    }

    // Create the product
    const newProduct = await Product.create({
      name,
      description,
      price,
      type,
      quantity,
      length: lengthValue,
      width: widthValue,
      height: heightValue,
      weight: weightValue,
      unit,
      thumbnail: thumbnailFile.filename, // Save thumbnail file name
    });

    // Fetch and return the created product without handling media
    const productWithMedia = await Product.findByPk(newProduct.id, {
      include: [{ model: Media, as: 'media' }],
    });

    res.status(201).json(productWithMedia);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product', error });
  }
};







// Update a product (existing)
const updateProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update product fields
    const { name, description, price, type, quantity, length, width, height, weight, unit } = req.body;
    product.set({
      name: name || product.name,
      description: description || product.description,
      price: price || product.price,
      type: type || product.type,
      quantity: quantity || product.quantity,
      length: length !== undefined ? parseFloat(length) : product.length,
      width: width !== undefined ? parseFloat(width) : product.width,
      height: height !== undefined ? parseFloat(height) : product.height,
      weight: weight !== undefined ? parseFloat(weight) : product.weight,
      unit: unit || product.unit,
    });

    if (req.files && req.files.thumbnail) {
      const uploadsPath = path.join(__dirname, '../../uploads');
      if (product.thumbnail) {
        const thumbnailPath = path.join(uploadsPath, product.thumbnail);
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      }
      product.thumbnail = req.files.thumbnail[0].filename;
    }

    await product.save();

    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error });
  }
};


// Helper function for media synchronization
const updateMediaInternal = async (productId, mediaFiles) => {
  try {
    // Fetch and delete all existing media for the product
    const existingMedia = await Media.findAll({ where: { productId } });
    const uploadsPath = path.join(__dirname, '../../uploads');

    // Delete media files from the file system
    for (const media of existingMedia) {
      const mediaPath = path.join(uploadsPath, media.url);
      if (fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath); // Delete the file
      }
    }

    // Remove media records from the database
    await Media.destroy({ where: { productId } });

    // Process and save new media
    if (mediaFiles) {
      const newMediaEntries = mediaFiles.map((file) => ({
        productId,
        url: file.filename,
        type: file.mimetype.startsWith('video/') ? 'video' : 'image',
      }));

      const newMedia = await Media.bulkCreate(newMediaEntries); // Add new media records
      return newMedia;
    }

    return [];
  } catch (error) {
    console.error('Error in updateMediaInternal:', error);
    throw error;
  }
};


const updateThumbnail = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Thumbnail image is required' });
    }

    // Delete the old thumbnail file if it exists
    if (product.thumbnail) {
      fs.unlink(`uploads/${product.thumbnail}`, (err) => {
        if (err) console.error('Error deleting old thumbnail:', err);
      });
    }

    // Update the thumbnail field
    product.thumbnail = req.file.filename;
    await product.save();

    res.status(200).json({ message: 'Thumbnail updated successfully', product });
  } catch (error) {
    console.error('Error updating thumbnail:', error);
    res.status(500).json({ message: 'Error updating thumbnail', error });
  }
};

// Fetch media for a specific product by ID
const getProductMedia = async (req, res) => {
  const { id } = req.params; // Product ID from the request parameters

  if (!id) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    // Fetch media associated with the product ID
    const mediaFiles = await Media.findAll({
      where: { productId: id }, // Use productId to filter records
      attributes: ['id', 'url', 'type', 'isDefault'], // Only fetch specific fields
    });

    if (!mediaFiles.length) {
      // No media found, return an empty array
      return res.status(200).json([]);
    }

    res.status(200).json(mediaFiles); // Return media files as JSON
  } catch (error) {
    console.error(`Error fetching media for product ${id}:`, error);
    res.status(500).json({ message: 'Error fetching media', error });
  }
};


const addMedia = async (req, res) => {
  console.log('addMedia endpoint hit');
  console.log('Files:', req.files);
  console.log('Body:', req.body);
  console.log('Query:', req.query);

  // Support both body and query parameter for productId
  const productId = req.body.productId || req.query.productId;
  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    // Ensure `productId` is treated as a number
    const parsedProductId = parseInt(productId, 10);
    if (isNaN(parsedProductId)) {
      return res.status(400).json({ message: 'Invalid Product ID' });
    }

    const mediaFiles = req.files.media.map((file) => ({
      productId: parsedProductId,
      url: file.filename,
      type: file.mimetype.startsWith('video/') ? 'video' : 'image',
    }));

    await Media.bulkCreate(mediaFiles);
    res.status(201).json({ message: 'Media uploaded successfully', media: mediaFiles });
  } catch (error) {
    console.error('Error in addMedia:', error);
    res.status(500).json({ message: 'Error adding media', details: error.message });
  }
};







// Update product media
const updateMedia = async (req, res) => {
  const { id } = req.params; // Product ID
  const { mediaToKeep = [] } = req.body; // Array of media IDs to keep

  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const uploadsPath = path.join(__dirname, '../../uploads');

    // Fetch all existing media for the product
    const existingMedia = await Media.findAll({ where: { productId: id } });

    // Delete media not included in `mediaToKeep`
    for (const media of existingMedia) {
      if (!mediaToKeep.includes(media.id)) {
        const mediaPath = path.join(uploadsPath, media.url);
        if (fs.existsSync(mediaPath)) {
          fs.unlinkSync(mediaPath); // Delete the file from the file system
        }
        await media.destroy(); // Delete the record from the database
      }
    }

    // Process and add new media files
    if (req.files && req.files.media) {
      const newMediaEntries = req.files.media.map((file) => ({
        productId: product.id,
        url: file.filename,
        type: file.mimetype.startsWith('video/') ? 'video' : 'image',
      }));

      await Media.bulkCreate(newMediaEntries); // Add new media records
    }

    res.status(200).json({ message: 'Media updated successfully' });
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).json({ message: 'Error updating media', error });
  }
};



// Delete a product (existing)
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the product by ID
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete associated files
    const uploadsPath = path.join(__dirname, '../../uploads');

    // Delete thumbnail
    if (product.thumbnail) {
      const thumbnailPath = path.join(uploadsPath, product.thumbnail);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    // Fetch media files associated with the product
    const mediaFiles = await Media.findAll({ where: { productId: id } });

    // Delete media files
    for (const media of mediaFiles) {
      const mediaPath = path.join(uploadsPath, media.url); // Use `url` as per your Media model
      if (fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath);
      }
    }

    // Delete media records from the database
    await Media.destroy({ where: { productId: id } });

    // Delete the product from the database
    await product.destroy();

    res.status(200).json({ message: 'Product and associated files deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'An error occurred while deleting the product' });
  }
};



// Add discount to an existing product
// Add discount to an existing product
const addDiscount = async (req, res) => {
  const { id } = req.params;
  const { discountType, discountAmount, discountStartDate, discountEndDate } = req.body;

  if (!discountStartDate || !discountEndDate) {
    return res.status(400).json({ error: 'Please provide both start and end dates for the discount.' });
  }

  try {
    const product = await Product.findByPk(id);

    if (product) {
      let discountPrice = product.price;

      if (discountType === 'percentage') {
        discountPrice = product.price - (product.price * discountAmount) / 100;
      } else if (discountType === 'fixed') {
        discountPrice = product.price - discountAmount;
      }

      const priceDifference = (product.price - discountPrice).toFixed(2); // Calculate the price difference

      product.discountType = discountType;
      product.discountAmount = discountAmount;
      product.discountStartDate = discountStartDate;
      product.discountEndDate = discountEndDate;
      product.discountPrice = discountPrice > 0 ? discountPrice : 0;
      product.priceDifference = priceDifference; // Save the price difference
      product.isDiscounted = 1; // Set the product as discounted
      

      await product.save();
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// Update discount on a product
const updateDiscount = async (req, res) => {
  const { id } = req.params;
  const { discountType, discountAmount, discountStartDate, discountEndDate } = req.body;

  try {
    console.log('Updating discount for product with id:', id);
    const product = await Product.findByPk(id);

    if (product) {
      console.log('Product found:', product);
      product.discountType = discountType || product.discountType;
      product.discountAmount = discountAmount || product.discountAmount;

      // Set default start date to the current date if not provided
      product.discountStartDate = discountStartDate || product.discountStartDate || new Date();
      product.discountEndDate = discountEndDate || product.discountEndDate;
      
      if (!discountStartDate && !discountEndDate) {
        product.isDiscounted = false;  // Remove discount if no dates are set
      } else {
        product.isDiscounted = true;
      }

      await product.save();
      console.log('Discount updated successfully', product);
      res.json(product);
    } else {
      console.warn('Product not found with ID:', id);
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Error updating discount:', error);
    res.status(500).json({ error: error.message });
  }
};


// Remove discount from a product
const removeDiscount = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);

    if (product) {
      // Reset discount fields
      product.discountType = null;
      product.discountAmount = null;
      product.discountStartDate = null;
      product.discountEndDate = null;
      product.discountPrice = product.price; // Set discount price back to original price
      product.isDiscounted = false; // Mark the product as no longer discounted

      await product.save();
      console.log(`Discount removed from product with ID: ${id}`);
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Get all discounted products
const getDiscountedProducts = async (req, res) => {
  try {
    console.log('Fetching discounted products');
    const discountedProducts = await Product.findAll({
      where: { isDiscounted: true },
      attributes: [
        'id',
        'name',
        'price',
        'discountPrice',
        'discountType',
        'discountAmount',
        'discountStartDate',
        'discountEndDate',
        'length',
        'width',
        'height',
        'weight',
        'unit',
        
        
      ]
    });
    console.log('Discounted products fetched successfully');
    res.json(discountedProducts);
  } catch (error) {
    console.error('Error fetching discounted products:', error);
    res.status(500).json({ error: error.message });
  }
};


// In productController.js
const getProductTypes = async (req, res) => {
  try {
    const productTypes = await Product.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('type')), 'type']],
    });
    res.json(productTypes);
  } catch (error) {
    console.error('Error fetching product types:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add this route to your routes file
const getProductDetails = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    const productWithMedia = await Product.findOne({
      where: { id },
      include: [
        {
          model: Media,
          as: 'media', // Use the alias defined in associations
          attributes: ['id', 'url', 'type', 'isDefault'],
        },
      ],
    });

    if (!productWithMedia) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(productWithMedia);
  } catch (error) {
    console.error('Error fetching product with media:', error);
    res.status(500).json({ message: 'Error fetching product details' });
  }
};

const applyDiscountByType = async (req, res) => {
  const { type, discountType, discountAmount, discountStartDate, discountEndDate } = req.body;

  if (!type || !discountStartDate || !discountEndDate) {
    return res.status(400).json({ error: 'Type, start date, and end date are required' });
  }

  try {
    const products = await Product.findAll({ where: { type } });

    if (!products.length) {
      return res.status(404).json({ message: 'No products found for the given type' });
    }

    const updatedProducts = [];
    for (const product of products) {
      let discountPrice = product.price;

      if (discountType === 'percentage') {
        discountPrice = product.price - (product.price * discountAmount) / 100;
      } else if (discountType === 'fixed') {
        discountPrice = product.price - discountAmount;
      }

      product.set({
        discountType,
        discountAmount,
        discountStartDate,
        discountEndDate,
        discountPrice: discountPrice > 0 ? discountPrice : 0,
        isDiscounted: true,
      });

      await product.save();
      updatedProducts.push(product);
    }

    res.status(200).json({ message: 'Discount applied to all products of the specified type', updatedProducts });
  } catch (error) {
    console.error('Error applying discount by type:', error);
    res.status(500).json({ error: 'Error applying discount by type' });
  }
};


module.exports = {
  getProducts,
  getProductDetails,
  addProduct,
  addMedia,
  updateProduct,
  deleteProduct,
  addDiscount,       // New function for adding discount
  updateDiscount,    // New function for updating discount
  removeDiscount,
  getDiscountedProducts,
  getProductTypes,    // New function for removing discount
  updateThumbnail,
  updateMedia,
  applyDiscountByType,
  getProductMedia
};
