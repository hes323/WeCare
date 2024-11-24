const express = require('express');
const {
    addNewBarangayFuncHandler,
    getAllBarangays,
    getSpecificBrangay, 
    deleteSpecificBrg } = require('../controller/barangay-controller');
const router = express.Router();

router.post("/register-barangay",addNewBarangayFuncHandler);

router.get("/registered-barangays",getAllBarangays);

router.get("/getSpecific-barangay/:brgId", getSpecificBrangay);

router.delete("/delete-specific-brg/:brgId",  deleteSpecificBrg);

module.exports = router;