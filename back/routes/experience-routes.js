const express = require('express');
const { addNewExperienceHandler,getAllExperience, getSpecificExperience} = require('../controller/experience-controller');
const router = express.Router();


router.post("/register-experience",addNewExperienceHandler);

router.get("/registered-experiences",getAllExperience);

router.get("/getSpecific-experience/:expId", getSpecificExperience)

module.exports = router;