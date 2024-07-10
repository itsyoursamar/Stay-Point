const express=require("express");
const app=express();

const router = express.Router();
const path=require("path");
const passport=require("passport");

const wrapAsync=require("../utilis/wrapAsync.js");
const {listingSchema}=require("../schema.js");
const {reviewSchema}=require("../schema.js");
const ExpressError=require("../utilis/ExpressError.js");

const {isLoggedStatus ,isLoggedin,isOwner,validateListing}=require("../middleware.js");
const Listing=require("../models/listing.js");

const { saveRedirectedUrl } = require("../middleware.js");
const userController=require("../controllers/user.js");

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");

const multer=require("multer");
const {storage}=require("../cloudConfig.js");
const upload=multer({storage});
const User=require("../models/user.js");
const Order=require("../models/order.js");
const Chat=require("../models/stayChat.js");

const Razorpay = require('razorpay'); 
//google authentication

router.post('/fetchOrder', async (req, res) => {
  const { listId, userId } = req.body;
  console.log(userId);
  try {
      // Fetch the user and listing
      const user = await User.findById({_id:userId});
      const listing = await Listing.findById({_id:listId});
      
      if (!user || !listing) {
          return res.status(404).json({ message: 'User or Listing not found' });
      }

      // Create a new order
      const order = new Order({
          listings: [listId],
          user: userId
      });
      // Save the order
      await order.save();
      console.log(order);

      // Add the order to the user's orders array
      user.orders.push(order._id);
      await user.save();

      // Add the order to the listing's orders array
      listing.orders.push(order._id);
      await listing.save();

      res.json({ success: true, order });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
  }
});

router.get("/host_stayChat/:id",async(req,res)=>{
   let id=req.params.id;
  //  if(!id){
  //   res.redirect('/Listings/host');
  //  }
  //  console.log(id);
   let host=await User.findById(id).populate({
    path: 'orders',
    populate: {
      path: 'user'
    },
  }).populate({
    path: 'listings',
    populate: {
      path: 'orders',
      populate:{
        path: 'user',
      }
    }
  });
    // console.log(host);
  // console.log(host.orders);

  let listings=host.listings;
  console.log(listings);
  console.log("orders");
  // console.log(listings[0].orders);

   res.render("listings/host_stayChat.ejs",{host,listings});
})



router.get("/StayChat/:id", async(req, res) => {
  const listing = await Listing.findById(req.params.id).populate({
    path: 'owner',
   
  });
  // console.log("listing");
  // console.log(listing);
  const owner=listing.owner;
  
  // console.log(owner.listings);
  // console.log(owner.listings.contact);
  res.render("listings/stayChat.ejs", {
      currUser: req.user,
      listingOwner: listing.owner._id, 
      owner: owner,
      contact: listing.contact,
  });
  
});



router.post('/host_StayChat',async(req,res)=>{
   try{
      const chat= new Chat({
        senderId: req.body.senderId,
        receiverId: req.body.receiverId,
        message: req.body.message,
      });
      console.log("temp chat" + chat);
      let newChat=await chat.save();
      res.status(200).send({success: true ,msg: "successfully sended!", data: newChat});
   }catch(err){
     res.status(400).send({success: false ,msg: err.message});
   }
})

router.route("/signUp")
.get(userController.renderSignupForm)
.post(
  upload.single('dp'),
  wrapAsync(userController.signup)
);

router.route("/login")
.get(userController.renderLoginForm)
//passport.authenticate is used to authenticate user.
//failureRedirect: '/login', -> user login failure me kha redirecrt krwae
// failureFlash: true ->ki user ne galat data dala ya jo bhi to flash ko true rkhe message flash krwane ko
.post( saveRedirectedUrl,
    passport.authenticate("local",{
        failureRedirect: '/login', 
        failureFlash: true
    }),wrapAsync(userController.login))


router.get("/logout",userController.logout)



//home router starts from here

router.get("/",userController.renderHome);

router.get("/profile",isLoggedin,userController.renderProfile);

router.put("/profile/:id",upload.single("dp"),userController.updateProfile);


router.get("/:category",userController.renderCategory);


router.get("/search/:location",wrapAsync( async(req,res)=>{
  let location=req.params.location;

  let list= await Listing.find({location: location});

  if(list.length ===0){
    let list= await Listing.find({country: location});
   
    if(list.length !==0)
      {
        console.log("listing h");
        res.render("listings/searchListings.ejs",{list});
      }
      else{
        req.flash("error","Oops! There is no Listings in this Location");
        res.redirect("/");
      }
  }
  else{
    res.render("listings/searchListings.ejs",{list});
  }

}));


//payment



const razorpayInstance = new Razorpay({
    key_id:  process.env.rzr_key_id,
    key_secret: process.env.rzr_key_secret
});

router.post("/createOrder",async(req,res)=>{
  try {
      const amount = (req.body.amount*100)+(req.body.amount*100)*18/100;
      const options = {
          amount: amount,
          currency: 'INR',
          receipt: 'razorUser@gmail.com'
      }
   
      razorpayInstance.orders.create(options, 
          (err, order)=>{
              if(!err){
                  res.status(200).send({
                      success:true,
                      msg:'Order Created',
                      order_id:order.id,
                      amount:amount,
                      image: req.body.image.url,
                      key_id: process.env.rzr_key_id,
                      product_name:req.body.name,
                      description:req.body.description,
                      contact:"8567345632",
                      name: "Sandeep Sharma",
                      email: "sandeep@gmail.com"
                  });
           
              }
              else{
                  res.status(400).send({success:false,msg:'Something went wrong!'});
              }
          }
      );

  } catch (error) {
      console.log(error.message);
  }
});


//auth
router.get('/auth/google', passport.authenticate('google',{scope:
    ['email','profile']
}));

//auth callback
router.get('/auth/google/callback',   passport.authenticate('google', { failureRedirect: '/login', failureFlash: true }),
wrapAsync(async (req, res) => {
  if (req.user) {
    await userController.login(req, res);
  } else {
    res.redirect('/login');
  }
}));


router.get('/failure',(req,res)=>{
    res.send("failed");
  })



module.exports=router;

