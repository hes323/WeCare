const Experience = require("../model/Experience");
const addNewExperienceHandler=async(req,res,next)=>{

    try{
        const {numOfYears,experienceDescription,rate } = req.body;
        await Experience.create({numOfYears,experienceDescription,rate});

        res.status(200).send({
            isSuccess: true,
            message: "Successfully Registered Experience"
        })
    }catch(e){
        next(e);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
    }
} 

const getAllExperience = async(req,res,next)=>{
    try{
        const experienceList = await Experience.findAll();

        res.status(200).send({
            isSuccess: true,
            message: "Successfully Retrieve Experince List",
            data: experienceList
        })
    }catch(e){
        next(e);
    }
}

const getSpecificExperience = async(req,res,next)=>{
    try {
        // Retrieve the ID from req.params
        const expId = req.params.expId;

        // Find the barangay by primary key
        const experienceResult = await Experience.findByPk(expId);

        if (!experienceResult) {
            return res.status(404).send({
                isSuccess: false,
                message: "Barangay not found"
            });
        }

        res.status(200).send({
            isSuccess: true,
            message: "Successfully retrieved experience",
            data: experienceResult
        });
    } catch (e) {
        next(e);
    }
}

module.exports = {
    addNewExperienceHandler,
    getAllExperience,
    getSpecificExperience
}

