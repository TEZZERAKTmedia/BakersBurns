const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const xss = require('xss');

const Event = sequelize.define('Event', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      this.setDataValue('name', xss(value));
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    set(value) {
      this.setDataValue('description', xss(value));
    },
  },
  frequency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  days: {
    type: DataTypes.STRING, // Store as a comma-separated string
    allowNull: false,
    get() {
      // Convert comma-separated string to array
      const value = this.getDataValue('days');
      return value ? value.split(',') : [];
    },
    set(val) {
      // Ensure days is always stored as a comma-separated string
      if (Array.isArray(val)) {
        this.setDataValue('days', val.join(','));
      } else if (typeof val === 'string') {
        this.setDataValue('days', val);
      } else {
        throw new Error('Invalid value for days: must be an array or comma-separated string');
      }
    }
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  hooks: {
    beforeSave: (event) => {
      event.name = xss(event.name);
      event.description = xss(event.description);
    },
  },
  timestamps: true,
  tableName: 'Events',
});

module.exports = Event;
