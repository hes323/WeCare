const { exportDecryptedData, exportEncryptedData } = require('../auth/secure');
const sequelize = require("../db/dbconnection");
const Appointment = require('../model/Appointment')
const Notification = require('../model/Notification')
const cron = require('node-cron');
const { Reminder } = require('../model/Reminder'); 
const moment = require('moment-timezone'); // To format the timestamp

const { Op } = require('sequelize');

exports.setupReminderNotifications = (io) => {
    // Schedule task to run every minute
    cron.schedule('* * * * *', async () => {

        console.log('Checking for upcoming reminders...');
        
        try {
        const query = `
            SELECT *
            FROM reminder r
            WHERE (
                r.reminderDate < CURRENT_DATE
                OR (r.reminderDate = CURRENT_DATE AND r.reminderTime <= CONVERT_TZ(NOW(), '+00:00', '+08:00'))
            )
            AND r.reminderId NOT IN (
                SELECT reminderId
                FROM Notification
                WHERE isFromReminder = true
            );
        `;

        const [unrecordedReminders] = await sequelize.query(query);

        if (unrecordedReminders.length > 0) {
            const createdNotifications = [];
            for (let reminder of unrecordedReminders) {
                try {
                    const appointment = await Appointment.findByPk(reminder.appointmentId);
                    if (appointment) {
                        const notification = await Notification.create({
                            appointmentId: reminder.appointmentId,
                            seniorId: appointment.seniorId,
                            assistantId: appointment.assistantId,
                            statusId: appointment.statusId,
                            seniorReadFlag:false,
                            assistantReadFlag:false,
                            isFromReminder: true,
                            reminderId: reminder.reminderId,
                        });
                        createdNotifications.push(notification);
                    } else {
                        console.warn(`Appointment not found for reminderId: ${reminder.reminderId}`);
                    }
                } catch (error) {
                    console.error(`Error processing reminderId ${reminder.reminderId}:`, error);
                }
            }

            if (createdNotifications.length > 0) {
                io.emit('newNotifsReceived', {
                    message: "New reminders received",
                    remindersCount: createdNotifications.length,
                });
            }
        } else {
            console.log("No past reminders found to record.");
        }
    } catch (error) {
        console.error('Error processing reminders:', error);
    }
    });
};


const recordPastReminders = async () => {
    try {
        const query = `
            SELECT *
            FROM reminder r
            WHERE (
                r.reminderDate < CURRENT_DATE
                OR (r.reminderDate = CURRENT_DATE AND r.reminderTime <= CONVERT_TZ(NOW(), '+00:00', '+08:00'))
            )
            AND r.reminderId NOT IN (
                SELECT reminderId
                FROM Notification
                WHERE isFromReminder = true
            );
        `;

        const [unrecordedReminders] = await sequelize.query(query);

        if (unrecordedReminders.length > 0) {
            const createdNotifications = [];
            for (let reminder of unrecordedReminders) {
                try {
                    const appointment = await Appointment.findByPk(reminder.appointmentId);
                    if (appointment) {
                        const notification = await Notification.create({
                            appointmentId: reminder.appointmentId,
                            seniorId: appointment.seniorId,
                            assistantId: appointment.assistantId,
                            statusId: appointment.statusId,
                            seniorReadFlag:false,
                            assistantReadFlag:false,
                            isFromReminder: true,
                            reminderId: reminder.reminderId,
                        });
                        createdNotifications.push(notification);
                    } else {
                        console.warn(`Appointment not found for reminderId: ${reminder.reminderId}`);
                    }
                } catch (error) {
                    console.error(`Error processing reminderId ${reminder.reminderId}:`, error);
                }
            }

            if (createdNotifications.length > 0) {
                io.emit('newNotifsReceived', {
                    message: "New reminders received",
                    remindersCount: createdNotifications.length,
                });
            }
        } else {
            console.log("No past reminders found to record.");
        }
    } catch (error) {
        console.error('Error processing reminders:', error);
    }
};



