const express = require('express');
const auth = require("../auth/auth");
const { showConnectedSeniorList , getSeniorListRequest} = require('../controller/assistant-controller');

const router = express.Router();

router.get("/connected/senior-list",auth.verify,auth.verifyAssistant,showConnectedSeniorList);

router.get("/senior-list-request",auth.verify,getSeniorListRequest);

module.exports = router;