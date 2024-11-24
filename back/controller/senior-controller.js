const UserProfile = require("../model/UserProfile");
const Ratings = require("../model/Ratings");
const Senior = require("../model/Senior");
const Relationship = require("../model/Relationship");
const {QueryTypes} = require("sequelize");
const sequelize = require("../db/dbconnection");
const { exportEncryptedData, exportDecryptedData } = require("../auth/secure");

const findAssistantsForSenior = async(req,res,next)=>{
    const {rating,age,gender}=req.query;

    try{ 
        
        const newAge = age ? age.split("-").map(val=>+val) : [0,0];
        let newGender = null;

        if(gender === "both" || gender === 'null'){
            newGender = null;
        }else {
            newGender = gender
        }
        const results = await sequelize.query(
            `SELECT 
    ea.userId,
ea.email,
ea.profileImage,
ea.gender,
CONCAT_WS(' ', ea.firstName, ea.lastName) AS fullName,
(
        SELECT ROUND(AVG(ar.ratingsId), 1) 
        FROM appointmentratings ar
        JOIN appointment f ON ar.appointmentId = f.appointmentId
        WHERE f.assistantId = ea.userId
    ) AS rateAvg,
     (
 SELECT count(ar.appointmentId) 
        FROM appointmentratings ar
        JOIN appointment f ON ar.appointmentId = f.appointmentId
        WHERE f.assistantId = ea.userId
) as countRatings,
e.experienceDescription, 
e.numOfYears, 
e.rate,
CONCAT_WS(" ", b.barangay, ea.street)
AS assistantAddress,
(SELECT COUNT(*) FROM ratings 
r WHERE r.ratingsId = ea.userId) AS reviews,
TIMESTAMPDIFF(YEAR, ea.birthDate, CURDATE()) AS 
assistantAge 
FROM userprofile ea
INNER JOIN experience e 
ON e.experienceId = ea.experienceId 
INNER JOIN barangay b 
ON b.barangayId = ea.barangayId 
WHERE ea.userType = 'assistant'
  AND ea.approveFlg = true
 AND (
              :rating = 0 OR (
                  SELECT ROUND(AVG(ar.ratingsId), 1)
                  FROM appointmentratings ar
                  JOIN appointment f ON ar.appointmentId = f.appointmentId
                  WHERE f.assistantId = ea.userId
              ) = :rating
          )

and (
    (
    :age is null or :ageTwo is null or :ageOne is null or
    ((SELECT DATE_FORMAT(FROM_DAYS(DATEDIFF(NOW(),ea.birthDate)), '%Y') 
    + 0)>= :ageOne
    and
    (SELECT DATE_FORMAT(FROM_DAYS(DATEDIFF(NOW(),ea.birthDate)), '%Y') 
    + 0)<= :ageTwo)
    )
)
AND (
    :gender IS NULL OR LOWER(ea.gender) = :gender
)
    ;`,{
    replacements:{
        rating:rating,
        age:age,
        ageOne: newAge[0] || null,
        ageTwo: newAge[1] || null,
        gender: newGender
    },
                type: QueryTypes.SELECT
            }   
        )   

        res.status(201).send({
            isSuccess: true,
            message: "Successfully retrieve data",
            data:results
        })
    }catch(e){
        next(e);
    }
}

const getAssistantList = async(req,res,next)=>{
    try{
        const results = await sequelize.query(
            `SELECT u.userId, u.email, u.profileImage, 
            u.gender, CONCAT_WS(" ", u.firstName, 
            u.lastName) AS fullName, e.experienceDescription, 
            e.numOfYears, e.rate, CONCAT_WS(" ", b.barangay, u.street)
             AS assistant_address, 
             (SELECT ROUND(AVG(ar.ratingsId), 1) 
                FROM appointmentratings ar
                JOIN appointment f ON ar.appointmentId = f.appointmentId
                WHERE f.assistantId = u.userId
            ) AS rateAvg,
             (SELECT count(ar.appointmentId)
                FROM appointmentratings ar
                JOIN appointment f ON ar.appointmentId = f.appointmentId
                WHERE f.assistantId = u.userId
            ) AS countRatings,
             TIMESTAMPDIFF(YEAR, u.birthDate, CURDATE()) AS 
             assistant_age FROM userprofile u INNER JOIN 
             experience e ON e.experienceId = u.experienceId 
             INNER JOIN barangay b ON b.barangayId = u.barangayId 
             WHERE u.userType = "assistant" AND approveFlg = true` ,{
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

const addSenior = async(req,res,next)=>{
    const t = await sequelize.transaction();

    try{
        const { userId, seniorNumber, 
            prescribeMeds, healthStatus, 
            remarks } = req.body;

            const result = await sequelize.transaction(async t=> {
                const newSenior = await Senior.create({
                    userId:userId,
                    seniorNumber:seniorNumber,
                    prescribeMeds:prescribeMeds,
                    healthStatus:healthStatus,
                    remarks:remarks
                }, {transaction: t });

                return newSenior;
            })

            res.status(200).send({
                isSuccess:true,
                message:"Successfully Registered New Senior"
            })
    } catch(e){
        next(e);
    }
}


const getAssistantDetailsBasedOnAppId=async(req,res,next)=>{
    const {appId} = req.params;
    try{

        const appIdConverted = await exportDecryptedData(appId);

        const result = await sequelize.query(`
            select e.userId,e.profileImage,
             concat_ws(" ",e.firstName,e.lastName) 
            as fullName from userprofile e
            inner join appointment f
            on e.userId = f.assistantId
            where f.appointmentId = :appId`,
        {
            replacements:{appId:+appIdConverted},
            type:QueryTypes.SELECT
        })

        result[0]["userId"] = await exportEncryptedData(String(result[0]["userId"]));
        const parsedResult = result[0];
    
        res.status(200).send({
            isSuccess: true,
            message: "Assistant Details is displayed",
            data: parsedResult
        })

    }catch(e){
        next(e);
    }
}

module.exports = {
    findAssistantsForSenior,
    getAssistantList,
    addSenior,
    getAssistantDetailsBasedOnAppId
}