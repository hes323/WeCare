const express = require('express');
const { createAppointment, updateAppointment, getAppointmentList } = require('../controller/appointment-controller');

const auth = require("../auth/auth");
const router = express.Router();

const appointmentRoutes = (io) => {

router.post("/create-appointment",auth.verify,(res,req,next)=>{
    createAppointment(res,req,next,io);
});

router.put("/update-appointment/:appId",auth.verify,(res,req,next)=>{
    updateAppointment(res,req,next,io);
});

router.get("/appointment-list",auth.verify,getAppointmentList);

 return router 
}



module.exports =appointmentRoutes ;