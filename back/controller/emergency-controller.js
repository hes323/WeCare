const sequelize = require("../db/dbconnection");
const emergencyContacts = require("../model/EmergencyContacts");
const userProfile = require("../model/UserProfile");


const addEmergencyContact = async(req, res, next) => {
    try {
        let {
            name, phone, 
            email, address, latitude,
            longtitude
        } = req.body;

    // Handle profile image file if uploaded (assume using something like multer)
    let emergencyImage = null;
    if (req.file) {
        // profileImagePath = req.file.path; Save file path if uploaded
        emergencyImage = req.file.path.split('profilePictures')[1];
    }

    // Start a transaction and create the emergency contact
    const addedNewEmergency = await sequelize.transaction(async (transaction) => {
        return await emergencyContacts.create({
            name,
            phone,
            email,
            address,
            emergencyImage: emergencyImage || null,
            latitude,
            longtitude
        }, { transaction });
    });


    res.status(200).send({
        isSuccess: true,
        message: "Successfully Registered New Emergency"
    });
        
    } catch(e){
    console.log(e);  // Log the error for debugging
    next(e);  // Pass the error to the next middleware (e.g., error handler)
    }
}

const showAllEmergencyContacts = async (req, res, next) => {
    try {
        const allContactEmergency = await emergencyContacts.findAll();

        res.status(200).send({
            isSuccess: true,
            message: "Successfully fetched all emergency contacts",
            data: allContactEmergency  // Send the retrieved contacts in the response
        });
    } catch (e) {
        console.log(e);  // Log the error for debugging
        next(e);  // Pass the error to the next middleware (e.g., error handler)
    }
};

const deleteEmergencyContacts = async (req, res, next) => {
    try{
        const { emergencyId } = req.params;

         // Delete the contact with the specified emergencyId
         const deleteResult = await emergencyContacts.destroy({
            where: { emergencyId }
        });

        if (deleteResult) {
            res.status(200).send({
                isSuccess: true,
                message: "Emergency contact deleted successfully"
            });
        } else {
            res.status(404).send({
                isSuccess: false,
                message: "Emergency contact not found"
            });
        }
        
    } catch (e) {
        console.log(e);  // Log the error for debugging
        next(e);  // Pass the error to the next middleware (e.g., error handler)
    }
}

const findSpecificEmergencyContacts = async (req, res, next) => {
    try {
        const { emergencyId } = req.params;

        const findSpecificData = await emergencyContacts.findByPk(emergencyId);

        if(findSpecificData){
            res.status(200).send({
                isSuccess: true,
                message: "Found Specific Emergency Contact",
                data: findSpecificData
            });
        } else {
            res.status(404).send({
                isSuccess: false,
                message: "Emergency contact not found"
            });
        } 

    } catch (e) {
        console.log(e);  // Log the error for debugging
        next(e);  // Pass the error to the next middleware (e.g., error handler)
    }
}

const updateEmergencyContacts = async (req, res, next) => {
    try {
        const { emergencyId } = req.params;
        let { 
            name, phone, email,
            address,
            latitude, longtitude
        } = req.body;

        // Handle profile image file if uploaded (assume using something like multer)
        let emergencyImage = null;
        if (req.file) {
            // profileImagePath = req.file.path; Save file path if uploaded
            emergencyImage = req.file.path.split('profilePictures')[1];
        }
        
        let updateData = {
            name,
            phone,
            email,
            address,
            latitude,
            longtitude,
            emergencyImage
        }

        const updateContactEmergency = await emergencyContacts.update(updateData, {
            where:{emergencyId}
        });

        res.status(200).send({
            isSuccess: true,
            message: "Emergency Contact Data Updated",
            data: updateContactEmergency?.dataValues
        });
    } catch (e) {
        console.log(e);  // Log the error for debugging
        next(e);  // Pass the error to the next middleware (e.g., error handler)
    }
}


module.exports = {
    addEmergencyContact,
    showAllEmergencyContacts,
    deleteEmergencyContacts,
    updateEmergencyContacts,
    findSpecificEmergencyContacts
}