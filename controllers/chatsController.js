var Chat   = require('../models/chat');

function chatsIndex(req, res) {
  Chat.find(function(err, chats){
    if (err) return res.status(404).send({ message: 'Sorry, something went wrong.' });
    res.status(200).send(chats);
  });
}

function chatsShow(req, res) {
  Chat.findById(req.params.id, function(err, chat){
    if (err) return res.status(404).send({ message: 'Sorry, something went wrong.' });
    res.status(200).send(chat);
  });
}

function chatsCreate(req, res) {
  var chat = new Chat(req.body.chat);
  chat.save(function(err){
    if (err) return res.status(500).send(err);
    res.status(201).send(chat);
  });
}

function chatsJoin(req, res) {
  console.log("Inside chatsJoin!");
  Chat.findById(req.params.id, function(err, chat){
    if (err) return res.status(404).send({ message: 'Sorry, something went wrong.' });
    console.log(req.body);
    var joiningUserId = req.body.currentUser._id;
    console.log(joiningUserId);
    chat.participants.push(joiningUserId);
    res.status(200).send(chat);
    // res.status(200).json({ chat: chat ,
    //                       message: "Welcome to the chat"
    //                     });
  });
}

function chatsUpdate(req, res) {
  Chat.findById(req.params.id,  function(err, chat) {
    if (err) return res.status(500).json({message: "Sorry, something went wrong!"});
    if (!chat) return res.status(404).json({message: 'No chat found.'});

    if (req.body.title)       chat.title       = req.body.title;
    if (req.body.description) chat.description = req.body.description;

    chat.save(function(err) {
     if (err) return res.status(500).json({message: "Sorry, something went wrong."});

     res.status(201).json({message: 'Chat successfully updated.', chat: chat});
   });
  });
}

function chatsDelete(req, res) {
  Chat.findByIdAndRemove({ _id: req.params.id }, function(err) {
    if (err) return res.status(500).send({ message: "Sorry, something went wrong!"});
    res.status(200).send({ message: "Chat successfully deleted!" });
  });
}

module.exports = {
  chatsIndex:  chatsIndex,
  chatsShow:   chatsShow,
  chatsCreate: chatsCreate,
  chatsUpdate: chatsUpdate,
  chatsJoin:   chatsJoin,
  chatsDelete: chatsDelete
}