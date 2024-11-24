const {DataTypes} = require ('sequelize');
const sequelize = require('../db/dbconnection');
const experience = require("./Experience")
const barangay = require('./Barangay')

const UserProfile = 
sequelize.define('UserProfile',{
    userId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,   
        autoIncrement: true
    },

    lastname :{
        type:DataTypes.STRING,
        allowNull : true,
        validate:{
            len:{
                max: 255,
                msg:"Last Name length must have a maximum of 255 characters"
            }
        }
    },

    firstname :{
        type:DataTypes.STRING,
        allowNull : false,
        validate:{
            len:{
                min:2,
                max: 255,
                msg:"First Name length must be between 2 - 255 characters"
            }
        }
    },

    email:{
        type: DataTypes.STRING,
        allowNull : false,
        unique:true,
        validate:{
            len:{
                min:10,
                max: 255,
                msg:"Email Address length is invalid."
            },
            isEmail:{
                msg: "Invalid Email Format"
            }
        }
    },

    userType:{
        type:DataTypes.STRING,
        allowNull : false,     
    },

    street:{
        type: DataTypes.TEXT,
        allowNull : false,
    },

    barangayId:{
        type: DataTypes.INTEGER,
        allowNull : true,
        references:{
            model:barangay,
            key:'barangayId'
        },
        defaultValue: 0
    },

    contactNumber:{
        type: DataTypes.STRING,
        allowNull : false,
        validate:{
            len: {
                min: 11,
                max: 12,
                 msg: "Phone Number must be between 11 - 12 characters"
            }
        }
    },
    gender:{
        type: DataTypes.STRING,
        allowNull : false,
    },

    birthDate:{
        type: DataTypes.DATE,
        allowNull : false,
    },

     experienceId : {
        type: DataTypes.INTEGER,
        allowNull:true,
        references: {
            model: experience, 
            key: 'experienceId' 
          },
          defaultValue:0

    },
    profileImage:{
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
    },
    idDocImage:{
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
    },
    registerDate: {
        type:DataTypes.DATE,
        allowNull : false,      
        defaultValue: new Date()
    },
    approveFlg: {
        type:DataTypes.BOOLEAN,
        allowNull : false,
        defaultValue: false
    },
    deleteFlg:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
},{
    tableName: 'userprofile',
    timestamps:false    
}

)
module.exports = UserProfile;
