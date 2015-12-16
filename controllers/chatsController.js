var Chat   = require('../models/chat');

function chatsIndex(req, res) {
  Chat.find(function(err, chats){
    if (err) return res.status(404).send({ message: 'Sorry, something went wrong.' });
    res.status(200).send(chats);
  });
}

function chatsShow(req, res) {
  Chat.findById(req.params.id, function(){
    if (err) return res.status(404).send({ message: 'Sorry, something went wrong.' });
    res.status(200).send(chat);
  });
}

function chatsCreate(req, res) {
  var chat = new Chat(req.body.chat);
  chat.participants.push(req.body.chat.created_by);
  chat.save(function(err){
    if (err) return res.status(500).send(err);
    res.status(201).send(chat);
  });
}

function chatJoin(req, res) {
  Chat.findById(req.params.id, function(){
    if (err) return res.status(404).send({ message: 'Sorry, something went wrong.' });
    
    var joiningUserId = req.body.currentUser._id;
    chat.participants.push(joiningUserId);
    res.status(200).send(chat);
    // res.status(200).json({ chat: chat ,
    //                       message: "Welcome to the chat"
    //                     });
  });
}

module.exports = {
  chatsIndex:  chatsIndex,
  chatsShow:   chatsShow,
  chatsCreate: chatsCreate,
  chatJoin:    chatJoin
}