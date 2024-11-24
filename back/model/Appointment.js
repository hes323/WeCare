const {DataTypes} = require ('sequelize');
const sequelize = require('../db/dbconnection');
const UserProfile = require("./UserProfile");
const Status = require("./Status");
const Appointment = 
sequelize.define('Appointment',{
    appointmentId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement: true
    },

    seniorId: {
            type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model: UserProfile,
            key:'userId'
        }
    },
    assistantId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model: UserProfile,
            key:'userId'
        }
    },
    startDate:{
        type: DataTypes.DATE,
        allowNull:false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    statusId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model: Status,
            key:'statusId'
        }
    },
    appointmentDate:{
        type: DataTypes.DATE,
        allowNull:false,
    },
    numberOfHours:{
        type: DataTypes.INTEGER,
        allowNull:false
    },
    totalAmount:{
        type: DataTypes.FLOAT,
        allowNull:false
    },
    serviceDescription: {
        type:DataTypes.STRING,
        allowNull: true
    },
    readFlag: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }

},{
    tableName: 'appointment',
    timestamps:false
}

)
module.exports = Appointment;