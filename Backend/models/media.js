const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust the path as per your project structure
const Product = require('./product'); // Import the Product model

const Media = sequelize.define('Media', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id',
    },
    onDelete: 'CASCADE', // Delete media if the associated product is deleted
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('image', 'video'),
    allowNull: false,
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  order: {
    type: DataTypes.TINYINT,
    allowNull: false,
    validate: {
      min: 1,
      max: 10,
      isInt: true, // Ensures the value is an integer
    }},
}, {
  tableName: 'Media',
  timestamps: true,
});

// Associations


module.exports = Media;
