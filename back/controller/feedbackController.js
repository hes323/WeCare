const sequelize = require('../db/dbconnection'); // DB connection

// Direct query to retrieve feedback based on appointmentId
exports.getFeedback = async (req, res, next) => {
    const appointmentId = req.params.appointmentId; // Get appointmentId from request params
  
    try {
        // SQL query to fetch feedback based on appointmentId
        const query = `
            SELECT ar.appointmentRatingsId, ar.comments, ar.ratingsId, 
                   CONCAT(u.firstname, ' ', u.lastname) AS reviewerName,
                   DATE_FORMAT(CONVERT_TZ(ar.createdAt, '+00:00', '+08:00'), '%M %d, %Y %h:%i %p') AS formattedTime
            FROM appointmentratings ar
            JOIN userprofile u ON ar.ratingsId = u.userId
            WHERE ar.appointmentId = :appointmentId
            ORDER BY ar.createdAt DESC;
        `;
        
        // Execute the query
        const [feedbacks] = await sequelize.query(query, {
            replacements: { appointmentId },  // Inject the appointmentId parameter
            type: sequelize.QueryTypes.SELECT,
        });

        if (feedbacks.length === 0) {
            return res.status(404).json({ message: "No feedback found for this appointment." });
        }
        
        // Return the feedbacks
        res.json({ feedbacks });
    } catch (error) {
        console.error("Error fetching feedback:", error);
        next(error); // Pass the error to the global error handler
    }
};
