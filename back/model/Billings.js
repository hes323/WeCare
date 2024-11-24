const {DataTypes} = require ('sequelize');
const sequelize = require('../db/dbconnection');
const Appointment = require("./Appointment");

const Billings = 
sequelize.define('Billings',{
    billingId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement: true
    },

    appointmentId: {
            type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model: Appointment,
            key:'appointmentId'
        }
    },
    date: {
        type: DataTypes.DATE,
        allowNull:false,
        defaultValue: new Date()
    },
    time:{
        type: DataTypes.TIME,
        allowNull:false
    },
    serviceProvided: {
        type: DataTypes.STRING,
        allowNull: true
    },
    hoursBilled: {
        type: DataTypes.INTEGER,
        allowNull:false
    },
    payMethod:{
        type: DataTypes.STRING,
        allowNull: true
    },
    totalPay:{
        type: DataTypes.DOUBLE,
        allowNull:false
    }
},{
    tableName: 'billings',
    timestamps:false
}

)
module.exports = Billings;