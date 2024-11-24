const { DataTypes} = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../db/dbconnection')
const User = require('./User')


const ChatRoom = sequelize.define('ChatRoom',{
    roomId:{
        type: DataTypes.UUID,
        defaultValue: uuidv4, 
        allowNull:false,
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

},{
    tableName: 'chatroom',
    timestamps: false
})

module.exports = ChatRoom;