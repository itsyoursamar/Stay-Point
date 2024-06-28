const mongoose = require('mongoose');
const initData=require("./data.js");
const Listing=require("../models/listing.js");

main().then((res)=>{console.log("Connected to DB")}).catch((err)=>console.log(err));

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');

};

const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj, owner: "6642419c77d79f89a0908a10",}));
    await Listing.insertMany(initData.data);
    console.log("data was initialised");
}

initDB();