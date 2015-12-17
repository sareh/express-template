angular
  .module('templateApp')
  .controller('chatsController', ChatsController);

ChatsController.$inject = ['User', 'Chat', 'currentUser'];

function ChatsController(User, Chat, currentUser) {
  var self  = this;
  
  self.all    = [];
  self.chat   = {};
  self.get    = get;
  self.create = create;

  function get() {
    Chat.query(function(data){
      return self.all = data;
    });
  }

  function create() {
    self.chat.created_by   =  currentUser._id;
    self.chat.participants = [currentUser._id];
    var chat = { chat: self.chat }
    Chat.save(chat, function(data){
      self.all.push(data);
      self.chat = {};
    });
  }

  self.getChats();
}