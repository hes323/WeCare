const sequelize = require("../db/dbconnection");
const { exportDecryptedData, exportEncryptedData } = require("../auth/secure");
const AppointmentRatings = require("../model/AppointmentRatings");
const Ratings = require("../model/Ratings");
const { QueryTypes } = require("sequelize");

const createFeedback = async(req,res,next)=>{
  
    try{
        const {appId} = req.params;
        const {rating,comments} = req.body;
        const convertedAppId = await exportDecryptedData(appId);
        
        if(+rating ===0){
            return res.status(200).send({
                isSuccess: false,
                message: "Rating must have a value"
            })
        }


        const ratingValues = await Ratings.findOne({
            where: {
                ratingsId: +rating
            }
        })

        const feedback = await sequelize.transaction(async(t)=>{
            
            const resultFeedback = await AppointmentRatings.create({
                appointmentId: +convertedAppId,
                ratingsId: ratingValues.dataValues.ratingsId,
                comments:comments
            },{transaction:t})

    
            return resultFeedback;
        })

        

        res.status(200).send({
            isSuccess: true,
            message: "Feedback has been sent successfully!"
        })
        
    }catch(e){
        console.log("Ang message")
        console.log(e.message)
        next(e);
    }
}

const createRatingTable = async () => {
    try {
      const ratingsDescriptions = [
        "Poor",
        "Fair",
        "Good",
        "Very Good",
        "Excellent"
      ];
  
      await sequelize.transaction(async (t) => {
        for (const desc of ratingsDescriptions) {
          const existingStatus = await Ratings.findOne({
            where: { ratingsDescription: desc },
            transaction: t,
          });
  
          if (!existingStatus) {
            await Ratings.create(
              { ratingsDescription: desc },
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

  const getAllReviews = async(req,res,next)=>{

    try{

        const data =await sequelize.query(`
            select e.appointmentId,
            e.comments,
            e.ratingsId,
            (select concat_ws(" ", up.firstName,
            up.lastName) 
            from userprofile up
            inner join appointment a
            on a.assistantId = up.userId
            where a.appointmentId = e.appointmentId
            and up.deleteFlg = false)as assistantName,
            (select DATE_FORMAT(app.appointmentDate, '%m/%d/%Y')  
            from appointment app
            where app.appointmentId = 
            e.appointmentId) as appointmentDate
            from appointmentratings e;`,{
                type:QueryTypes.SELECT
            })
        const newData = data.map(async(val)=>{

          val["appointmentId"] = await exportEncryptedData(String(val["appointmentId"]));
          return val
        })

        res.status(200).send({
            isSuccess:true,
            message: "Successfully Retrieve All Reviews",
            data: await Promise.all(newData)
        })
    }catch(e){
        next(e)
    }
}


const getReviewDetails = async(req,res,next)=>{

  const {appId} = req.params;
  try{
      const convertedAppId = await exportDecryptedData(appId);
      const data =await sequelize.query(`
          select e.appointmentId,
          e.comments,
          e.ratingsId,
          (select concat_ws(" ", up.firstName,
          up.lastName) 
          from userprofile up
          where up.userId = app.assistantId
          and up.deleteFlg = false) as assistantName,
          (select concat_ws(" ", up.firstName,
          up.lastName) 
          from userprofile up
          where up.userId = app.seniorId
          and up.deleteFlg = false) as seniorName,
          DATE_FORMAT(app.appointmentDate, '%m/%d/%Y') as appointmentDate,
          DATE_FORMAT(app.startDate, '%m/%d/%Y') as startDate,
          DATE_FORMAT(app.endDate, '%m/%d/%Y') as endDate,
          (select u.profileImage from userprofile u
          where u.userId = app.seniorId) as seniorProfileImg
          from appointmentratings e
          inner join appointment app
          on app.appointmentId = e.appointmentId
          where e.appointmentId = :appId;`,{
              replacements:{appId:+convertedAppId},
              type:QueryTypes.SELECT
          })

          const dataOne = data[0];
          dataOne["appointmentId"] = await exportEncryptedData(String(dataOne["appointmentId"]));
      

      res.status(200).send({
          isSuccess:true,
          message: "Successfully Retrieve All Reviews",
          data: dataOne
      })
  }catch(e){
      next(e)
  }
}


const removeReview = async(req,res,next)=>{
  try{

    const {appId} = req.params;
    const convertedAppId = await exportDecryptedData(appId);

    await AppointmentRatings.destroy({
      where:{
        appointmentId:+convertedAppId
      }
    })
    res.status(200).send({
      isSuccess:true,
      message: "Successfully Deleted Review"
  })
  }catch(e){
    next(e)
  }
}
  
  

module.exports = {
    createFeedback,
    createRatingTable,
    getAllReviews,getReviewDetails,
    removeReview
}