const {DataTypes} = require ('sequelize');
const sequelize = require('../db/dbconnection');
const userprofile = require('./UserProfile')

const User = 
sequelize.define('User', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:userprofile,
            key: 'userId'
            },
        primaryKey:true

        },

        email:{
            type:DataTypes.STRING,
            allowNull:false,
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

        password:{
            type:DataTypes.STRING,
            allowNull:false,
            validate:{
                len:{
                    max:255,
                    msg:"Password length must be between 8 - 15 characters"
                }
            }

        }
    
},{
    tableName: 'user',
    timestamps:false
}

)
module.exports = User;
