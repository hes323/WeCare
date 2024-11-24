const {DataTypes}= require('sequelize');
const sequelize = require('../db/dbconnection')
const UserProfile = require('./UserProfile');
const Appointment = require("./Appointment");

const AssignedAssistant = sequelize.define('AssingedAssistant',{
    userId:{
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        references:{
            model: UserProfile,
            key:'userId'
        }
    },
    appointmentId:{
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        references:{
            model: Appointment,
            key:'appointmentId'
        }
    }

},{
    tableName:'assignedassistant',
    timestamps:false
})


module.exports = AssignedAssistant;