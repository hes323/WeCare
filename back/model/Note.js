const { DataTypes} = require('sequelize');
const sequelize = require('../db/dbconnection')
const Appointment = require('./Appointment')
const User = require("./UserProfile")


const Note = sequelize.define('Note',{
    noteId:{
        type: DataTypes.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },

   noteContent:{
        type:DataTypes.TEXT,
        allowNull:false   
        }  
    ,
    
    isPinned:{
        type:DataTypes.BOOLEAN,
        allowNull:false,   
        defaultValue:false
        
    },

    appointmentId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references: {
            model: Appointment,
            key : 'appointmentId'
        }
      },

      createdBy:{
        type:DataTypes.INTEGER,
        allowNull:false,   
        references: {
            model: User,
            key : 'userId'
        }
    },

},{
    tableName: 'note',
    timestamps: true
})

// Set up associations
Appointment.hasMany(Note, {
    foreignKey: 'appointmentId',
    sourceKey: 'appointmentId'
});

module.exports = Note;