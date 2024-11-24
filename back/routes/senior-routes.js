const express = require('express');
const auth = require("../auth/auth");
const { findAssistantsForSenior,getAssistantList, addSenior, getAssistantDetailsBasedOnAppId } = require('../controller/senior-controller');
const router = express.Router();

router.get("/find-assistants",auth.verify,
    auth.verifySenior,findAssistantsForSenior)
    
router.get("/assistant-list",auth.verify,auth.verifySenior,getAssistantList);

router.post("/add-senior", addSenior);

router.get("/assistant-details/:appId",auth.verify,auth.verifySenior,getAssistantDetailsBasedOnAppId);

module.exports = router;