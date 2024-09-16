const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const xss = require('xss'); // Import xss library

const Gallery = sequelize.define('Gallery', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,  // Image filename/path
  }
}, {
  timestamps: false,
  tableName: 'Gallery',  // Make sure it matches the SQL table name
  hooks: {
    beforeValidate: (gallery) => {
      gallery.title = xss(gallery.title);
      gallery.description = gallery.description ? xss(gallery.description) : null;
      gallery.image = xss(gallery.image);
    }
  }
});

module.exports = Gallery;
