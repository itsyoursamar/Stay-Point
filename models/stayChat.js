
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const chatSchema = new Schema({
    senderId:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    receiverId:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    message:{
        type: String,
        required: true,
    },

    
},{ timestamps: true });


module.exports = mongoose.model("Chat", chatSchema);
