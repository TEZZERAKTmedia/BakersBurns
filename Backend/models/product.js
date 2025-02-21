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
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0, // Ensure quantity is never negative
    },
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isDiscounted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  discountType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  discountPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  discountStartDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  discountEndDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  length: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  width: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  height: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  unit: {
    type: DataTypes.ENUM('metric', 'standard'),
    allowNull: false,
    defaultValue: 'standard',
  }
}, {
  timestamps: true, // Enables createdAt and updatedAt
  tableName: 'Products',
  hooks: {
    beforeValidate: (product) => {
      product.name = xss(product.name);
      product.description = xss(product.description);
      product.image = product.image ? xss(product.image) : null;
      product.type = product.type ? xss(product.type) : null;
      product.discountType = product.discountType ? xss(product.discountType) : null;
    }
  }
});

Product.associate = (models) => {
  Product.hasMany(models.Order, {
    foreignKey: 'productId',
    as: 'orders'
  });
};

module.exports = Product;
