var mongoose    = require('mongoose');
var bcrypt      = require('bcrypt-nodejs');
// var Chat        = require('chat');
// var Privatechat = require('privatechat');

var userSchema = new mongoose.Schema({
  local: {
    email:    { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image:    { type: String },
    role:     { type: String, required: true, default: "member" }
  }
  // ,
  // privatechats: [privatechat.Schema]
  // ,
  //   facebook: {
  //     id:           { type: String },
  //     access_token: { type: String },
  //     first_name:   { type: String },
  //     last_name:    { type: String },
  //     picture:      { type: String },
  //     thumbnail:    { type: String },
  //   },
  //   github: {
  //     id:           { type: String },
  //     access_token: { type: String },
  //   },
  //   twitter: {
  //     id:           { type: String },
  //     access_token: { type: String },
  //     screen_name:  { type: String },
  //     location:     { type: String },
  //     description:  { type: String },
  //     first_name:   { type: String },
  //     last_name:    { type: String },
  //   },
  //   instagram: {
  //     id:           { type: String },
  //     access_token: { type: String },
  //     website:      { type: String },
  //     bio:          { type: String },
  //     username:     { type: String },
  //   },
  //   linkedin: {
  //     id:           { type: String },
  //     access_token: { type: String },
  //   },
  //   google: {
  //     id:           { type: String },
  //     access_token: { type: String },
  //     gender:       { type: String },
  //     displayName:  { type: String },
  //     name:         { type: String },
  //     url:          { type: String },
  //     image:        { type: String },
  //     thumbnail:    { type: String },
  //     first_name:   { type: String },
  //     last_name:    { type: String },
  //   }
},
{ timestamps: true });


userSchema.statics.encrypt = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
}

module.exports = mongoose.model("User", userSchema);