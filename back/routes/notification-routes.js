const express = require("express");
const {retrieveNotifs,updateNotifReadFlag} = require ("../controller/notification-controller")
const router = express.Router();

const notifRoute = (io)=> {
    router.get("/getAllNotifs", retrieveNotifs);

    router.put("/updateNotifReadFlag" ,(res,req,next)=>{
        updateNotifReadFlag(res,req,next,io);
    });

    return router;

}


module.exports = notifRoute;