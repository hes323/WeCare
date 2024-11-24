const {DataTypes} = require ('sequelize');
const sequlize = require('../db/dbconnection')

const Barangay = sequlize.define('Barangay',{
    barangayId: {
        type:DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement: true
    },
    barangay:{
        type:DataTypes.STRING,
        allowNull:false,
        unique: true
    }

},{
    tableName: 'barangay',
    timestamps:false
})

module.exports= Barangay;