exports.retrieveNotifs = async (req, res, next) => {
    // Call the function to record past reminders
    recordPastReminders();

    // Retrieve the userId from headers
    const userId = req.headers.userid;
    console.log(`Retrieved userId: ${userId}`); // Debug log

    // Decrypt the userId
    const decryptedUserId = Number(await exportDecryptedData(userId.trim()));

    try {
        // SQL query to fetch notifications
        const query = `
            SELECT 
                a.notificationId,
                a.appointmentId,
                a.seniorId,
                a.assistantId,
                a.statusId,
                CASE 
                    WHEN u.userType = 'assistant' THEN a.assistantReadFlag
                    WHEN u.userType = 'senior' THEN a.seniorReadFlag
                END AS readFlag,
                isFromReminder,
                CONCAT(u.firstname, ' ', u.lastname) AS loggedInUserFullName,
                CASE 
                    WHEN u.userType = 'senior' 
                        THEN CONCAT(ua.firstname, ' ', ua.lastname)
                    ELSE CONCAT(us.firstname, ' ', us.lastname)
                END AS otherPersonFullName,
                CASE 
                    WHEN u.userType = 'assistant' AND a.statusId = 1 
                        THEN CONCAT('You have a pending appointment request from ', CONCAT(us.firstname, ' ', us.lastname), ' that needs approval')
                    WHEN u.userType = 'assistant' AND a.statusId = 3 
                        THEN CONCAT('Your appointment with ', CONCAT(us.firstname, ' ', us.lastname), ' has been fully paid')
                    WHEN u.userType = 'senior' AND a.statusId = 2 
                        THEN CONCAT('Your appointment request with ', CONCAT(ua.firstname, ' ', ua.lastname), ' has been approved. Please review the appointment details and proceed with the payment to confirm.')
                    WHEN u.userType = 'senior' AND a.statusId = 3 
                        THEN CONCAT('Your appointment with ', CONCAT(ua.firstname, ' ', ua.lastname), ' has been fully paid')
                    WHEN u.userType = 'senior' AND a.statusId = 4 
                        THEN CONCAT('Your appointment request with ', CONCAT(ua.firstname, ' ', ua.lastname), ' has been rejected')
                END AS message,
                a.createdAt,
                DATE_FORMAT(CONVERT_TZ(a.createdAt, '+00:00', '+08:00'), '%M %d, %Y %h:%i %p') AS formattedTime
            FROM 
                Notification a
            JOIN 
                userprofile u ON 
                    (u.userType = 'senior' AND u.userId = a.seniorId AND a.statusId IN (2, 3, 4))
                OR 
                    (u.userType = 'assistant' AND u.userId = a.assistantId AND a.statusId IN (1, 3))
            LEFT JOIN 
                userprofile us ON us.userId = a.seniorId
            LEFT JOIN 
                userprofile ua ON ua.userId = a.assistantId
            JOIN 
                appointment ap ON a.statusId = ap.statusId AND ap.appointmentId = a.appointmentId
            WHERE 
                u.userId = :loggedInUserId
                AND a.isFromReminder = 0
            UNION ALL
            SELECT 
                r.notificationId,
                a.appointmentId,
                a.seniorId,
                a.assistantId,
                a.statusId,
                r.assistantReadFlag as readFlag,
                isFromReminder,
                CONCAT(ua.firstname, ' ', ua.lastname) AS loggedInUserFullName,
                CONCAT(us.firstname, ' ', us.lastname) AS otherPersonFullName,
                CONCAT('You have set a reminder on your appointment with ', CONCAT(us.firstname, ' ', us.lastname), ' with a note: ', n.noteContent) AS message,
                r.createdAt,
                DATE_FORMAT(CONVERT_TZ(r.createdAt, '+00:00', '+08:00'), '%M %d, %Y %h:%i %p') AS formattedTime
            FROM 
                Notification r
            JOIN 
                note n ON r.appointmentId = n.appointmentId 
            JOIN 
                appointment a ON r.appointmentId = a.appointmentId
            JOIN 
                userprofile us ON us.userId = a.seniorId
            JOIN 
                userprofile ua ON ua.userId = a.assistantId
            WHERE 
                ua.userId = :loggedInUserId
                AND r.isFromReminder = 1
            ORDER BY
                createdAt DESC;
        `;

        // Execute the query with Sequelize
        const notifs = await sequelize.query(query, {
            replacements: { loggedInUserId: decryptedUserId },
            type: sequelize.QueryTypes.SELECT,
        });

        console.log(`Notifications retrieved: ${notifs.length}`);

        // Get unread count
        const count = await getNotifCounts(decryptedUserId);
        console.log(`Unread count: ${count}`);

        // Return the notifications and unread count
        if (notifs.length > 0 || count > 0) {
            return res.status(200).json({
                message: "Notifications retrieval successful",
                notifications: notifs.map((notif) => ({
                    ...notif,
                    timeSent: moment(notif.createdAt).tz("Asia/Manila").format('MMMM Do YYYY, h:mm:ss A'),
                })),
                unreadCount: count,
            });
        } else {
            return res.status(404).json({ message: "No notifications found" });
        }
    } catch (error) {
        console.error(`Error retrieving notifications:`, error);
        next(error);
    }
};

