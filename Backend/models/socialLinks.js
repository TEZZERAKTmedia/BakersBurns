const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SocialLink = sequelize.define('SocialLink', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  platform: {
    type: DataTypes.STRING,
    allowNull: false, // e.g., 'Facebook', 'Instagram', etc.
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false, // The URL of the platform
  },
}, {
  tableName: 'SocialLinks', // Table name
  timestamps: false, // Disable timestamps
});

module.exports = SocialLink;
