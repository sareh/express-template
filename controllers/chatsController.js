var Chat   = require('../models/chat');

function chatsIndex(req, res) {
  Chat.find(function(err, chats){
    if (err) return res.status(404).json({ message: 'Sorry, something went wrong.' });
    res.status(200).json({ chats: chats });
  });
}

function chatsShow(req, res) {
  Chat.findById(req.params.id, function(){
    if (err) return res.status(404).json({ message: 'Sorry, something went wrong.' });
    res.status(200).json({ chat: chat });
  });
}

function chatsCreate(req, res){
  var chat = new Chat(req.body.chat);
  chat.save(function(err){
    if (err) return res.status(500).send(err);

    // Pushes in chat to the User's model in the user.chats array
    var id = req.body.chat.user_id;
    User.findById(id, function(err, user){
       user.chats.push(chat);
       user.save();
       return res.status(201).send(chat)
    });
  });
}

module.exports = {
  chatsIndex:  chatsIndex,
  chatsShow:   chatsShow,
  chatsCreate: chatsCreate
}