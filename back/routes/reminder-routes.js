const express = require('express');
const {createReminder} = require("../controller/reminder-controller");
const router = express.Router();

router.post("/createReminder",createReminder);

module.exports= router;

