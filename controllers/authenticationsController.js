var passport = require('passport');
var jwt      = require('jsonwebtoken');
var request  = require('request');
var secret   = require('../config/config').secret;
var User     = require('../models/user');

function returnJWT(req, res, user){
  var token = jwt.sign(user, secret, { expiresIn: 60*60*24 });
  return res.status(200).json({
    success: true,
    message: 'Welcome!',
    token: token
  });
}

function register(req, res, next) {
  var localStrategy = passport.authenticate('local-signup', function(err, user, info) {
    if (err) return res.status(500).json({ message: 'Something went wrong.' });
    if (info) return res.status(401).json({ message: info.message });
    if (!user) return res.status(401).json({ message: 'User already exists!' });

    return returnJWT(req, res, user);
  });

  return localStrategy(req, res, next);
};

function login(req, res, next) {
  var profile = req.body;
  
  if (!profile.email || !profile.password) {
    return res.status(500).json({ message: 'Please provide the correct details.' });
  }

  User.findOne({
    "local.email": profile.email
  }, function(err, user) {
    if (err) return res.status(500).json({ message: 'Something went wrong.' });
    if (!user) return res.status(403).json({ message: 'No user found.' });
    if (!user.validPassword(req.body.password)) return res.status(403).json({ message: 'Authentication failed.' });

    return returnJWT(req, res, user);
  });
};

// function facebook(req, res, next) {
//   var profile = req.body;
//   console.log(profile);

//   var access_token = profile.access_token
//   if (!access_token) return res.status(500).json({ message: 'No Access Token provided.' });

//   request({ url: 'https://graph.facebook.com/oauth/access_token_info?client_id=' + process.env.FACEBOOK_API_KEY + '&access_token=' + req.body.access_token, json: true }, function(error, response, body) {

//     if (body.error) return res.status(401).json({ message: 'Invalid access token' });
  
//     // Facebook and LinkedIn
//     User.findOne({ 
//       'local.email' : profile.email 
//     }, function(err, user) {
//       if (err) return res.status(500).json({ message: 'Something went wrong.' });

//       // Update existing user
//       if (user) {
//         user.facebook.id           = profile.id;
//         user.facebook.access_token = profile.access_token;
//         user.facebook.first_name   = profile.first_name;
//         user.facebook.last_name    = profile.last_name;

//         return user.save(function(err, user) {
//           if (err || !user) return res.status(500).json({ message: 'Something went wrong.' });
//           return returnJWT(req, res, user);
//         });
//       }

//       // Create new user
//       var newUser                   = new User();
//       newUser.facebook.id           = profile.id;
//       newUser.facebook.access_token = profile.access_token;
//       newUser.facebook.first_name   = profile.first_name;
//       newUser.facebook.last_name    = profile.last_name;

//       newUser.local.fullname  = profile.name;
//       newUser.local.username  = User.generateUsername(profile.name);
//       newUser.local.image     = profile.picture + "?type=large";
//       newUser.local.email     = profile.email;

//       // Giving a password for mandatory field -> It will not be used.
//       newUser.local.password  = profile.access_token;

//       return newUser.save(function(err, user) {
//         if (err) return res.status(500).json({ message: 'Something went wrong.' });
//         return returnJWT(req, res, user);
//       });
//     });

//   });
// }

// function google(req, res){
//   var profile = req.body;
//   console.log(profile);

//   var access_token = profile.access_token
//   if (!access_token) return res.status(500).json({ message: 'No Access Token provided.' });

//   User.findOne({ 
//     'local.email' : profile.emails[0].value,
//   }, function(err, user) {
//     if (err) return res.status(500).json({ message: 'Something went wrong. '});

//     // Update existing user
//     if (user) {
//       user.google.id           = profile.id;
//       user.google.access_token = profile.access_token;
//       user.google.gender       = profile.gender;
//       user.google.displayName  = profile.displayName;
//       user.google.name         = profile.name;
//       user.google.url          = profile.url;
//       user.google.image        = profile.picture;
//       user.google.thumbnail    = profile.thumbnail;
//       user.google.first_name   = profile.first_name;
//       user.google.last_name    = profile.last_name;
      
//       return user.save(function(err, user) {
//         if (err || !user) return res.status(500).json({ message: 'Something went wrong.' });
//         return returnJWT(req, res, user);
//       });
//     }

