const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    listings: [
        {
            type: Schema.Types.ObjectId,
            ref: "Listing"
        }
    ],
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
   
});

module.exports = mongoose.model("Order", orderSchema);
