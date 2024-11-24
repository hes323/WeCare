const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // Import UUID

// Create a storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const date = new Date();
        const datePath = path.join(__dirname, '../uploads', date.toISOString().split('T')[0]); // YYYY-MM-DD
        fs.mkdirSync(datePath, { recursive: true }); // Create directory if it doesn't exist
        cb(null, datePath);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename using UUID
        const uniqueFilename = `${uuidv4()}_${file.originalname}`; // UUID + original file name
        cb(null, uniqueFilename);
    },
});

const upload = multer({ storage });
module.exports = upload;