//     // Create new user
//     var newUser                 = new User();
//     newUser.google.id           = profile.id;
//     newUser.google.access_token = profile.access_token;
//     newUser.google.gender       = profile.gender;
//     newUser.google.displayName  = profile.displayName;
//     newUser.google.name         = profile.name;
//     newUser.google.url          = profile.url;
//     newUser.google.image        = profile.picture;
//     newUser.google.thumbnail    = profile.thumbnail;
//     newUser.google.first_name   = profile.first_name;
//     newUser.google.last_name    = profile.last_name;

//     newUser.local.fullname       = profile.name;
//     newUser.local.username       = User.generateUsername(profile.displayName);
//     newUser.local.image          = profile.picture;
//     newUser.local.email          = profile.emails[0].value;
//     newUser.local.first_name     = profile.first_name;
//     newUser.local.last_name      = profile.last_name;

//     // Giving a password for mandatory field -> It will not be used.
//     newUser.local.password  = profile.access_token;

//     return newUser.save(function(err, user) {
//       if (err) return res.status(500).json({ message: 'Something went wrong.' });
//       return returnJWT(req, res, user);
//     });
//   });
// }

// function linkedin(req, res, next){
//   var profile = req.body;
//   console.log(profile);

//   var access_token = profile.access_token
//   if (!access_token) return res.status(500).json({ message: 'No Access Token provided.' });

//   User.findOne({ 
//     'local.email' : profile.email 
//   }, function(err, user) {
//     if (err) return res.status(500).json({ message: 'Something went wrong. '});

//     // Update existing user
//     if (user) {
//       user.linkedin.id           = profile.id;
//       user.linkedin.access_token = profile.access_token;
      
//       return user.save(function(err, user) {
//         if (err || !user) return res.status(500).json({ message: 'Something went wrong.' });
//         return returnJWT(req, res, user);
//       });
//     }

//     // Create new user
//     var newUser                   = new User();
//     newUser.linkedin.id           = profile.id;
//     newUser.linkedin.access_token = profile.access_token;

//     newUser.local.fullname       = profile.formattedName;
//     newUser.local.username       = User.generateUsername(profile.name);
//     newUser.local.image          = profile.pictureUrl;
//     newUser.local.email          = profile.email;
//     newUser.local.first_name     = profile.first_name;
//     newUser.local.last_name      = profile.last_name;

//     // Giving an email & password for mandatory field -> It will not be used.
//     newUser.local.password       = profile.access_token;

//     return newUser.save(function(err, user) {
//       if (err) return res.status(500).json({ message: 'Something went wrong.' });
//       return returnJWT(req, res, user);
//     });
//   });
// }

// function github(req, res, next){
//   var profile = req.body
//   console.log(profile);

//   var access_token = profile.access_token
//   if (!access_token) return res.status(500).json({ message: 'No Access Token provided.' });

//   profile.emails.forEach(function(index, email) {
//     if (email.primary === 'true') profile.email = email.email
//   })

//   if (profile.email) {
//     User.findOne({ 
//       'local.email' : profile.email 
//     }, function(err, user) {
//       if (err) return res.status(500).json({ message: 'Something went wrong.' });

//       // Update existing user
//       if (user) {
//         user.github.id           = profile.id;
//         user.github.access_token = profile.access_token;

//         user.local.fullname  = profile.name;
//         user.local.username  = profile.name;
//         user.local.image     = profile.picture;
//         user.local.email     = profile.email;

//         return user.save(function(err, user) {
//           if (err || !user) return res.status(500).json({ message: 'Something went wrong.' });
//           return returnJWT(req, res, user);
//         });
//       }

//       // Create new user
//       var newUser                 = new User();
//       newUser.github.id           = profile.id;
//       newUser.github.access_token = profile.access_token;

//       newUser.local.fullname  = profile.name;
//       newUser.local.username  = profile.name;
//       newUser.local.image     = profile.picture;
//       newUser.local.email     = profile.email;

//       // Giving a password for mandatory field -> It will not be used.
//       newUser.local.password  = profile.access_token;

//       return newUser.save(function(err, user) {
//         if (err) return res.status(500).json({ message: 'Something went wrong.' });
//         return returnJWT(req, res, user);
//       });
//     });

