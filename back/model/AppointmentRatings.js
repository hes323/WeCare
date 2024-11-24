const {DataTypes} = require ('sequelize');
const sequelize = require('../db/dbconnection');
const Ratings = require('./Ratings')
const Appointment = require("./Appointment")
const AppointmentRatings = 
sequelize.define('AppointmentRatings',{
    appointmentRatingsId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey: true,
        autoIncrement: true
    },
    appointmentId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Appointment,
            key:'appointmentId'
        },
        unique: true  
    },

    ratingsId: {
        type: DataTypes.INTEGER,
        allowNull:false, 
        references:{
            model:Ratings,
            key:'ratingsId'
        }
    },
    comments: {
        type: DataTypes.STRING,
        allowNull:true, 
    }
},{
    tableName: 'appointmentratings',
    timestamps:false
}

)
module.exports = AppointmentRatings;