const express = require("express");
const router = express.Router();
const sequelize = require("../db/dbconnection");

// Fetch feedbacks based on assistant email and include the full name of the senior
router.post("/fetch-feedback", async (req, res) => {
  try {
    const { assistantEmail } = req.body;

    if (!assistantEmail) {
      return res.status(400).json({ message: "Assistant email is required." });
    }

    console.log(`Received assistantEmail: ${assistantEmail}`);

    // Step 1: Get the assistant's userId from the users table
    const [userResult] = await sequelize.query(
      `
      SELECT userId 
      FROM user
      WHERE email = :assistantEmail
      `,
      {
        replacements: { assistantEmail },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!userResult || !userResult.userId) {
      console.log(`No user found with email: ${assistantEmail}`);
      return res.status(404).json({ message: "No assistant found with this email." });
    }

    const assistantId = userResult.userId;
    console.log(`Found assistantId: ${assistantId}`);

    // Step 2: Fetch feedbacks with senior's full name
    const feedbacks = await sequelize.query(
      `
      SELECT 
        ar.*, 
        a.serviceDescription, 
        a.totalAmount,
        CONCAT(up.firstName, ' ', up.lastName) AS seniorFullName
      FROM appointmentratings ar
      JOIN appointment a ON ar.appointmentId = a.appointmentId
      JOIN userprofile up ON a.seniorId = up.userId
      WHERE a.assistantId = :assistantId
      `,
      {
        replacements: { assistantId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!feedbacks || feedbacks.length === 0) {
      console.log(`No feedback found for assistantId: ${assistantId}`);
      return res.status(404).json({ message: "No feedback found for this assistant." });
    }

    console.log(`Fetched feedbacks: ${JSON.stringify(feedbacks, null, 2)}`);
    res.json({ feedbacks });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
