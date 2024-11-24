const express = require('express');
const auth = require("../auth/auth");
const multer = require("multer");
const path = require('path');
const fs = require('fs');
const { getUserDataUsingAuthenticationToken,
  updateUserHandlerForProfile,retrieveListUserDetails,processProfile,
getAssistantDetails, sendTestEmail, sendEmailForgotPassword, addNewAdmin } = require('../controller/user-controller');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Create a storage engine
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//       const date = new Date();
//       const datePath = path.join(__dirname, '../profilePictures', date.toISOString().split('T')[0]); // YYYY-MM-DD
//       fs.mkdirSync(datePath, { recursive: true }); // Create directory if it doesn't exist
//       cb(null, datePath);
//   },
//   filename: (req, file, cb) => {
//       // Generate a unique filename using UUID
//       const uniqueFilename = `${uuidv4()}_${file.originalname}`; // UUID + original file name
//       cb(null, uniqueFilename);
//   },
// });

// Create a storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const date = new Date();
    const basePath = file.fieldname === 'idDocImage' ? '../idDocImage' : '../profilePictures';
    const datePath = path.join(__dirname, basePath, date.toISOString().split('T')[0]); // YYYY-MM-DD
    fs.mkdirSync(datePath, { recursive: true }); // Create directory if it doesn't exist
    cb(null, datePath);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using UUID
    const uniqueFilename = `${uuidv4()}_${file.originalname}`; // UUID + original file name
    cb(null, uniqueFilename);
  },
});

// File filter for validation
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Only .png and .jpg files are allowed!'), false);
  }
  cb(null, true);
};

// Multer instance with fields
const upload = multer({
  storage: storage,
  fileFilter: fileFilter
}).fields([
  { name: 'idDocImage', maxCount: 1 },
  { name: 'profileImage', maxCount: 1 },
]);

// Multer instance to handle multiple files
// const upload = multer({
//   storage: storage,
// }).fields([
//   { name: 'idDocImage', maxCount: 1 },
//   { name: 'profileImage', maxCount: 1 },
// ]);

// const upload = multer({ storage: storage })

router.get("/produce-admin", addNewAdmin);

router.get("/test-mail", sendTestEmail);

router.post("/forgot-password", sendEmailForgotPassword);

router.get("/user-profile",auth.verify,getUserDataUsingAuthenticationToken);

// router.put("/user-profile/update",auth.verify,updateUserHandlerForProfile);
// router.put("/user-profile/update", auth.verify, upload.single('profileImage'), updateUserHandlerForProfile);
router.put("/user-profile/update", auth.verify, upload, updateUserHandlerForProfile);

router.get("/user-list",auth.verify,retrieveListUserDetails);

// router.post("/user-profile",upload.single('profileImage'),processProfile);
router.post("/user-profile", upload, processProfile);

router.get("/assistant-details/:assistantId",auth.verify,auth.verifySenior,getAssistantDetails)


module.exports = router;