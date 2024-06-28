//google auth

const User=require("./models/user.js");
const userController=require("./controllers/user.js");

const passport=require("passport");
var GoogleStrategy = require('passport-google-oauth20');

// const User=require("./models/user.js");



passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  },
 async(req,accessToken, refreshToken, profile, done) => {
    // Here you would find or create a user in your database
    // For simplicity, we'll just return the profile

try {
    const email = profile.emails[0].value;
    const user = await User.findOne({ email: email });
    
    if (user) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'User not found' });
    }
  } catch (error) {
    return done(error, false);
  }

}));

passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }

  });