//   } else {
//     // Github can't find an email
//     User.findOneAndUpdate({ 
//       'github.id' : profile.id
//     }, {
//       'github.access_token' : profile.access_token
//     }, function(err, user) {
//       if (err) return res.status(500).json({ message: 'Something went wrong. ', err });

//       // Return existing user
//       if (user) return returnJWT(req, res, user);

//       // Create new user
//       var newUser                 = new User();
//       newUser.github.id           = profile.id;
//       newUser.github.access_token = profile.access_token;

//       newUser.local.fullname  = profile.name;
//       newUser.local.username  = profile.name;
//       newUser.local.image     = profile.picture;

//       // Giving an email & password for mandatory field -> It will not be used.
//       newUser.local.email          = "temp-"+profile.access_token+"@github.com"
//       newUser.local.password       = profile.access_token;

//       return newUser.save(function(err, user) {
//         if (err) return res.status(500).json({ message: 'Something went wrong.' });
//         return returnJWT(req, res, user);
//       });
//     });
//   }
// }

// // Cant get emails

// function twitter(req, res, next){
//   var profile = req.body;
//   console.log(profile)

//   var access_token = profile.access_token;
//   if (!access_token) return res.status(500).json({ message: 'No Access Token provided.' });

//   // Searching by twitter id, not email as twitter doesn't give emails
//   User.findOneAndUpdate({ 
//     'twitter.id' : profile.id 
//   }, {
//     'twitter.access_token' : profile.access_token
//   }, function(err, user) {
//     if (err) return res.status(500).json({ message: 'Something went wrong. '});

//     // Return existing user
//     if (user) return returnJWT(req, res, user);

//     // Create new user
//     var newUser                  = new User();
//     newUser.twitter.id           = profile.id;
//     newUser.twitter.access_token = profile.access_token;
//     newUser.twitter.screen_name  = profile.screen_name;
//     newUser.twitter.location     = profile.location;
//     newUser.twitter.description  = profile.description;
//     newUser.twitter.first_name   = profile.first_name;
//     newUser.twitter.last_name    = profile.last_name;

//     newUser.local.fullname       = profile.name;
//     newUser.local.username       = profile.screen_name;
//     newUser.local.image          = profile.thumbnail;
//     newUser.local.first_name     = profile.first_name;
//     newUser.local.last_name      = profile.last_name;

//     // Giving an email & password for mandatory field -> It will not be used.
//     newUser.local.email          = "temp-"+profile.access_token+"@twitter.com"
//     newUser.local.password       = profile.access_token;

//     return newUser.save(function(err, user) {
//       if (err) return res.status(500).json({ message: 'Something went wrong.' });
//       return returnJWT(req, res, user);
//     });
//   });
// }

// function instagram(req, res, next){
//   var profile = req.body;
//   console.log(profile);

//   User.findOneAndUpdate({ 
//     'instagram.id' : profile.id 
//   }, {
//     'instagram.access_token' : profile.access_token
//   }, function(err, user) {
//     if (err) return res.status(500).json({ message: 'Something went wrong. '});

//     // Return existing user
//     if (user) return returnJWT(req, res, user);

//     // Create new user
//     var newUser                    = new User();
//     newUser.instagram.id           = profile.id;
//     newUser.instagram.access_token = profile.access_token;
//     newUser.instagram.website      = profile.data.website
//     newUser.instagram.bio          = profile.data.bio
//     newUser.instagram.username     = profile.data.username

//     newUser.local.fullname       = profile.data.full_name;
//     newUser.local.username       = profile.data.username;
//     newUser.local.image          = profile.data.profile_picture;
//     newUser.local.email          = profile.email;
//     newUser.local.first_name     = profile.first_name;
//     newUser.local.last_name      = profile.last_name;

//     // Giving an email & password for mandatory field -> It will not be used.
//     newUser.local.email          = "temp-"+profile.access_token+"@instagram.com"
//     newUser.local.password       = profile.access_token;

//     return newUser.save(function(err, user) {
//       if (err) return res.status(500).json({ message: 'Something went wrong.' });
//       return returnJWT(req, res, user);
//     });
//   });
// }

module.exports = {
  login:     login,
  register:  register
  // ,
  // facebook:  facebook,
  // github:    github,
  // twitter:   twitter,
  // instagram: instagram,
  // linkedin:  linkedin,
  // google:    google
}