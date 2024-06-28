const Listing=require("./models/listing.js");
const ExpressError=require("./utilis/ExpressError.js");
const {listingSchema}=require("./schema.js");
const {reviewSchema}=require("./schema.js");

module.exports.isLoggedin=(req,res,next)=>{
    if(!req.isAuthenticated()){
      req.session.savedUrl=req.originalUrl;
        req.flash("error","you must be logged in!");
        return res.redirect("/login");
      }
      next();
}

module.exports.isLoggedStatus = (req, res, next) => {
  if (req.isAuthenticated()) {
      res.locals.loggedIn = true; // Set a flag indicating the user is logged in
      return next();
  }
  res.locals.loggedIn = false; // Set a flag indicating the user is not logged in
  next();
};

module.exports.saveRedirectedUrl=(req,res,next)=>{
  if(req.session.savedUrl){
    res.locals.redirectedUrl=req.session.savedUrl;
  }
  next();
}

module.exports.isOwner=async(req,res,next)=>{
  let id=req.params.id;
  let listing=await Listing.find({_id: id} );
    const owner=listing[0].owner;

    if( !owner.equals(res.locals.currUser._id)){
      req.flash("error","you don't have permission to edit");
      return res.redirect(`/Listings/${id}`);
    };

    next();
}



//function for JOi validation (server side validation)
module.exports.validateListing = async (req, res, next) => {
  try {

      // Check if req.file exists and contains the file data
      if(req.path==="/"){
      if ((!req.file || !req.file.filename || !req.file.path ) ) {
          throw new ExpressError(400, "Image file is required");
      }}
      
      // Validate other fields using Joi schema
      let { error } = listingSchema.validate(req.body);
      
      if (error) {
          let erMsg = error.details.map((el) => el.message).join(",");
          throw new ExpressError(400, erMsg);
      } else {
          next();
      }
  } catch (err) {
      next(err); // Pass the error to the error handling middleware
  }
};




//function for JOi validation (server side validation)
module.exports.validateReview=async(req,res,next)=>{
  let {error}=reviewSchema.validate(req.body);
  if(error){
      let erMsg=error.details.map((el)=>el.message).join(",");
      throw new ExpressError(400,erMsg);
  }
  else{
      next();
  }
}