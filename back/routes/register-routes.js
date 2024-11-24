  const express = require('express');
  const multer = require('multer');
  const path = require('path');
  const fs = require('fs');
  const { addNewUserHandler, grabSession, fetchAllEmails } = require('../controller/user-controller');
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

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter
  }).fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'idDocImage', maxCount: 1 },
  ]);

 // const upload = multer({ storage: storage })

  // Apply multer middleware to handle file uploads for registering users
 // router.post("/register-user", upload.single('profileImage'), addNewUserHandler);  // Add upload.single for handling 'profileImage'

  router.post("/register-user", upload, addNewUserHandler);

  router.get("/register-user", grabSession);
  router.get("/get-all-email", fetchAllEmails);


  module.exports = router;

 