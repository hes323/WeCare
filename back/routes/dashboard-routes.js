const express = require('express');
const router = express.Router();
const auth = require("../auth/auth");
const { retrieveListUserDetails } = require('../controller/user-controller');

router.get("/user-details/list",auth.verify,retrieveListUserDetails);

module.exports = router;