const express = require('express');
const { processPayment } = require('../controller/payment-controller');
const auth= require("../auth/auth");
const router = express.Router();

router.post("/process-payment",auth.verify,auth.verifySenior,processPayment);


module.exports = router;