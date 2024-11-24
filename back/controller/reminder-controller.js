const Reminder = require("../model/Reminder");
const { exportDecryptedData, exportEncryptedData } = require('../auth/secure');
const moment = require('moment-timezone'); // Include moment-timezone library

exports.createReminder = async (req, res, next) => {
    const { noteId, reminderDate, reminderTime ,appointmentId
    } = req.body;

    try {
        console.log(noteId);

        // Combine reminderDate and reminderTime to create a full date-time string
        // e.g., reminderDate: "2024-11-13", reminderTime: "21:56:00"
        const reminderDateTimeStr = `${reminderDate}T${reminderTime}`; // "2024-11-13T21:56:00"

        // Convert reminderDateTimeStr from Philippine Time (Asia/Manila) to UTC
        const reminderTimeUTC = moment.tz(reminderDateTimeStr, "YYYY-MM-DDTHH:mm:ss", "Asia/Manila").utc().format("HH:mm:ss");

        // Save the reminder with reminderDate (date part) and reminderTime (converted to UTC)
        const reminder = await Reminder.create({
            noteId: noteId,
            appointmentId:appointmentId,
            reminderDate: reminderDate, // Save date as-is
            reminderTime: reminderTimeUTC, // Save the UTC time
        });
       
        if (reminder) {

            return res.status(200).json({ message: 'Reminder created successfully' });
        } else {
            return res.status(404).json({ message: 'Failed to create reminder' });
        }
    } catch (error) {
        next(error);
        console.log(error);
    }
};