const Listing=require("../models/listing.js");
const mbxGeocoding=require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken=process.env.MAP_TOKEN;
const geocodingClient=mbxGeocoding({accessToken: mapToken});
const Order=require("../models/order.js");


module.exports.index=async (req, res, next) => {
    const allListing = await Listing.find({});
    // console.log(allListing);
    const count = await Listing.countDocuments();
    console.log(count);
    res.render("listings/index.ejs", { allListing: allListing, count: count });
  };

module.exports.renderNewForm=(req, res, next) => {
  
    res.render("listings/new.ejs");
  };

module.exports.host=async(req,res,next)=>{
  res.render("listings/host&earn.ejs");
}

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const list = await Listing.find({ _id: id }).populate({ path: "reviews", populate: { path: "author" } }).populate("owner").populate({path: "orders"});
  
  // Check if the listing exists
  if (!list.length) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/Listings");
  }
    console.log("hey ji "+list[0]);
    console.log("hey ji "+list[0].trending);
  // Accessing the orders array
  let order=list[0].orders;

  // Update the count value
  let newValue = list[0].cnt + 1;
    let trendingStatus = newValue > 6;

    await Listing.findOneAndUpdate(
      { _id: id },
      { cnt: newValue, trending: trendingStatus }
    );

  // Render the view with the listing data
  res.render("listings/show.ejs", { list: list,order });
}



module.exports.createListing=async (req, res, next) => {
    //ab iski zarurat nhi we have joi.
    // if(!req.body.listing){
    //     //agar listing khali hua to ye krenge ,status 400 isliye diya kyunki 400 - is for bad request (jo client ki galti ki wjah se ata h).
    //     throw new ExpressError(400,"Send Valid data for Listing");
    // }

   
    let url=req.file.path;
    let filename=req.file.filename;
    console.log(req.body.listing);
    let user=req.user;
    if(user.host ==="false" || user.host === false){
       user.host=true;
      await user.save();
    }

    
    const newListing = new Listing(req.body.listing);

    // map forward geocding starts here
    let response=await geocodingClient.forwardGeocode({
      query: `${newListing.location}`,
      limit: 1
    })
      .send()
 
    let geoGeometry=response.body.features[0].geometry;
    //map forward geocding ends here
    newListing.geometry=geoGeometry;
    newListing.owner=req.user._id;
    newListing.image={url,filename};

    let savedListing=await newListing.save();
    console.log(savedListing);
    user.listings.push(savedListing);
    user.save();
   
    req.flash("success","New Listing Created!");
    res.redirect("/Listings");  
  }; 

module.exports.renderEditForm=async (req, res) => {
    let { id } = req.params;
    let list = await Listing.find({ _id: id });
    if(!list.length){
      req.flash("error","Listing you requested for does not exist");
      res.redirect("/Listings");
    }
    let org_image=list[0].image.url;
    org_image=org_image.replace("/upload","/upload/h_250,w_300,r_20/e_shadow:40,x_10,y_10");
    res.render("listings/edit.ejs", { list,org_image });
  };

module.exports.updateListing=async (req, res) => {
    let { id } = req.params;
    let data = req.body.listing;
    // if(!data){
    //     throw new ExpressError(400,"Send Valid data for Listing");
    // }
    console.log(data);
    let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    
    let response=await geocodingClient.forwardGeocode({
      query: `${data.location}`,
      limit: 1
    })
      .send()

    let geoGeometry=response.body.features[0].geometry;
    listing.geometry=geoGeometry;
    await listing.save();


    if(req.file){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
    }
  
    req.flash("listUpdated","Listing Updated!");
    res.redirect(`/Listings/${id}`);
  };

module.exports.destroyListing=async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findByIdAndDelete(id);
    req.flash("del","Listing Deleted Successfully");
    res.redirect("/");
  };
