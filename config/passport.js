var LocalStrategy  = require("passport-local").Strategy;
// var GithubStrategy = require("passport-github").Strategy;
var User           = require("../models/user");

module.exports = function(passport) {

  passport.use('local-signup', new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
  }, function(req, email, password, done) {

    User.findOne({ 'local.email' : email }, function(err, user) {
      if (err) return done(err, false, { message: "Sorry, something went wrong. Please try again!" });

      if (user) return done(null, false, { message: "That email is already registered!" });

      var newUser            = new User();
      newUser.local.email    = req.body.email;
      newUser.local.username = req.body.username;
      newUser.local.image    = req.body.image;
      newUser.local.role     = req.body.role;
      newUser.local.password = User.encrypt(password);

      newUser.save(function(err, user) {
        if (err) return done(err, false, { message: "Sorry, something went wrong. Please try again!" });

        return done(null, user);
      });
    });
  }));
}