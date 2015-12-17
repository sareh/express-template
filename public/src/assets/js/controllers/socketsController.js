angular
  .module('templateApp')
  .controller('socketsController', SocketsController);

function SocketsController() {
  // var self          = this;

  // self.socket       = io.connect(API);
  // self.socketId     = '';
  // self.chatId       = '';
  // self.creatingUser = '';

  // self.start        = start;
  // self.join         = join;
  
  // function start() {
  //   event.preventDefault();

  //   self.socketId = self.socket.io.engine.id;
  //   self.creatingUser = currentUser.user;
  //   console.log("creating player is", self.creatingUser);
  //   return self.socket.emit('newChat', self.socketId, self.creatingUser);
  // }

  // function join() {
  //   event.preventDefault();
  //   self.socketId = self.socket.io.engine.id;
  //   self.chatId   = $(this).data('chatid');

  //   self.joiningUser = currentUser.user;
  //   self.socket.emit('joinedChat', chatId, self.socketId, self.joiningUser);
  //   return inChat(chatId)
  // }

  // return self;
}