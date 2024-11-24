const express = require('express');
const auth = require("../auth/auth");
const { adminHeaderCardsDetails, 
    showUsers, showRatings, 
    showPendingListOfAssistantAccountApplication,
     manageUsers, manageRatings, 
     validateAssistantAccountRegisteration, 
     showPendingAssistantData,
     updateUserPassword} = require('../controller/admin-controller');

const router = express.Router();

router.get("/admin-cards/details",auth.verify,adminHeaderCardsDetails)

router.get("/user-list",auth.verify,auth.verifyAdmin,showUsers);

router.get("/ratings-list",auth.verify,showRatings);

router.get("/assistant-applicants",auth.verify,showPendingListOfAssistantAccountApplication);

router.put("/user-manage/:userId/:operation",auth.verify,auth.verifyAdmin,manageUsers);

router.put("/ratings-manage/:ratingId",auth.verify,manageRatings);

router.put("/assistant-applicant/:applicantId",auth.verify,auth.verifyAdmin,validateAssistantAccountRegisteration);

router.get("/assistant-details/:applicantId",auth.verify,auth.verifyAdmin,showPendingAssistantData);

router.put("/update-user/password/:userId",auth.verify,auth.verifyAdmin,updateUserPassword);




module.exports = router;