const express = require("express");
const router = express.Router();

const Listing=require("../models/listing.js");
const wrapAsync=require("../utilis/wrapAsync.js");
const {isLoggedin,isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listing.js");

const multer=require("multer");
const {storage}=require("../cloudConfig.js");
const upload=multer({storage});


router.route("/")
//index
.get(
  wrapAsync(listingController.index)
)//create route
.post(
  isLoggedin,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.createListing)
);



//ye Listings/new waale ko upar hi likhenge Listings/:id ke kyunki fir niche rkhenge to wo new ko id smjhke dhundega aisa
//new
router.get("/new", isLoggedin,listingController.renderNewForm);

router.get("/host",isLoggedin, listingController.host);

router.route("/:id")
//show route
.get(
  wrapAsync(listingController.showListing)
)
//update route
.put( isLoggedin,isOwner,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.updateListing)
)
//Delete route
.delete(
  isLoggedin,isOwner,
  wrapAsync(listingController.destroyListing)
);



//Edit route
router.get(
  "/:id/edit",isLoggedin,isOwner,
  wrapAsync(listingController.renderEditForm)
);




module.exports =router;