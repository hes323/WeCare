const {DataTypes} = require ('sequelize');
const sequelize = require('../db/dbconnection');

const Ratings = 
sequelize.define('Ratings',{
    
    ratingsId: {
        type: DataTypes.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true  
    },

    ratingsDescription: {
        type: DataTypes.TEXT,
        allowNull:false, 
    }
},{
    tableName: 'ratings',
    timestamps:false
}

)
module.exports = Ratings;
