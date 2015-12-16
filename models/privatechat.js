var mongoose = require('mongoose');
var app      = require('express')();
var server   = require('http').createServer(app);
var io       = require('socket.io').listen(server)

io.on('connection', function(){

});
server.listen(process.env.PORT || 3000);

var privatechatSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  created_at: { type: Date,   required: true },
  creator:    { type: String },
  invited:    { type: String }
});
// Note that creator is the user that created the chat & invited is the user that was invited to and joined the chat.
// They are both being sent the socket data.

module.exports = mongoose.model("Privatechat", privatechatSchema);