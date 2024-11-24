const express = require('express');
const auth = require("../auth/auth");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { addEmergencyContact, showAllEmergencyContacts, 
  deleteEmergencyContacts, updateEmergencyContacts, findSpecificEmergencyContacts } = require('../controller/emergency-controller');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

  // Create a storage engine
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const date = new Date();
        const datePath = path.join(__dirname, '../profilePictures', date.toISOString().split('T')[0]); // YYYY-MM-DD
        fs.mkdirSync(datePath, { recursive: true }); // Create directory if it doesn't exist
        cb(null, datePath);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename using UUID
        const uniqueFilename = `${uuidv4()}_${file.originalname}`; // UUID + original file name
        cb(null, uniqueFilename);
    },
  });

  const upload = multer({ storage: storage })

  router.post("/register-emergency-hotline", auth.verify, auth.verifyAdmin, upload.single('emergencyImage'), addEmergencyContact);
  router.delete("/delete-emergency/:emergencyId", auth.verify, auth.verifyAdmin, deleteEmergencyContacts);
  router.get("/get-emergency", auth.verify, showAllEmergencyContacts);
  router.get("/get-specific-emergency/:emergencyId", auth.verify, findSpecificEmergencyContacts)
  router.put("/update-emergency/:emergencyId", auth.verify, auth.verifyAdmin, upload.single('emergencyImage'), updateEmergencyContacts);

  module.exports = router;