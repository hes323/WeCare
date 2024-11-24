const { DataTypes } = require('sequelize');
const sequelize = require('../db/dbconnection');

const Experience = sequelize.define('Experience', {
  experienceId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  numOfYears: {
    type: DataTypes.INTEGER,
    allowNull: true, // Changed to true to allow null values
  },
  experienceDescription: {
    type: DataTypes.TEXT,
    allowNull: true, // Changed to true to allow null values
  },
  rate: {
    type: DataTypes.INTEGER,
    allowNull: true, // Changed to true to allow null values
  }
}, {
  tableName: 'experience',
  timestamps: false
});

module.exports = Experience;
