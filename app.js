if(process.env.NODE_ENV !="production"){
    require('dotenv').config();
}

const express=require("express");
const app=express();
const port=3000;

const DB_URL=process.env.ATLAS_DB_URL;

const Chat = require('./models/stayChat.js'); 



const {isLoggedin,isOwner}=require("./middleware.js");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const Listing=require("./models/listing.js");

//google auth
require("./googleAuth.js");

//session
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");

const store=MongoStore.create({
    mongoUrl: DB_URL,
    crypto:{   
        secret: process.env.SECRET,
    },
    touchAfter: 24*60*60,
})

store.on("error",()=>{
    console.log("ERROR in Mongo Session Store",err);
});

const sessionOptions={
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7*24*60*60*1000, //expiry of cookies
        maxAge: 7*24*60*60*1000, // expiry of cookies
        httpOnly: true, // only for security purpose nothing else
    }
};



//ejs-mate help krta h kai saare template create krne me for eg jb navbar h wo kai sare pages pe same rhega to we can use there like that 
const ejsMate=require("ejs-mate");
app.engine('ejs', ejsMate);

const mongoose = require('mongoose');

//importing listing model
const path=require("path");


//for using static files
app.use(express.static(path.join(__dirname,"/public")));

//post middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//get & post suports only in form so thats why
const methodOverride =require("method-override");
const { validateListing } = require('./middleware.js');

//sath hi sath isko require krke use bhi krne ka
app.use(methodOverride("_method"));


main().then((res)=>{console.log("Connected to DB")}).catch((err)=>console.log(err));

async function main(){
    await mongoose.connect(DB_URL);
    
};



app.use(
    session(sessionOptions)
  );
app.use(flash());

//password authiorization starts here

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); //user ko serialize krega
//user se related jitni info h usko store krwana is serialize
passport.deserializeUser(User.deserializeUser());//user ko deserialize krega
//user se related jitni info h usko un-store krwana is deserialize

//password authorization ends here


  
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.del=req.flash("del");
    res.locals.newReview=req.flash("newReview");
    res.locals.delReview=req.flash("delReview");
    res.locals.listUpdated  =req.flash("listUpdated");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    res.locals.currPath=req.path;
    // console.log("curruser"+res.locals.currUser);

    next();
})



app.use("/Listings/:id/reviews",reviewRouter);
app.use("/Listings",listingRouter);
app.use("/",userRouter);



app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");




// app.all("*", (req, res, next) => {
//     next(new ExpressError(404, "Page Not Found!"));
//   });
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("listings/Error", { message });
  });


const server=app.listen(port,()=>{
    console.log(`listening at ${port}`);
});
const io=require('socket.io')(server);
//socket

var usp = io.of('/stayChat'); // customer 
var hsp = io.of('/host_stayChat'); // host

usp.on('connection', async (socket) => {
    console.log('A user connected ' + socket.id);
    let currUserId = socket.handshake.auth.token;
    let userOn = await User.findByIdAndUpdate(currUserId, { chat_isOnline: "1" });
    console.log("userOn "+ userOn);
    let userOnned=await User.find(userOn._id);

    // user broadcast online status
    console.log("userOnned "+userOnned);
    // console.log(userOnned[0].chat_isOnline);
    if(userOnned[0].chat_isOnline===true){
    console.log("ok ji"+currUserId);
    socket.broadcast.emit('getOnlineUser', { currUserId });
    hsp.emit('getOnlineUser', { currUserId }); // Notify host namespace
    }

    socket.on('disconnect', async () => {
        console.log('user disconnected');
        let userOff = await User.findByIdAndUpdate(currUserId, { chat_isOnline: "0" });
        let userOffed=await User.find(userOff._id);

        console.log("dekhle bhai"+userOffed);
        if(userOffed[0].chat_isOnline==false){
        // console.log("krdiya off"+userOffed);
        socket.broadcast.emit('getOfflineUser', { userOffed});
        hsp.emit('getOfflineUser', { userOffed }); // Notify host namespace
        }
    });

    // Receive and broadcast new chat messages
    socket.on('newChat', function(data) {
        hsp.emit('loadNewChat', data);
    });

    socket.on('existsChat',async function(data){
        var chat=await Chat.find({$or:[
            {senderId: data.senderId, receiverId: data.receiverId},
            {senderId: data.receiverId, receiverId: data.senderId},
        ]});
        // console.log(chat);

        socket.emit('loadChat',{chats: chat});
    })
});

hsp.on('connection', async (socket) => {
    console.log('A host connected ' + socket.id);
    let currHostId = socket.handshake.auth.hostToken;
    let hostOn = await User.findByIdAndUpdate(currHostId, { chat_isOnline: "1" });
    let hostOnned=await User.find(hostOn._id);

    // host broadcast online status
   if(hostOnned[0].chat_isOnline===true){
    socket.broadcast.emit('getOnlineUser', { currHostId });
    usp.emit('getOnlineUser', { currHostId }); // Notify customer namespace
   }
    socket.on('disconnect', async () => {
        console.log('host disconnected');
        let hostOff = await User.findByIdAndUpdate(currHostId, { chat_isOnline: "0" });
        let hostOffed=await User.find(hostOff._id);

        if(hostOffed[0].chat_isOnline===false){
            console.log("hnjiiiiii "+ hostOffed);
        socket.broadcast.emit('getOfflineUser', { hostOffed });
        usp.emit('getOfflineUser', { hostOffed }); // Notify customer namespace
        }
    });

    // Receive and broadcast new chat messages
    socket.on('newChat', function(data) {
        usp.emit('loadNewChat', data);
    });

    socket.on('existsChat',async function(data){
        var chat=await Chat.find({$or:[
            {senderId: data.senderId, receiverId: data.receiverId},
            {senderId: data.receiverId, receiverId: data.senderId},
        ]});

        var receiver=await User.findById({_id: data.receiverId});

        socket.emit('loadChat',{chats: chat,currCust: receiver});
    })
});

