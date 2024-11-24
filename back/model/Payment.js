const {DataTypes} = require ('sequelize');
const sequelize = require('../db/dbconnection');
const Appointment = require("./Appointment");
const UserProfile = require("./UserProfile");
const Payment = 
sequelize.define('Payment',{
    
    paymentId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement: true
    },

    paymentMethod: {
        type: DataTypes.STRING,
        allowNull:false, 
    },
    appointmentId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: Appointment,
            key: 'appointmentId'
        }
    },
    processedPaymentId:{
        type: DataTypes.STRING,
        allowNull: false
    },
    payerId:{
        type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:UserProfile,
            key: 'userId'
            },
    }

},{
    tableName: 'payment',
    timestamps:false
}

)
module.exports = Payment;
