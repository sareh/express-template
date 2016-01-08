var mongoose    = require('mongoose');
var config      = require('../config/config');
var User        = require('../models/user');
var Chat        = require('../models/chat');
var PrivateChat = require('../models/privateChat');

mongoose.connect(config.database);

function confirmUserSave(err, user){
  if (err) console.log(err);
  console.log("User has been added.", user);
}

function confirmChatSave(err, chat){
  if (err) console.log(err);
  console.log("Chat has been added.", chat);
}

function confirmPrivateChatSave(err, privateChat){
  if (err) console.log(err);
  console.log("Private Chat has been added.", privateChat);
}

var user1 = new User({
  local: {
    email:     "sareh@h.com",
    username:  "sareh",
    password:  "password",
    image:     "/images/flower.png",
    role:      "member"
  }
});

user1.save(confirmUserSave);

var user2 = new User({
  local: {
    email:     "amelia@a.com",
    username:  "amelia",
    password:  "password",
    image:     "/images/flower.png",
    role:      "member"
  }
});

user2.save(confirmUserSave);

var chat1 = new Chat({ 

    title:         "Depression",
    createdBy:     user1._id,
    participants: [user1._id],
    description:   "Venting and sharing tips on how to manage"
});
chat1.save(confirmChatSave);

var chat2 = new Chat({ 

    title:         "Being a Carer",
    createdBy:     user1._id,
    participants: [user1._id, user2._id],
    description:   "I'm a carer for my mum. Just setting this up to chat to others about it."
});

chat2.save(confirmChatSave);


var chat3 = new Chat({ 

    title:         "Mindfulness",
    createdBy:     user1._id,
    participants: [user1._id, user2._id],
    description:   "Sharing tips & resources that helped me."
});

chat3.save(confirmChatSave);

