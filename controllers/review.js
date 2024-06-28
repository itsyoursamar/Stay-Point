const Review=require("../models/review.js");
const Listing=require("../models/listing.js");


module.exports.createReview=async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author=req.user._id;
    console.log(newReview);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("newReview","New Review Added!");
    res.redirect(`/Listings/${req.params.id}`);
  };

module.exports.destroyReview=async (req, res) => {
    let { id, rid } = req.params;

    await Review.findByIdAndDelete(rid);
    //here we use $pull operator of MONGOOSE ->pull operator removes from an existing array all instances of a value or values that mathch the specified condition.
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: rid } });
    req.flash("delReview","Review Deleted!");
    res.redirect(`/Listings/${id}`);
  };