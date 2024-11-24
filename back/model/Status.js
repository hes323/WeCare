const {DataTypes} = require ('sequelize');
const sequelize = require('../db/dbconnection');

const Status =
sequelize.define('Status',{
    
    statusId: {
        type: DataTypes.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true,
     
    },
    statusDescription: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    tableName: 'status',
    timestamps:false
}

)
module.exports = Status;