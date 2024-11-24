const { DataTypes} = require('sequelize');

const sequelize = require('../db/dbconnection')
const User = require('./User')
const ChatRoom = require('./ChatRoom')

const Message = sequelize.define('Message',{
    messageId:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },

    senderId:{

        type:DataTypes.INTEGER,
        allowNull:false,    
        references: {
            model: User,
            key : 'userId'
        }  
    },
    
    recipientId:{
        type:DataTypes.INTEGER,
        allowNull:false,   
        references: {
            model: User,
            key : 'userId'
        }
    },

    messageContent:{
        type:DataTypes.STRING,
        allowNull:false
    },

   contentType:{
        type:DataTypes.TEXT,
        allowNull:false
    },

    roomId: {
        type:DataTypes.UUID,
        allowNull:false,
        references:{
            model:ChatRoom,
            key: 'roomId'
        }
    },

    date:{
        type:DataTypes.DATE,
        allowNull:false
    }
    ,

    time:{
        type:DataTypes.TIME,
        allowNull:false
    },
    readFlag: {
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false
    }


},{
    tableName: 'message',
    timestamps: false
})

module.exports =Message;