exports.updateNotifReadFlag = async (req, res, next, io) => {
    const { notificationId, userType } = req.body;

    console.log(`Notification ID to update: ${notificationId}`);

    try {
        // Determine the flag to update based on userType
        let updateField = {};
        if (userType === 'assistant') {
            updateField = { assistantReadFlag: true }; // Set the flag for assistant
        } else if (userType === 'senior') {
            updateField = { seniorReadFlag: true }; // Set the flag for senior
        } else {
            return res.status(400).json({ error: "Invalid userType" });
        }

        // Update the notification's read flag
        const updatedRows = await Notification.update(updateField, {
            where: { notificationId }, // Condition to find the notification
        });

        // Check if any rows were updated
        if (updatedRows[0] === 0) {
            return res.status(404).json({ error: "Notification not found" });
        }

        // Log the timestamp of the action
        const timestamp = moment().tz("Asia/Manila").format('MMMM Do YYYY, h:mm:ss A');
        console.log(`Notification ID ${notificationId} marked as read at ${timestamp} by ${userType}.`);

        // Emit the updated notification count
        io.emit('newNotifsReceived', {
            message: "New unread notification count received",
            timestamp, // Include the timestamp for the event
        });

        res.status(200).json({
            message: "Read flag updated successfully",
            timestamp, // Include the timestamp in the response
        });
    } catch (error) {
        console.error(`Error updating notification ID ${notificationId}:`, error);
        next(error);
    }
};



