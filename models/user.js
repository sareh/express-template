var mongoose   = require('mongoose');
var bcrypt     = require('bcrypt-nodejs');
var userSchema = new mongoose.Schema({
  local: {
    email:    { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image:    { type: String },
    role:     { type: String, required: true, default: "member" }
  },
  privatechats: [Privatechat.Schema]
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
});

module.exports = mongoose.model("User", userSchema);