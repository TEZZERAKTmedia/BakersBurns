const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const xss = require('xss'); // Import xss library

const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: false,
  tableName: 'Products',
  hooks: {
    beforeValidate: (product) => {
      product.name = xss(product.name);
      product.description = xss(product.description);
      product.image = product.image ? xss(product.image) : null;
    }
  }
});

module.exports = Product;
