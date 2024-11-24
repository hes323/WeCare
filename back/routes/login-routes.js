const express = require('express');
const { authenticationHandler } = require('../controller/user-controller');

const router = express.Router();

router.post("/login-user",authenticationHandler);
    
module.exports = router;
