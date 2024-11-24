const { QueryTypes } = require("sequelize");
const sequelize = require("../db/dbconnection");
const Appointment = require("../model/Appointment");
const UserProfile = require("../model/UserProfile");
const User = require("../model/User");
const { exportEncryptedData, exportDecryptedData } = require("../auth/secure");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const adminHeaderCardsDetails = async( req,res,next)=>{
    try{

        const adminCardDetails = await sequelize.query(
            `select (select count(e.userId) 
            from UserProfile e
            where e.userType <> 'admin'
            and e.deleteFlg = false)
            as users, (select count(e.appointmentId) 
            from Appointment e)
            as assistance,
            (select count(e.userId) from UserProfile e
            WHERE DATEDIFF(CURDATE(), e.registerDate) <= 30
             and e.userType = 'assistant'
            or e.userType = 'senior') as newUsers
            from UserProfile f
            where f.userType = 'admin' limit 1`,
            {type:QueryTypes.SELECT}
        )

        res.status(200).send({
            isSuccess: true,
            message: "Successfully retrieve Admin Dashboard Details",
            data: adminCardDetails
        })

    }catch(e){
        next(e)
    }
}

const manageRatings = async( req,res,next)=>{
    try{    
        res.status(200).send({
            isSuccess: true,
            message: "Successfully remove ratings",
            
        })

    }catch(e){
        next(e)
    }
}

const showRatings = async(req,res,next)=>{
    try{

    }catch(e){
        next(e)
    }
}

const manageUsers = async(req,res,next)=>{
    try{
        const {userId,operation} = req.params;
        // const {password} = req.body;
        const newUserId = await exportDecryptedData(userId);
        const action = operation === "delete" ? "Deleted" : "Updated";
    
        if(operation === "delete"){
            await UserProfile.update({
                deleteFlg: true
            },{
                where:{
                    userId:+newUserId
                }
            })
        }else {
            await User.update({
                password: await bcrypt(password,saltRounds)
            },{
                where:{
                    userId:+newUserId
                }
            })
        }
        

        res.status(200).send({
            isSuccess: true,
            message: `User is Successfully ${action}!`
        })
    }catch(e){
        console.log(e.message);
        next(e)
    }
}

const showUsers = async(req,res,next)=>{
    try{

        const allSeniors = await sequelize.query(`
            select e.userId, 
            (concat_ws(" ",e.firstname, e.lastname)) as fullName, e.email, 
            e.userType, e.approveFlg,
            (case
            when (select count(f.appointmentId) from appointment f 
            where f.seniorId = e.userId 
            or f.assistantId = e.userId
            and f.statusId < 3
            and f.endDate <= curdate()) > 0 then false
            else true 
            end) as canBeDeleted from userprofile e
            where e.userType = 'senior'
            and e.deleteFlg = false;
            `,{
                type: QueryTypes.SELECT
            })


        const allAssistants = await sequelize.query(`
            select e.userId, 
            (concat_ws(" ",e.firstname, e.lastname)) as fullName, e.email, 
            e.userType, e.approveFlg,
            (case
            when (select count(f.appointmentId) from appointment f 
            where f.seniorId = e.userId 
            or f.assistantId = e.userId
            and f.statusId < 3
            and f.endDate <= curdate()) > 0 then false
            else true 
            end) as canBeDeleted from userprofile e
            where e.userType = 'assistant'
            and e.deleteFlg = false;
            `,{
                type: QueryTypes.SELECT
            })

        const newSeniors = allSeniors?.map(async(val)=>{

            val["userId"] = await exportEncryptedData(String(val.userId))
            return val;
        })

        const newAssistants = allAssistants?.map(async(val)=>{
            val["userId"] = await exportEncryptedData(String(val.userId))
            return val;
        })
        
        res.status(201).send({
            isSuccess: true,
            message: "Successfully retrieve all Users",
            data:{
                seniors: await Promise.all(newSeniors),
                assistants: await Promise.all(newAssistants)
            }
        })
    }catch(e){
        next(e)
    }
}

