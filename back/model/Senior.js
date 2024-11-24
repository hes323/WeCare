const { DataTypes } = require('sequelize');
const sequelize = require('../db/dbconnection');
const userprofile = require('./UserProfile');
const healthStatus = require('./HealthStatus');

const Senior = sequelize.define('Senior', {
    seniorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: userprofile,
            key: 'userId'
        }
    },
    healthStatusId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:healthStatus,
            key:'healthStatusId'
        }
    },
    seniorNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    prescribeMeds: {
        type: DataTypes.STRING,
        allowNull: false
    },
    remarks: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'senior',
    timestamps: false
});

module.exports = Senior;
