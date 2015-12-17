angular
  .module('templateApp')
  .controller('chatsController', ChatsController);

ChatsController.$inject = ['User', 'Chat', 'currentUser', 'socket', '$stateParams', '$state'];

function ChatsController(User, Chat, currentUser, socket, $stateParams, $state) {
  var self  = this;
  
  self.all         = [];
  self.chat        = {};
  self.all         = all;
  self.get         = get;
  self.create      = create;
  self.newMessage  = {}
  self.addMessage  = addMessage;
  self.messages    = [
    {
      content: "Having problems with this.",
      author: "Alice",
      timestamp: new Date()
    },
    {
      content: "Me, too!",
      author: "Bob",
      timestamp: new Date()
    },
  ]

  if ($stateParams.id) {
    // Emit a new chatConnect to fetch the messages and add them to self.messages
    socket.emit("chatConnect", $stateParams.id) // Get me the messages Yo
    get($stateParams.id);
  } 

  all();
  function all() {
    Chat.query(function(data){
      console.log(data)
      return self.all = data;
    });
  }

  function get(id){
    Chat.get({ id: id}, function(data){
      self.chat = data;
    });
  }

  function create() {
    self.chat.created_by   =  currentUser._id;
    self.chat.participants = [currentUser._id];
    var chat = { chat: self.chat }
    Chat.save(chat, function(data){
      self.all.push(data);
      $state.go("chat", { id: data._id})
      self.chat = {};
    });
  }

  function addMessage(){
    console.log(self.newMessage)
    self.newMessage.chat_id = $stateParams.id; 
    self.newMessage.author  = currentUser.getUser()._id;
    self.newMessage.timestamp = new Date();

    socket.emit("newMessage", self.newMessage)
    self.newMessage = {};
  }

  /****************************************/

  socket.on("connect", function(){
    console.log("Connected")
  })

  socket.on("test", function(){
    console.log("connected on test");
  })

  socket.on("updateMessages", function(data) {
    self.messages.push(data)
  })
}