const showPendingListOfAssistantAccountApplication = async(req,res,next)=>{
    try{

        const assistantListPending = await sequelize.query(`
            select e.userId, (concat_ws(" ",e.firstname,
            e.lastname)) as fullName,
            e.profileImage,
            e.approveFlg from UserProfile e
            where e.userType = 'assistant'
            and e.approveFlg = false
            and e.deleteFlg = false`,
        {
            type:QueryTypes.SELECT
        })

        const newAssistantList = assistantListPending.map(async(val)=>{
            val["userId"] = await exportEncryptedData(String(val.userId));
            return val;
        })

        const assistantListApproved = await sequelize.query(`
            select e.userId, (concat_ws(" ",e.firstname,
            e.lastname)) as fullName,
            e.profileImage,
            e.approveFlg from UserProfile e
            where e.userType = 'assistant'
            and e.approveFlg = true
            and e.deleteFlg = false`,
        {
            type:QueryTypes.SELECT
        })

        const newAssistantListApproved = assistantListApproved.map(async(val)=>{
            val["userId"] = await exportEncryptedData(String(val.userId));
            return val;
        })

        res.status(201).send({
            isSuccess: true,
            message: "Successfully retrieve list of unverified Assistants",
            data:{assistantListPending: await Promise.all(newAssistantList),
                assistantListApproved: await Promise.all(newAssistantListApproved)
            }
        })

    }catch(e){
        next(e)
    }
}

const validateAssistantAccountRegisteration = async(req,res,next)=>{
    try{
        const {userId,decision} = req.body;
        const decryptedUserId = await exportDecryptedData(userId);

        if(decision==="approve"){
            await UserProfile.update({
                approveFlg: true
            },{
                where:{
                    userId:decryptedUserId
                }
            })
        }else {
            await UserProfile.update({
                deleteFlg: true
            },{
                where:{
                    userId:decryptedUserId
                }
            })
        }

        res.status(201).send({
            isSuccess: true,
            message: `Successfully ${decision === "approve" ? "Approved":"Rejected"} Assistant Application in the platform`
        })
    }catch(e){
        next(e)
    }
}

const showPendingAssistantData = async (req,res,next)=>{
    try{
        const {applicantId} = req.params;
        const decryptedUserId = await exportDecryptedData(applicantId)
        
        const pulledData = await sequelize.query(`
            
            select e.userId, concat_ws(" ",e.firstname,e.lastname) as fullName,
            e.profileImage,(TIMESTAMPDIFF (YEAR, e.birthDate, CURDATE()) ) as age,
            e.email,e.contactNumber, f.experienceDescription,f.rate,e.registerDate 
            from userprofile e
            left join experience f
            on e.experienceId = f.experienceId
            where e.userId = :userId;`,{
                replacements:{userId:+decryptedUserId},
                type: QueryTypes.SELECT
            })
        
            console.log(pulledData)
        const user = await UserProfile.findOne({
            where:{
                userId: decryptedUserId
            }
        })

        user.dataValues["userId"] = applicantId;

        
        res.status(201).send({
            isSuccess: true,
            message: "Successfully Retrieved Applicant's Information",
            data: user.dataValues
        })
    }catch(e){
        next(e)
    }
}

const updateUserPassword = async( req,res,next)=>{


    try{
        const {userId} = req.params
        const {password,confirmPassword}=  req.body;

        const decryptedUserId = await exportDecryptedData(userId)
        if(password === confirmPassword){

            await UserProfile.update({
                password: await bcrypt.hash(password,saltRounds)
            },{
                where:{
                    userId:+decryptedUserId
                }
            })
            res.status(201).send({
                isSuccess: true,
                message: "Successfully Updated User Password!"
            })
        }else {
            
            res.status(200).send({
                isSuccess: false,
                message: "Passwords don't match! Please Try again"
            })
        }


    }catch(e){
        next(e);
    }
}





module.exports = {
    adminHeaderCardsDetails,
    manageRatings,
    showRatings,
    manageUsers,
    showUsers,
    showPendingListOfAssistantAccountApplication,
    validateAssistantAccountRegisteration,
    showPendingAssistantData,
    updateUserPassword,
}