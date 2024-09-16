// controllers/productController.js

const Product = require('../../models/product');

// Get all products
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

// Add a new product
const addProduct = async (req, res) => {
  const { name, description, price,  } = req.body;
  const image = req.file ? req.file.filename : null; // Save the filename

  try {
    console.log('Adding new product')
    const newProduct = await Product.create({ name, description, price, image,  });
    console.log('Product added')
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error adding product:', error)
    res.status(500).json({ error: error.message });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image } = req.body;

  try {
    console.log('Updating product with id:', id);
    const product = await Product.findByPk(id);
    if (product) {
      console.log('Product found:', product);
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.image = image || product.image; // Ensure image field is updated if provided
      await product.save();
      console.log('Product updated successfully', product);
      res.json(product);
    } else {
      console.warn('Product not found with ID:', id);
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Error updating product:', error); // Log the error instead of the product
    res.status(500).json({ error: error.message });
  }
};

// Delete a product
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
      console.warn('Product not found with Id:',id);
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.warn('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getProducts, addProduct, updateProduct, deleteProduct };
