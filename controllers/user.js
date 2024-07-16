const User=require("../models/user.js");
const Listing=require("../models/listing.js");

module.exports.renderSignupForm=(req,res)=>{
    res.render("listings/signUp.ejs");
};



module.exports.signup=async(req,res)=>{
    try{
        let dp=req.file.path;
        let{username,email,password}=req.body;

        const newUser=new User({email,username,dp});
        const userCheck=await User.find({email: email});
 
        if(userCheck.length !==0)
        {
            req.flash("error","email exists already");
            res.redirect("/signUp");
        }
        else{
        const registeredUser=await User.register(newUser,password);
        
        req.login(registeredUser,(err)=>{
            if(err){
                next(err);
            }
            res.redirect("/");   

        })
    }
    }catch(e){
        req.flash("error",`${e.message}`);
        res.redirect("/signUp");
    }

};


module.exports.renderLoginForm=(req,res)=>{
    res.render("listings/login.ejs");
};

module.exports.login=async(req,res)=>{
    let redirectUrl=res.locals.redirectedUrl || "/";
    if(redirectUrl !== "/")
    {
        req.flash("success","welcome back to Stay Point!");
    }
   
    res.redirect(redirectUrl);
};

module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","you are logged out now");
        res.redirect("/");
    })
}

module.exports.renderCategory=async(req,res)=>{
    let name=req.params.category;

    if(name === "Trending")
    {
         let list= await Listing.find({trending: true});
        return res.render("listings/selCategory.ejs",{list,name});
    }

    if(name === "privacy" || name==="terms" || name==="payment-policy")
    {
        return res.render("listings/T&C",{name});
    }
    else{
        let list=await Listing.find({category: `${name}`});
        return res.render("listings/selCategory.ejs",{list,name});
    }
};

module.exports.renderProfile=async(req,res)=>{
    let currUser=res.locals.currUser;
    let id=currUser._id;
    let user=await User.find({_id: id});
    console.log(user);
    res.render("listings/profile.ejs",{user});
};

module.exports.updateProfile=async(req,res)=>{
    let id=req.params.id;
    let newDp=req.file.path;
    let data=req.body;
    let user=await User.findByIdAndUpdate({_id: id},{...data});
    user.dp=newDp;
    user.save();
    res.redirect("/");
};

module.exports.renderHome=async(req,res)=>{
    let allListing=await Listing.find({}).limit(12).sort({ _id: -1 });
  
    res.render("listings/home.ejs",{allListing});
  };
