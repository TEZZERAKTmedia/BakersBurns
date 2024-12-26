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
      min: 0 // Ensure quantity is never negative
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isDiscounted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Discount is not active by default
  },
  discountType: {
    type: DataTypes.STRING,
    allowNull: true, // Make this nullable if not always used
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true, // Make this nullable if not always used
  },
  discountPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  discountStartDate: {
    type: DataTypes.DATE,
    allowNull: true, // Make this nullable if not always used
  },
  discountEndDate: {
    type: DataTypes.DATE,
    allowNull: true, // Fixed typo and made it nullable if not always used
  },
  // New fields for dimensions and weight
  length: {
    type: DataTypes.FLOAT,
    allowNull: true, // Nullable in case some products don't have dimensions
    validate: {
      min: 0, // Ensure non-negative values
    }
  },
  width: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0, // Ensure non-negative values
    }
  },
  height: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0, // Ensure non-negative values
    }
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true, // Nullable in case weight is not provided
    validate: {
      min: 0, // Ensure non-negative values
    },
    
  },
  unit: {
    type: DataTypes.ENUM('metric', 'standard'),
    allowNull: false,
    defaultValue: 'standard', // Default to metric if not specified
  }
}, {
  timestamps: false,
  tableName: 'Products',
  hooks: {
    beforeValidate: (product) => {
      // Sanitize only the string fields
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
