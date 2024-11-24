const express = require("express");
const router = express.Router();
const sequelize = require("../db/dbconnection");

// Fetch report data combining billing and appointment details
router.get("/fetch-report", async (req, res) => {
  try {
    // Fetch billing, appointment, and payment method combined data
    const reportData = await sequelize.query(
      `
      SELECT 
        a.appointmentId,
        a.seniorId,
        CONCAT(sup.firstName, ' ', sup.lastName) AS seniorFullName,
        a.assistantId,
        CONCAT(ass.firstName, ' ', ass.lastName) AS assistantFullName,
        a.appointmentDate,
        a.startDate,
        a.endDate,
        a.numberOfHours,
        a.serviceDescription,
        a.totalAmount AS appointmentTotal,
        b.hoursBilled,
        b.payMethod
      FROM 
        appointment a
      LEFT JOIN userprofile sup ON a.seniorId = sup.userId
      LEFT JOIN userprofile ass ON a.assistantId = ass.userId
      LEFT JOIN billings b ON a.appointmentId = b.appointmentId
      `,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!reportData || reportData.length === 0) {
      console.log("No report data found.");
      return res.status(404).json({ message: "No report data available." });
    }

    console.log(`Fetched report data: ${JSON.stringify(reportData, null, 2)}`);
    res.json({ report: reportData });
  } catch (error) {
    console.error("Error fetching report data:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
