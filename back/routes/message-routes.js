const express = require('express');
const upload = require('../config/multer');
const messageController = require('../controller/chat-controller');

const router = express.Router();

const setupMessageRoutes = (io) => {
    // Route to retrieve messages (no need for io)
    router.get('/', messageController.getMessages);

    // Route to send messages, passing io to the controller
    router.post('/', (req, res) => {
        messageController.sendMessage(req, res, io);  // io is passed to the controller
    });

    // Route to upload files, passing io to the controller
    router.post('/upload', upload.array('files'), (req, res) => {
        messageController.uploadFiles(req, res, io);  // io is passed to the controller
    });

    //Route to Update readFlg
    router.put('/updateReadFlg',(req,res)=>{
        messageController.updateMessageReadFlg(req,res)
    })

    
    //Route for getting the messages
    router.get('/room',messageController.retrieveRoomId)


    return router; // Return the router with all routes defined
};



module.exports = setupMessageRoutes;
