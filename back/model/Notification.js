const {DataTypes} = require ('sequelize');
const sequelize = require('../db/dbconnection');
const Appointment = require("./Appointment");
const UserProfile = require("./UserProfile");
const Reminder = require('./Reminder')
const Status = require("./Status");

const Notification = 
sequelize.define('Notification',{

    notificationId: {
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
            key:'AppointmentId'
        }
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
  
    statusId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model: Status,
            key:'statusId'
        }
    },

    seniorReadFlag: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    assistantReadFlag: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    isFromReminder: {
        type:DataTypes.BOOLEAN,
        allowNull:false
    },

    reminderId:{
        type:DataTypes.INTEGER,
        allowNull:true,
        references:{
            model:Reminder,
            key:'reminderId'
        }
    }

},{
    tableName: 'notification',
    timestamps:true
}

)
module.exports = Notification;