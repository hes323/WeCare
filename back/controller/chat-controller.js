const { Op } = require('sequelize');
const Message = require('../model/Message');
const { exportDecryptedData, exportEncryptedData } = require('../auth/secure');
const { Json } = require('sequelize/lib/utils');
const ChatRoom = require('../model/ChatRoom')
 

// Controller to handle retrieving messages
exports.getMessages = async (req, res,next) => {

    const { senderId, recipientId } = JSON.parse(req.headers.chatids);

    console.log(senderId,
        recipientId
        )
    const recipientIddecrypted = Number(await exportDecryptedData(recipientId.trim()));
    const senderIddecrypted = Number(await exportDecryptedData(senderId.trim()));

    try {
        let messages;
     
        if (senderIddecrypted && recipientIddecrypted) {
            // Fetch messages from the database that match the sender and recipient
            messages = await Message.findAll({
                where: {
                    [Op.or]: [
                        { senderId: senderIddecrypted, recipientId: recipientIddecrypted },
                        { senderId: recipientIddecrypted, recipientId: senderIddecrypted }
                    ]
                },
                order: [['date', 'ASC']], // Optional: Order by date
            });
        } 
        else {
            // Fetch all messages if no filters are applied
            messages = await Message.findAll();

        }
    
        const updatedMessages = messages.map(async(msg)=>{

            msg.dataValues['isForReceiver'] = Number(senderIddecrypted) !== Number(msg.dataValues.senderId);
            msg.dataValues['senderId'] = await exportEncryptedData(String(msg.dataValues.senderId));
            msg.dataValues['recipientId'] = await exportEncryptedData(String(msg.dataValues.recipientId));
            return msg.dataValues;

        })

        return res.status(200).send({
            isSuccess: true,
            message: "Successfully retrieve messages",
            messages: await Promise.all(updatedMessages)
        });
    } catch (error) {
        next(error)
    }
};

exports.retrieveRoomId = async (req, res, next) => {
    const { senderId, recipientId } = JSON.parse(req.headers.chatids);
    console.log(recipientId)
    console.log(senderId)
    const recipientIddecrypted = Number(await exportDecryptedData(recipientId?.trim()));
    const senderIddecrypted = Number(await exportDecryptedData(senderId?.trim()));

    try {
        // Check if the sender-receiver chat room exists
        let chatroomSenderReceiver = await ChatRoom.findOne({
            where: {
                senderId: senderIddecrypted,
                recipientId: recipientIddecrypted
            }
        });

        // If sender-receiver chat room does not exist, create it
        if (!chatroomSenderReceiver) {
            chatroomSenderReceiver = await ChatRoom.create({
                senderId: senderIddecrypted,
                recipientId: recipientIddecrypted
            });
            console.log("New chat room created for sender-receiver:", chatroomSenderReceiver.roomId);
        }

        // Return roomId in response
        return res.status(200).send({
            isSuccess: true,
            message: "Successfully retrieved room ID",
            roomId: chatroomSenderReceiver.dataValues.roomId // Directly return roomId
        });

    } catch (error) {
        next(error); // Pass error to the next middleware
    }
};


    const retrieveOrCreateChatRoom = async (senderId, recipientId) => {

    const recipientIddecrypted = Number(await exportDecryptedData(recipientId.trim()));
    const senderIddecrypted = Number(await exportDecryptedData(senderId.trim()));

    try {
        // Check if the sender-receiver chat room exists
        let chatroomSenderReceiver = await ChatRoom.findOne({
            where: {
                senderId: senderIddecrypted,
                recipientId: recipientIddecrypted
            }
        });

        // Check if the receiver-sender chat room exists
        let chatroomReceiverSender = await ChatRoom.findOne({
            where: {
                senderId: recipientIddecrypted,
                recipientId: senderIddecrypted
            }
        });

        // If sender-receiver chat room does not exist, create it
        if (!chatroomSenderReceiver) {
            chatroomSenderReceiver = await ChatRoom.create({
                senderId: senderIddecrypted,
                recipientId: recipientIddecrypted
            });
            console.log("New chat room created for sender-receiver:", chatroomSenderReceiver.roomId);
        }

        // If receiver-sender chat room does not exist, create it
        if (!chatroomReceiverSender) {
            chatroomReceiverSender = await ChatRoom.create({
                senderId: recipientIddecrypted,
                recipientId: senderIddecrypted
            });
            console.log("New chat room created for receiver-sender:", chatroomReceiverSender.roomId);
        }

        return { chatroomSenderReceiver, chatroomReceiverSender }; // Return both chat rooms

    } catch (error) {
        console.error('Error retrieving or creating chat room:', error);
        throw new Error('Failed to retrieve or create chat room');
    }
};


        // Controller to handle sending messages
        exports.sendMessage = async (message, io) => {
            const { senderId, recipientId, messageContent, contentType } = message;

            // Proceed with decryption and other logic as before
            const recipientIddecrypted = Number(await exportDecryptedData(recipientId));
            const senderIddecrypted = Number(await exportDecryptedData(senderId));
            const { chatroomSenderReceiver, chatroomReceiverSender } = await retrieveOrCreateChatRoom(senderId, recipientId);

            try {
                const currentDate = new Date();
                const date = currentDate;
                const time = currentDate.toTimeString().split(' ')[0]; // Format as HH:MM:SS
                const roomIdSender = chatroomSenderReceiver.dataValues.roomId;
                const roomIdReceiver = chatroomReceiverSender.dataValues.roomId;

                const messageData = await Message.create({
                    senderId: senderIddecrypted,
                    recipientId: recipientIddecrypted,
                    messageContent,
                    contentType,
                    roomId: roomIdSender,
                    date,
                    time,
                });

                // Encrypt the senderId and recipientId
                messageData.dataValues['senderId'] = await exportEncryptedData(String(messageData.dataValues.senderId));
                messageData.dataValues['recipientId'] = await exportEncryptedData(String(messageData.dataValues.recipientId));
                 
                messageData.dataValues['isForReceiver'] = false;
                io.to(roomIdSender).emit('receiveMessage',messageData);

              
                messageData.dataValues['isForReceiver'] = true;
                io.to(roomIdReceiver).emit('receiveMessage',messageData);

                io.emit('newMessageReceived', {
                    message: "New message received"        
                });

            } catch (error) {
                console.error('Error sending message:', error);
                return { error: 'Error sending message' }; // Or throw the error
            }
        };

        exports.updateMessageReadFlg = async (req, res) => {
            try {
              const { messageId } = req.body;  // Get messageId from request params
              const  readFlag  = true;     
          
              // Update the message's readFlag field
              const updatedRows = await Message.update(
                { readFlag }, 
                {
                  where: { messageId } // Condition to find the message
                }
              );
          
              // Check if the update was successful
              if (updatedRows[0] > 0) {
                return res.status(200).json({ message: 'Message updated successfully' });
              } else {
                return res.status(404).json({ message: 'Message not found' });
              }
            } catch (error) {
              console.error(error);
              return res.status(500).json({ message: 'An error occurred while updating the message', error });
            }
          };


