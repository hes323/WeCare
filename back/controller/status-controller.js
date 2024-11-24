const status = require("../model/Status");
const { QueryTypes } = require("sequelize");
const sequelize = require("../db/dbconnection");

const addNewStatus = async () => {
  try {
    const statusDescriptions = [
      "Pending",
      "Approved Without Pay",
      "Approved With Pay",
      "Rejected",
    ];

    await sequelize.transaction(async (t) => {
      for (const desc of statusDescriptions) {
        const existingStatus = await status.findOne({
          where: { statusDescription: desc },
          transaction: t,
        });

        if (!existingStatus) {
          await status.create(
            { statusDescription: desc },
            { transaction: t }
          );
        } else {
          console.log(`Status "${desc}" already exists. Skipping creation.`);
        }
      }
    });

    console.log("Statuses initialized successfully.");
  } catch (error) {
    console.error("Error initializing statuses:", error);
    throw error;
  }
};



module.exports = {
  addNewStatus
}
