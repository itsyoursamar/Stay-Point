const mongoose = require('mongoose');
const { listingSchema } = require('../schema');
const Review=require('./review.js');
const { required } = require('joi');


const Schema=mongoose.Schema;

const ListingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description:{
    type: String,
  },
  image: {
     filename:String,
     url:String,
  },
  price: Number,
  location: String,
  country: String,
  reviews:[
    {
      type: Schema.Types.ObjectId,
      ref: "Review" //jo review model h wo
    }
  ],
  owner:
   {
   type: Schema.Types.ObjectId,
    ref: "User",
   },

    geometry: {
      type:{
      type: String,
      enum: ["Point"],
      // required: true,
      },
      coordinates:{
        type: [Number],
        required: true,
      }
    },
      category:{
        type: String,
        required: true,
      },
     
      trending:{
        type: Boolean,
        default: false,
      },
      cnt:{
        type: Number,
        default: 0,
      },
      contact:{
        ph_no:{
          type: Number,
          required: true,
        },
   
          house_no:{
            type: String,
            required: true,
          },
          house_location:{
            type: String,
            required:true,
          }
        

      },
      orders: [
        {
          type: Schema.Types.ObjectId,
          ref: "Order"
        }
      ]
  
  
});


ListingSchema.post('findOneAndDelete',async(Listing)=>{
  if(Listing){
    await Review.deleteMany({_id: {$in:  Listing.reviews}});
  }
});

module.exports = mongoose.model('Listing', ListingSchema);




