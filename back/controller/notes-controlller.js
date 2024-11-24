const { exportDecryptedData, exportEncryptedData } = require('../auth/secure');
const Note = require('../model/Note')
const Notification = require('../model/Notification')
const { QueryTypes } = require('sequelize');
const Reminder = require('../model/Reminder')
const sequelize = require("../db/dbconnection");
const {  Op } = require('sequelize'); // Add Op here

exports.createNote = async (req,res,next) => {
    
    const {noteContent ,appointmentId,isPinned, createdBy} = req.body;
   
    const creator =  Number(await exportDecryptedData(createdBy.trim()));

    const decryptedAppointmentId = Number(await exportDecryptedData(appointmentId.trim()));
        
     try{
        const note = await Note.create({
            noteContent:noteContent,
            isPinned:isPinned,
            appointmentId:decryptedAppointmentId,
           createdBy:creator
        })

        
         // Check if the note creation was successful
         if (note) {
            return res.status(200).json({ message: 'Note created successfully' });
        } else {
            return res.status(404).json({ message: 'Failed to create note' });
        }

    }catch(error){
        // next(error);

        console.error('Error while creating note:', error); // Log the error
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message // Send the error message in the response for easier debugging
        });
    }


    
} 

exports.getALLNotes = async (req, res, next) => {
    const { userId } = req.params;  // Retrieve userId from params
    const creator =  Number(await exportDecryptedData(userId.trim())); // Ensure it's a number
    console.log(userId)
    console.log(creator);
    try {
        const retrievedNotes = await Note.findAll({
            where: {
                createdBy: creator, // Filter by createdBy
            },
           
            order: [
                ['isPinned', 'DESC'], // First order by isPinned
                ['updatedAt', 'DESC']  // Then order by updatedAt
            ],
            
        });
      
        const newnotesList = retrievedNotes.map(async (val) => {
            val["appointmentId"] = await exportEncryptedData(String(val.appointmentId));
            return val;
        })

        

        return res.status(200).send({
            isSuccess: true,
            message: "Successfully retrieved notes",
            notes: await Promise.all( newnotesList )
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

exports.getNotesWithSearch = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { appointmentId } = req.params;
    
        const creator = Number(await exportDecryptedData(userId.trim()));
        const appointment = Number(await exportDecryptedData(appointmentId.trim()));
    
        console.log(creator);
        console.log(appointment);
        console.log(appointment);
        console.log(appointment);

        const retrieveNotes = await sequelize.query(
            `SELECT * 
            FROM note
            WHERE createdBy = :id
                AND (CASE 
                        WHEN :appId = 0 THEN TRUE
                        ELSE appointmentId = :appId
                    END) 
            ORDER BY isPinned DESC, updatedAt DESC`, {
                replacements: { id: creator, appId: appointment},
                type: QueryTypes.SELECT
            }
        )
        
        res.status(201).send({
            isSuccess: true,
            message: "Successfully Retrieved Notes",
            data: retrieveNotes
        })

        console.log(retrieveNotes);
    } catch(e){
        next(e)
    }
}

exports.deleteNote = async (req,res,next,io) => {
    const {noteId} = req.body;

    try {
        // Start a transaction to ensure atomicity
        const result = await sequelize.transaction(async (transaction) => {
            // Step 1: Delete notifications connected to reminders linked to the note
            const deleteNotifications = await Notification.destroy({
                where: {
                    reminderId: {
                        [Op.in]: sequelize.literal(`(SELECT reminderId FROM Reminder WHERE noteId = ${noteId})`),
                    },
                },
                transaction,
            });
    
            console.log(`Deleted ${deleteNotifications} notifications.`);
    
            // Step 2: Delete reminders connected to the note
            const deleteReminders = await Reminder.destroy({
                where: {
                    noteId: noteId,
                },
                transaction,
            });
    
            console.log(`Deleted ${deleteReminders} reminders.`);
    
            // Step 3: Delete the note itself
            const deleteNote = await Note.destroy({
                where: {
                    noteId: noteId,
                },
                transaction,
            });
    
            if (deleteNote === 0) {
                throw new Error("Note not found."); // Roll back if the note does not exist
            }
    
            console.log("Deleted the note successfully.");

            io.emit('newNotifsReceived', {
                message: "New notifs received",
               
            });
    
            return deleteNote;
        });
    
        // Respond with success
        return res.status(200).send({
            isSuccess: true,
            message: "Note, reminders, and notifications successfully deleted.",
        });
    } catch (error) {
        // Handle errors and respond or pass to middleware
        console.error("Error during deletion:", error);
        return res.status(500).send({
            isSuccess: false,
            message: "An error occurred during deletion.",
        });
    }
    
}

exports.updateNote = async (req,res,next) => {
    const{noteId, isPinned} = req.body

    try {
      const result = await Note.update(
        {
          isPinned: isPinned,
        },

        {
          where: {
            noteId: noteId  // Update the note with the specific noteId
          }
        }
      );
      
      if(result[0] > 0 ){
        // Respond with success if a note was deleted
        return res.status(200).send({
            isSuccess: true,
            message: "Note successfully updated."
        })
      }

    } catch (error) {
      next(error);
    }
  };
  
