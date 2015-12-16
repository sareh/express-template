var mongoose = require('mongoose');
var io       = require('socket.io');
var User     = require('./user');

var chatSchema = new mongoose.Schema({
  title:         { type: String, required: true },
  createdBy:     { type: mongoose.Schema.ObjectId, ref: 'User' },
  participants: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  description:   { type: String }
},
{ timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);