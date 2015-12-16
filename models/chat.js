var mongoose = require('mongoose');
var io       = require('socket.io');

//This chat is with multiple users
var chatSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  created_at: { type: Date,   required: true },
  created_by:  User.Schema,
  users:      [User.Schema]
});

module.exports = mongoose.model("Chat", chatSchema);