exports.uploadFiles = async (req, res, io) => {
    if (req.files && req.files.length > 0) {
        const messages = [];
        const recipientIddecrypted = Number(await exportDecryptedData(req.body.recipientId));
        const senderIddecrypted = Number(await exportDecryptedData(req.body.senderId));
        const { chatroomSenderReceiver, chatroomReceiverSender } = await retrieveOrCreateChatRoom(req.body.senderId,req.body.recipientId);
        const roomIdSender = chatroomSenderReceiver.dataValues.roomId
        const roomIdReceiver =chatroomReceiverSender.dataValues.roomId

        try {
            for (const file of req.files) {
                const currentDate = new Date();
                const date = currentDate;
               
                    const time = currentDate.toTimeString().split(' ')[0]; // Format as HH:MM:SS

                const datePath = date.toISOString().split('T')[0]; // Date folder format
                const filePath = `/uploads/${datePath}/${file.filename}`; // Path for file

                // Determine if the file is an image or not
                let contentType;
                if (file.mimetype.startsWith('image/')) {
                    contentType = 'picture'; // Set as 'picture' if it's an image
                } else {    
                    contentType = 'file'; // Set as 'file' for non-image files
                }

                const message = {
                    senderId: senderIddecrypted,
                    recipientId: recipientIddecrypted,
                    messageContent: filePath,
                    contentType, // Save either 'picture' or 'file' based on file type
                    roomId:roomIdSender,
                    date,
                    time
                };

                const savedMessage = await Message.create(message);
                messages.push(savedMessage);


                 // Encrypt the senderId and recipientId
                 savedMessage.dataValues['senderId'] = await exportEncryptedData(String(savedMessage.dataValues.senderId));
                 savedMessage.dataValues['recipientId'] = await exportEncryptedData(String(savedMessage.dataValues.recipientId));
                  
                 savedMessage.dataValues['isForReceiver'] = false;
                 io.to(roomIdSender).emit('receiveMessage',savedMessage);
 
               
                 savedMessage.dataValues['isForReceiver'] = true;
                 io.to(roomIdReceiver).emit('receiveMessage',savedMessage);

                  // Emit to fetch new messages
                    io.emit('newMessageReceived', {
                        message: "New message received"
                    });
 
            }

        } catch (error) {
            console.error('Error sending message:', error);
            return { error: 'Error sending message' }; // Or throw the error
        }
    } else {
        return res.status(400).send('No files uploaded');
    }
};


