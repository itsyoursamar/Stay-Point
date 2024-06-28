const express = require("express");
const router = express.Router({ mergeParams: true }); //{ mergeParams: true } it is set to true so that parent route(we def in app.js ) and child route (route we def here) can merge properly

const wrapAsync=require("../utilis/wrapAsync.js");
const {validateReview, isLoggedin}=require("../middleware.js");
const reviewController=require("../controllers/review.js");



//reviews
router.post(
    "/",
    isLoggedin,
    validateReview,
    wrapAsync(reviewController.createReview)
  );
  
  //delete review route
  router.delete(
    "/:rid",
    isLoggedin,
    wrapAsync(reviewController.destroyReview)
  );

 
module.exports =router;