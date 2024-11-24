const { DataTypes } = require('sequelize');
const sequelize = require('../db/dbconnection');
const Senior = require('./Senior');

const Relationship = sequelize.define('Relationship', {
    relationShipId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    seniorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Senior,
            key: 'seniorId'
        }
    },
    name: {
        type: DataTypes.STRING,  // Correcting data type to STRING
        allowNull: true,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    relationship: {
        type: DataTypes.STRING,
        allowNull: true
    },
    civilstatus: {
        type: DataTypes.STRING,
        allowNull: true
    },
    occupation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    contactNumber: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'relationship',
    timestamps: false
});

module.exports = Relationship;
