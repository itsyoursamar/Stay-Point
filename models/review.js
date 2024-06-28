const mongoose = require('mongoose');

const Schema=mongoose.Schema;

const reviewSchema = new Schema({
  comment: {
    type: String,
    required: true,
  },
  rating:{
    type:String,
    min: 1,
    max: 5
  }, 
  createdAt:{
    type: Date,
    default: Date.now()
  } ,
  author:{
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  
});

module.exports = mongoose.model('Review', reviewSchema);


// const Revi=new mongoose.model("Listing",ListingSchema);

// module.exports=Listing;
