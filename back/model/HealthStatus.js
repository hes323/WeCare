const {DataTypes} = require ('sequelize');
const sequelize = require('../db/dbconnection')

const HealthStatus = sequelize.define('HealthStatus',{
    healthStatusId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    healthStatus:{
        type:DataTypes.STRING,
        allowNull:false
    }

},{
    tableName: 'healthstatus',
    timestamps:false
})

module.exports = HealthStatus;