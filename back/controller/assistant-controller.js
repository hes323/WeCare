
const { QueryTypes } = require("sequelize");
const sequelize = require("../db/dbconnection");
const UserProfile = require("../model/UserProfile");
const Appointment = require("../model/Appointment");
const { exportEncryptedData, exportDecryptedData } = require("../auth/secure");

const showConnectedSeniorList = async(req,res,next)=>{
    try {
        const {userId} = req.user;
        const result = await sequelize.query(`
            select distinct e.userId, e.profileImage, 
            concat_ws(" ",e.firstname, e.lastname)
             from UserProfile e
            inner join Appointment f
            on e.userId = f.seniorId
            where f.assistantId = :userId
            and e.userType = 'senior'`,{
                replacements: {userId:userId},
                type: QueryTypes.SELECT
            })

        res.status(201).send({
            isSuccess: true,
            message: "Successfully retrieved Seniors who are connected to Assistant",
            data: result
        })
    }catch(e){
        next(e)
    }
}

const getSeniorListRequest = async(req,res,next)=>{
    try{
        const {userId} = req.user;
        const results = await sequelize.query(
            `SELECT u.userId, 
		        u.email, 
                u.profileImage, 
                u.gender, 
                CONCAT_WS(" ", u.firstName, u.lastName) AS fullName
                FROM userprofile u 
                INNER JOIN  appointment e ON e.seniorId = u.userId 
                WHERE u.userType = "senior" and e.statusId = 1  and e.assistantId = :userId `,{
                replacements: {userId:userId},
                type: QueryTypes.SELECT
            }   
        ) 

        console.log(results)

        const newResults = await results.map(async(val)=>{

            val.userId = await exportEncryptedData(String(val.userId));

            return val;
        })

        res.status(201).send({
            isSuccess: true,
            message: "Successfully retrieve data",
            data:await Promise.all(newResults)
        })
    }catch(e){
        next(e)
    }
}




module.exports = {
    showConnectedSeniorList
    ,getSeniorListRequest
}