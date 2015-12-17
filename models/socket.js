var mongoose = require('mongoose');
var app      = require('express')();
var server   = require('http').createServer(app);
var io       = require('socket.io').listen(server);
var Chat     = require('./chat');

var chats    = {};
var member   = {};

io.on('connection', function(socket){
  // console.log("Triggering 'connection'");

  // socket.on('createChat', function(socketId, createdByUserId){
  //   console.log('Starting new chat with id'+ socketId +', by user '+createdByUserId.);

  //   // I have chats in my database. 
  //   // Do I save all the sockets that are currently connected, in the mongodb database?
  //   // No. This would be too slow.
  //   // Only save to the database when there are new messages.
  //   //How many people are in this chat at the same time? 

  //   chats[socketId] = {
  //     id: socketId,
  //     members: []
  //   }
  //   // Save member
  //   member[socketId] = {
  //     id: socketId,
  //     score: 0
  //   }

  //   chats[socketId].members.push(member[socketId]);
  //   // Add to list of chats
  //   io.emit("addToListOfGames", chats[socketId]);
  //   // Join new room for that game
  //   socket.join("chat_"+socketId);

    
  // });
});


////
// chats = {
//   socketId1: {
//     id: socketid1,
//     members: []
//   },
//   socketId2: {
//     id: socketid2,
//     members: []
//   }
// }

// member = {
//   socketId1: {
//     id: socketId1,
//     score: 0
//   }
// }
/////