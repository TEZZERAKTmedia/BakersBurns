const Product = require('../../models/product');
const { Sequelize } = require('sequelize');

// Get all products (existing)
const getProducts = async (req, res) => {
  try {
    console.log('Fetching all products');
    const products = await Product.findAll();
    console.log('Products fetched successfully');
    res.json(products);
  } catch (error) {
    console.error('Error fetching products');
    res.status(500).json({ error: error.message });
  }
};

// Add a new product (existing)
const addProduct = async (req, res) => {
  try {
    const { name, description, price, type, quantity, length, width, height, weight, measurementUnit } = req.body;

    console.log('Received File:', req.file);

    if (!name || !description || !price || !type || !quantity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const imageFileName = req.file.filename; 

    // Ensure numeric values
    const lengthValue = parseFloat(length) || 0;
    const widthValue = parseFloat(width) || 0;
    const heightValue = parseFloat(height) || 0;
    const weightValue = parseFloat(weight) || 0;

    // Prepare the BLOB
    const imageBlob = req.file ? req.file.buffer : null;

    // Insert product into the database
    const newProduct = await Product.create({
      name,
      description,
      price,
      type,
      image: imageFileName, // Store the binary data as BLOB
      quantity,
      length: lengthValue,
      width: widthValue,
      height: heightValue,
      weight: weightValue,
      measurementUnit,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product', error });
  }
};



// Update a product (existing)
const updateProduct = async (req, res) => {
  const { id } = req.params;
  
  // Log req.body and req.file to see what data is coming in
  console.log('Request Body:', req.body);
  console.log('Request File:', req.file);

  const { name, description, price, type, quantity } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    console.log('Updating product with id:', id);
    const product = await Product.findByPk(id);
    if (product) {
      console.log('Product found:', product);
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.image = image || product.image;
      product.type = type || product.type;
      product.quantity = quantity || product.quantity;
      product.length = length !== undefined ? length : product.length;
      product.width = width !== undefined ? width : product.width;
      product.height = height !== undefined ? height : product.height;
      product.weight = weight !== undefined ? weight : product.weight;
      product.measurementUnit = measurementUnit || product.measurementUnit;

      await product.save();
      console.log('Product updated successfully', product);
      res.json(product);
    } else {
      console.warn('Product not found with ID:', id);
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a product (existing)
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);
    console.log('Deleting product with ID:', id);
    if (product) {
      console.log('Product found:', product);
      await product.destroy();
      console.log('Product has been deleted:', product);
      res.json({ message: 'Product deleted' });
    } else {
      console.warn('Product not found with Id:', id);
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.warn('Error deleting product:', error);
    res.status(500).json({ error: error.message });
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
        'measurementUnit',
        
        
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




module.exports = {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  addDiscount,       // New function for adding discount
  updateDiscount,    // New function for updating discount
  removeDiscount,
  getDiscountedProducts,
  getProductTypes,    // New function for removing discount
};
