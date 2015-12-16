var mongoose = require('mongoose');
var io       = require('socket.io');
var User     = require('user');

var chatSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  // created_by:  User.Schema,
  // users:      [User.Schema]
},
{ 
  timestamps: { createdAt: 'created_at',
                updatedAt: 'updated_at' 
              } 
}
);

module.exports = mongoose.model("Chat", chatSchema);