const getNotifCounts = async (decryptedUserId) => {
    try {
        const query = `
            SELECT COUNT(*) AS unreadCount
            FROM (
                SELECT 
                    a.notificationId,
                    a.appointmentId,
                    a.seniorId,
                    a.assistantId,
                    a.statusId,
                    CASE 
                        WHEN u.userType = 'assistant' THEN a.assistantReadFlag
                        WHEN u.userType = 'senior' THEN a.seniorReadFlag
                    END AS readFlag,
                    isFromReminder,
                    CONCAT(u.firstname, ' ', u.lastname) AS loggedInUserFullName,
                    CASE 
                        WHEN u.userType = 'senior' 
                            THEN CONCAT(ua.firstname, ' ', ua.lastname)
                        ELSE CONCAT(us.firstname, ' ', us.lastname)
                    END AS otherPersonFullName,
                    CASE 
                        WHEN u.userType = 'assistant' AND a.statusId = 1 
                            THEN CONCAT('You have a pending appointment request from ', CONCAT(us.firstname, ' ', us.lastname), ' that needs approval.')
                        WHEN u.userType = 'assistant' AND a.statusId = 3 
                            THEN CONCAT('Your appointment with ', CONCAT(us.firstname, ' ', us.lastname), ' has been fully paid.')
                        WHEN u.userType = 'senior' AND a.statusId = 2 
                            THEN CONCAT('Your appointment request with ', CONCAT(ua.firstname, ' ', ua.lastname), ' has been approved. Please review the appointment details and proceed with payment to confirm.')
                        WHEN u.userType = 'senior' AND a.statusId = 3 
                            THEN CONCAT('Your appointment with ', CONCAT(ua.firstname, ' ', ua.lastname), ' has been fully paid.')
                        WHEN u.userType = 'senior' AND a.statusId = 4 
                            THEN CONCAT('Your appointment request with ', CONCAT(ua.firstname, ' ', ua.lastname), ' has been rejected.')
                    END AS message,
                    DATE_FORMAT(CONVERT_TZ(a.createdAt, '+00:00', '+08:00'), '%Y-%m-%d %H:%i:%s') AS createdAt
                FROM 
                    Notification a
                JOIN 
                    userprofile u ON 
                        (u.userType = 'senior' AND u.userId = a.seniorId AND a.statusId IN (2, 3, 4))
                    OR 
                        (u.userType = 'assistant' AND u.userId = a.assistantId AND a.statusId IN (1, 3))
                LEFT JOIN 
                    userprofile us ON us.userId = a.seniorId
                LEFT JOIN 
                    userprofile ua ON ua.userId = a.assistantId
                JOIN appointment ap ON a.statusId = ap.statusId AND ap.appointmentId = a.appointmentId
                WHERE 
                    u.userId = :loggedInUserId
                    AND a.isFromReminder = 0
                    AND (
                        (u.userType = 'senior' AND a.seniorReadFlag = 0) OR 
                        (u.userType = 'assistant' AND a.assistantReadFlag = 0)
                    )
                UNION ALL
                SELECT 
                    r.notificationId,
                    a.appointmentId,
                    a.seniorId,
                    a.assistantId,
                    a.statusId,
                    r.assistantReadFlag AS readFlag,
                    isFromReminder,
                    CONCAT(ua.firstname, ' ', ua.lastname) AS loggedInUserFullName,
                    CONCAT(us.firstname, ' ', us.lastname) AS otherPersonFullName,
                    CONCAT('You have set a reminder on your appointment with ', CONCAT(us.firstname, ' ', us.lastname), ' with a note: ', n.noteContent) AS message,
                    DATE_FORMAT(CONVERT_TZ(r.createdAt, '+00:00', '+08:00'), '%Y-%m-%d %H:%i:%s') AS createdAt
                FROM 
                    Notification r
                JOIN 
                    note n ON r.appointmentId = n.appointmentId 
                JOIN 
                    appointment a ON r.appointmentId = a.appointmentId
                JOIN 
                    userprofile us ON us.userId = a.seniorId
                JOIN 
                    userprofile ua ON ua.userId = a.assistantId
                WHERE 
                    ua.userId = :loggedInUserId
                    AND r.isFromReminder = 1
                    AND r.assistantReadFlag = 0
            ) AS CombinedResults;
        `;

        const result = await sequelize.query(query, {
            replacements: { loggedInUserId: decryptedUserId },
            type: sequelize.QueryTypes.SELECT,
        });

        // Format the time for display
        const formattedResult = result.map((row) => ({
            ...row,
            formattedCreatedAt: moment(row.createdAt)
                .tz("Asia/Manila") // Ensure timezone consistency
                .format('MMMM Do YYYY, h:mm:ss A'), // Professional format
        }));

        console.log(formattedResult); // Debugging formatted notifications
        return result[0]?.unreadCount || 0;
    } catch (error) {
        console.error(error);
    }
}
