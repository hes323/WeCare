const express = require('express');
const auth= require("../auth/auth");
const { createFeedback, getAllReviews, getReviewDetails, removeReview } = require('../controller/ratings-controller');
const router = express.Router();

router.post("/create-feedback/:appId",
    auth.verify,
    auth.verifySenior,
    createFeedback);

router.get("/get-reviews",
    auth.verify,
    auth.verifyAdmin,
    getAllReviews);

router.get("/get-reviews/:appId",
    auth.verify,
    auth.verifyAdmin,
    getReviewDetails);
router.put("/remove-review/:appId",
    auth.verify,
    auth.verifyAdmin,removeReview)

module.exports = router;