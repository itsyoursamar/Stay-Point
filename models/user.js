const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    dp: {
        type: String,
    },
    host: {
        type: Boolean,
        default: false,
    },
    orders: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Order'
        }
    ],
    chat_isOnline:{
        type: Boolean,
        default: '0',
    },
    listings:[
        {
        type: Schema.Types.ObjectId,
        ref: 'Listing'
        }
    ]
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
