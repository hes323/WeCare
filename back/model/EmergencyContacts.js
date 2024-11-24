const {DataTypes} = require ('sequelize');
const sequelize = require('../db/dbconnection');
const UserProfile = require("./UserProfile");
const EmergencyContacts = 
sequelize.define('EmergencyContacts', {
    emergencyId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    phone:{
        type: DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false
    },
    address:{
        type:DataTypes.STRING,
        allowNull:false
    },
    emergencyImage:{
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
    },
    latitude:{
        type: DataTypes.TEXT,
        allowNull:false
    },
    longtitude:{
        type: DataTypes.TEXT,
        allowNull:false
    }
},{
    tableName: 'emergencyContacts',
    timestamps:false
}

)
module.exports = EmergencyContacts;