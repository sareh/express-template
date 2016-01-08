angular
  .module('templateApp', [
    'ngAria',
    'ui.router',
    'angular-jwt',
    'ngResource'
  ]) 
  .constant('API', 'http://localhost:3000/api')
  .config(MainRouter)
  .config(addAuthInterceptor);

MainRouter.$inject = ['$stateProvider', '$urlRouterProvider'];

function MainRouter($stateProvider, $urlRouterProvider){
 
  $stateProvider
    .state('home', { 
      url: '/',
      templateUrl: '/src/assets/views/home.html',
      controller: 'chatsController as chats'
    })
    .state('about', {
      url: '/about',
      templateUrl: '/src/assets/views/about.html',
    })
    .state('profile', {
      url: '/profile',
      templateUrl: '/src/assets/views/profile.html',
    })
    .state('register', {
      url: '/register',
      templateUrl: '/src/assets/views/register.html',
    })
    .state('login', {
      url: '/login',
      templateUrl: '/src/assets/views/login.html',
    })
    .state('users', {
      url: '/users',
      templateUrl: '/src/assets/views/users.html',
    })
    .state('chat', {
      url: '/chats/:id',
      templateUrl: '/src/assets/views/chat.html',
      controller: 'chatsController as chats'
    })
    .state('chats', {
      url: '/chats',
      templateUrl: '/src/assets/views/chats.html',
      controller: 'chatsController as chats'
    })
    // .state('newchat', {
    //   url: "/newchat",
    //   templateUrl: "/src/assets/views/newchat.html"
    // });
  $urlRouterProvider.otherwise('/');
}

addAuthInterceptor.$inject = ['$httpProvider'];

function addAuthInterceptor($httpProvider){
  $httpProvider.interceptors.push('authInterceptor');
}  

angular
  .module('templateApp')
  .service('tokenService', TokenService);

TokenService.$inject = ['$window', 'jwtHelper'];
function TokenService($window, jwtHelper){

  var self = this;

  self.setToken    = setToken;
  self.getToken    = getToken;
  self.decodeToken = decodeToken;
  self.removeToken = removeToken;

  function setToken (token) {
    return $window.localStorage.setItem('auth-token', token);
  }

  function getToken (){
    return $window.localStorage.getItem('auth-token');
  }

  function decodeToken (){
    var token = self.getToken();
    return token ? jwtHelper.decodeToken(token) : {};
  }

  function removeToken (){
    return $window.localStorage.removeItem('auth-token');
  }
}
angular
  .module('templateApp')
  .factory('authInterceptor', AuthInterceptor);

AuthInterceptor.$inject = ['API', 'tokenService'];
function AuthInterceptor(API, tokenService) {

  return {
    
    request: function(config){
      var token = tokenService.getToken();

      if (config.url.indexOf(API) === 0 && token) {
        config.headers.Authorization = 'Bearer ' + token;
      }
      return config;
    },

    response: function(res){
      if (res.config.url.indexOf(API) === 0 && res.data.token) {
        tokenService.setToken(res.data.token);
      }
      return res;
    }

  }
}
angular
  .module('templateApp')
  .service('currentUser', CurrentUser);

CurrentUser.$inject = ['tokenService']
function CurrentUser(tokenService){

  var self  = this;
  self.user = {} 

  self.saveUser = function(user){
    return self.user = user
  }

  self.getUser = function(){
    return tokenService.decodeToken();
  }

  self.clearUser = function(){
    return self.user = {};
  }
}
angular
  .module('templateApp')
  .factory('socket', SocketFactory);

function SocketFactory($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
}
angular
  .module('templateApp')
  .factory('User', User)

User.$inject = ['$resource', 'API']
function User($resource, API){

  return $resource(
    API+'/users/:id', 
    {id: '@id'},
    { 
      'get':       { method: 'GET' },
      'save':      { method: 'POST' },
      'query':     { method: 'GET', isArray: false},
      'remove':    { method: 'DELETE' },
      'delete':    { method: 'DELETE' },
      'register': {
        url: API +'/register',
        method: "POST"
      },
      'login':{
        url: API + '/login',
        method: "POST"
      }
    });
}
angular
  .module('templateApp')
  .factory('Chat', Chat)

Chat.$inject = ['$resource', 'API']
function Chat($resource, API){

  return $resource(
    API+'/chats/:id', 
    { id:         '@id'},
    { 'get':    { method: 'GET' },
      'save':   { method: 'POST' },
      'query':  { method: 'GET', isArray: true},
      // 'remove': { method: 'DELETE' },
      // 'delete': { method: 'DELETE' }
    });
}
angular
  .module('templateApp')
  .controller('usersController', UsersController);

UsersController.$inject = ['$resource', 'User', 'tokenService', '$state', 'currentUser'];

function UsersController($resource, User, tokenService, $state, currentUser) {
  
  var self = this;
  this.controllerName = "usersController"

  self.all          = [];
  self.user         = {};
  self.register     = register;
  self.login        = login;
  self.logout       = logout;
  self.isLoggedIn   = isLoggedIn;
  self.getUsers     = getUsers;

  function register() {
    User.register(self.user, handleLogin);
  }

  function login() {
    User.login(self.user, handleLogin);
  }

  function logout() {
    tokenService.removeToken();
    currentUser.clearUser();
    self.all  = [];
    self.user = {};
  }

  function isLoggedIn() {
    var loggedIn = !!tokenService.getToken();
    return loggedIn;
  }

  function getUsers() {
    User.query(function(data){
     return self.all = data.users;
   });
  }

  function handleLogin(response) {
    var token = response.token ? response.token : null;
    if (token) {
      self.getUsers();
      $state.go('home');
    }
    self.user = tokenService.decodeToken();
    currentUser.saveUser(self.user);
  }

  if (currentUser.getUser()) {
    // self.getUsers();
    // self.user = tokenService.decodeToken();
  }

  return self;
}
angular
  .module('templateApp')
  .controller('chatsController', ChatsController);

ChatsController.$inject = ['User', 'Chat', 'currentUser', 'socket', '$stateParams', '$state'];

function ChatsController(User, Chat, currentUser, socket, $stateParams, $state) {
  var self  = this;
  
  self.all           = [];
  self.chat          = {};
  self.all           = all;
  self.get           = get;
  self.create        = create;
  self.newMessage    = {}
  self.addMessage    = addMessage;
  self.joinChat      = joinChat;
  self.currentChatId = '';
  self.currentUserId = '';

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
    console.log($stateParams)
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

  function joinChat() {
    console.log(self.chat);
    // need to send the chat._id,
    // currentUser.getUser()._id;
    socket.emit("joinChat", 
      { currentChatId: $stateParams.id, 
        currentUserId: currentUser.getUser()._id 
      });
  }
  function addMessage() {
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












//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsInRva2VuU2VydmljZS5qcyIsImF1dGhJbnRlcmNlcHRvci5qcyIsImN1cnJlbnRVc2VyLmpzIiwic29ja2V0RmFjdG9yeS5qcyIsInVzZXIuanMiLCJjaGF0LmpzIiwidXNlcnNDb250cm9sbGVyLmpzIiwiY2hhdHNDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhbmd1bGFyLWFwcC1jb25jYXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyXG4gIC5tb2R1bGUoJ3RlbXBsYXRlQXBwJywgW1xuICAgICduZ0FyaWEnLFxuICAgICd1aS5yb3V0ZXInLFxuICAgICdhbmd1bGFyLWp3dCcsXG4gICAgJ25nUmVzb3VyY2UnXG4gIF0pIFxuICAuY29uc3RhbnQoJ0FQSScsICdodHRwOi8vbG9jYWxob3N0OjMwMDAvYXBpJylcbiAgLmNvbmZpZyhNYWluUm91dGVyKVxuICAuY29uZmlnKGFkZEF1dGhJbnRlcmNlcHRvcik7XG5cbk1haW5Sb3V0ZXIuJGluamVjdCA9IFsnJHN0YXRlUHJvdmlkZXInLCAnJHVybFJvdXRlclByb3ZpZGVyJ107XG5cbmZ1bmN0aW9uIE1haW5Sb3V0ZXIoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcil7XG4gXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdob21lJywgeyBcbiAgICAgIHVybDogJy8nLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvc3JjL2Fzc2V0cy92aWV3cy9ob21lLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ2NoYXRzQ29udHJvbGxlciBhcyBjaGF0cydcbiAgICB9KVxuICAgIC5zdGF0ZSgnYWJvdXQnLCB7XG4gICAgICB1cmw6ICcvYWJvdXQnLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvc3JjL2Fzc2V0cy92aWV3cy9hYm91dC5odG1sJyxcbiAgICB9KVxuICAgIC5zdGF0ZSgncHJvZmlsZScsIHtcbiAgICAgIHVybDogJy9wcm9maWxlJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnL3NyYy9hc3NldHMvdmlld3MvcHJvZmlsZS5odG1sJyxcbiAgICB9KVxuICAgIC5zdGF0ZSgncmVnaXN0ZXInLCB7XG4gICAgICB1cmw6ICcvcmVnaXN0ZXInLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvc3JjL2Fzc2V0cy92aWV3cy9yZWdpc3Rlci5odG1sJyxcbiAgICB9KVxuICAgIC5zdGF0ZSgnbG9naW4nLCB7XG4gICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvc3JjL2Fzc2V0cy92aWV3cy9sb2dpbi5odG1sJyxcbiAgICB9KVxuICAgIC5zdGF0ZSgndXNlcnMnLCB7XG4gICAgICB1cmw6ICcvdXNlcnMnLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvc3JjL2Fzc2V0cy92aWV3cy91c2Vycy5odG1sJyxcbiAgICB9KVxuICAgIC5zdGF0ZSgnY2hhdCcsIHtcbiAgICAgIHVybDogJy9jaGF0cy86aWQnLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvc3JjL2Fzc2V0cy92aWV3cy9jaGF0Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ2NoYXRzQ29udHJvbGxlciBhcyBjaGF0cydcbiAgICB9KVxuICAgIC5zdGF0ZSgnY2hhdHMnLCB7XG4gICAgICB1cmw6ICcvY2hhdHMnLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvc3JjL2Fzc2V0cy92aWV3cy9jaGF0cy5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdjaGF0c0NvbnRyb2xsZXIgYXMgY2hhdHMnXG4gICAgfSlcbiAgICAvLyAuc3RhdGUoJ25ld2NoYXQnLCB7XG4gICAgLy8gICB1cmw6IFwiL25ld2NoYXRcIixcbiAgICAvLyAgIHRlbXBsYXRlVXJsOiBcIi9zcmMvYXNzZXRzL3ZpZXdzL25ld2NoYXQuaHRtbFwiXG4gICAgLy8gfSk7XG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbn1cblxuYWRkQXV0aEludGVyY2VwdG9yLiRpbmplY3QgPSBbJyRodHRwUHJvdmlkZXInXTtcblxuZnVuY3Rpb24gYWRkQXV0aEludGVyY2VwdG9yKCRodHRwUHJvdmlkZXIpe1xuICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKCdhdXRoSW50ZXJjZXB0b3InKTtcbn0gIFxuIiwiYW5ndWxhclxuICAubW9kdWxlKCd0ZW1wbGF0ZUFwcCcpXG4gIC5zZXJ2aWNlKCd0b2tlblNlcnZpY2UnLCBUb2tlblNlcnZpY2UpO1xuXG5Ub2tlblNlcnZpY2UuJGluamVjdCA9IFsnJHdpbmRvdycsICdqd3RIZWxwZXInXTtcbmZ1bmN0aW9uIFRva2VuU2VydmljZSgkd2luZG93LCBqd3RIZWxwZXIpe1xuXG4gIHZhciBzZWxmID0gdGhpcztcblxuICBzZWxmLnNldFRva2VuICAgID0gc2V0VG9rZW47XG4gIHNlbGYuZ2V0VG9rZW4gICAgPSBnZXRUb2tlbjtcbiAgc2VsZi5kZWNvZGVUb2tlbiA9IGRlY29kZVRva2VuO1xuICBzZWxmLnJlbW92ZVRva2VuID0gcmVtb3ZlVG9rZW47XG5cbiAgZnVuY3Rpb24gc2V0VG9rZW4gKHRva2VuKSB7XG4gICAgcmV0dXJuICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2F1dGgtdG9rZW4nLCB0b2tlbik7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRUb2tlbiAoKXtcbiAgICByZXR1cm4gJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYXV0aC10b2tlbicpO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVjb2RlVG9rZW4gKCl7XG4gICAgdmFyIHRva2VuID0gc2VsZi5nZXRUb2tlbigpO1xuICAgIHJldHVybiB0b2tlbiA/IGp3dEhlbHBlci5kZWNvZGVUb2tlbih0b2tlbikgOiB7fTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZVRva2VuICgpe1xuICAgIHJldHVybiAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdhdXRoLXRva2VuJyk7XG4gIH1cbn0iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ3RlbXBsYXRlQXBwJylcbiAgLmZhY3RvcnkoJ2F1dGhJbnRlcmNlcHRvcicsIEF1dGhJbnRlcmNlcHRvcik7XG5cbkF1dGhJbnRlcmNlcHRvci4kaW5qZWN0ID0gWydBUEknLCAndG9rZW5TZXJ2aWNlJ107XG5mdW5jdGlvbiBBdXRoSW50ZXJjZXB0b3IoQVBJLCB0b2tlblNlcnZpY2UpIHtcblxuICByZXR1cm4ge1xuICAgIFxuICAgIHJlcXVlc3Q6IGZ1bmN0aW9uKGNvbmZpZyl7XG4gICAgICB2YXIgdG9rZW4gPSB0b2tlblNlcnZpY2UuZ2V0VG9rZW4oKTtcblxuICAgICAgaWYgKGNvbmZpZy51cmwuaW5kZXhPZihBUEkpID09PSAwICYmIHRva2VuKSB7XG4gICAgICAgIGNvbmZpZy5oZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmVhcmVyICcgKyB0b2tlbjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb25maWc7XG4gICAgfSxcblxuICAgIHJlc3BvbnNlOiBmdW5jdGlvbihyZXMpe1xuICAgICAgaWYgKHJlcy5jb25maWcudXJsLmluZGV4T2YoQVBJKSA9PT0gMCAmJiByZXMuZGF0YS50b2tlbikge1xuICAgICAgICB0b2tlblNlcnZpY2Uuc2V0VG9rZW4ocmVzLmRhdGEudG9rZW4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgfVxufSIsImFuZ3VsYXJcbiAgLm1vZHVsZSgndGVtcGxhdGVBcHAnKVxuICAuc2VydmljZSgnY3VycmVudFVzZXInLCBDdXJyZW50VXNlcik7XG5cbkN1cnJlbnRVc2VyLiRpbmplY3QgPSBbJ3Rva2VuU2VydmljZSddXG5mdW5jdGlvbiBDdXJyZW50VXNlcih0b2tlblNlcnZpY2Upe1xuXG4gIHZhciBzZWxmICA9IHRoaXM7XG4gIHNlbGYudXNlciA9IHt9IFxuXG4gIHNlbGYuc2F2ZVVzZXIgPSBmdW5jdGlvbih1c2VyKXtcbiAgICByZXR1cm4gc2VsZi51c2VyID0gdXNlclxuICB9XG5cbiAgc2VsZi5nZXRVc2VyID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdG9rZW5TZXJ2aWNlLmRlY29kZVRva2VuKCk7XG4gIH1cblxuICBzZWxmLmNsZWFyVXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHNlbGYudXNlciA9IHt9O1xuICB9XG59IiwiYW5ndWxhclxuICAubW9kdWxlKCd0ZW1wbGF0ZUFwcCcpXG4gIC5mYWN0b3J5KCdzb2NrZXQnLCBTb2NrZXRGYWN0b3J5KTtcblxuZnVuY3Rpb24gU29ja2V0RmFjdG9yeSgkcm9vdFNjb3BlKSB7XG4gIHZhciBzb2NrZXQgPSBpby5jb25uZWN0KCk7XG4gIHJldHVybiB7XG4gICAgb246IGZ1bmN0aW9uIChldmVudE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICBzb2NrZXQub24oZXZlbnROYW1lLCBmdW5jdGlvbiAoKSB7ICBcbiAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICRyb290U2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBjYWxsYmFjay5hcHBseShzb2NrZXQsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZW1pdDogZnVuY3Rpb24gKGV2ZW50TmFtZSwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIHNvY2tldC5lbWl0KGV2ZW50TmFtZSwgZGF0YSwgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoc29ja2V0LCBhcmdzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICB9XG4gIH07XG59IiwiYW5ndWxhclxuICAubW9kdWxlKCd0ZW1wbGF0ZUFwcCcpXG4gIC5mYWN0b3J5KCdVc2VyJywgVXNlcilcblxuVXNlci4kaW5qZWN0ID0gWyckcmVzb3VyY2UnLCAnQVBJJ11cbmZ1bmN0aW9uIFVzZXIoJHJlc291cmNlLCBBUEkpe1xuXG4gIHJldHVybiAkcmVzb3VyY2UoXG4gICAgQVBJKycvdXNlcnMvOmlkJywgXG4gICAge2lkOiAnQGlkJ30sXG4gICAgeyBcbiAgICAgICdnZXQnOiAgICAgICB7IG1ldGhvZDogJ0dFVCcgfSxcbiAgICAgICdzYXZlJzogICAgICB7IG1ldGhvZDogJ1BPU1QnIH0sXG4gICAgICAncXVlcnknOiAgICAgeyBtZXRob2Q6ICdHRVQnLCBpc0FycmF5OiBmYWxzZX0sXG4gICAgICAncmVtb3ZlJzogICAgeyBtZXRob2Q6ICdERUxFVEUnIH0sXG4gICAgICAnZGVsZXRlJzogICAgeyBtZXRob2Q6ICdERUxFVEUnIH0sXG4gICAgICAncmVnaXN0ZXInOiB7XG4gICAgICAgIHVybDogQVBJICsnL3JlZ2lzdGVyJyxcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIlxuICAgICAgfSxcbiAgICAgICdsb2dpbic6e1xuICAgICAgICB1cmw6IEFQSSArICcvbG9naW4nLFxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiXG4gICAgICB9XG4gICAgfSk7XG59IiwiYW5ndWxhclxuICAubW9kdWxlKCd0ZW1wbGF0ZUFwcCcpXG4gIC5mYWN0b3J5KCdDaGF0JywgQ2hhdClcblxuQ2hhdC4kaW5qZWN0ID0gWyckcmVzb3VyY2UnLCAnQVBJJ11cbmZ1bmN0aW9uIENoYXQoJHJlc291cmNlLCBBUEkpe1xuXG4gIHJldHVybiAkcmVzb3VyY2UoXG4gICAgQVBJKycvY2hhdHMvOmlkJywgXG4gICAgeyBpZDogICAgICAgICAnQGlkJ30sXG4gICAgeyAnZ2V0JzogICAgeyBtZXRob2Q6ICdHRVQnIH0sXG4gICAgICAnc2F2ZSc6ICAgeyBtZXRob2Q6ICdQT1NUJyB9LFxuICAgICAgJ3F1ZXJ5JzogIHsgbWV0aG9kOiAnR0VUJywgaXNBcnJheTogdHJ1ZX0sXG4gICAgICAvLyAncmVtb3ZlJzogeyBtZXRob2Q6ICdERUxFVEUnIH0sXG4gICAgICAvLyAnZGVsZXRlJzogeyBtZXRob2Q6ICdERUxFVEUnIH1cbiAgICB9KTtcbn0iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ3RlbXBsYXRlQXBwJylcbiAgLmNvbnRyb2xsZXIoJ3VzZXJzQ29udHJvbGxlcicsIFVzZXJzQ29udHJvbGxlcik7XG5cblVzZXJzQ29udHJvbGxlci4kaW5qZWN0ID0gWyckcmVzb3VyY2UnLCAnVXNlcicsICd0b2tlblNlcnZpY2UnLCAnJHN0YXRlJywgJ2N1cnJlbnRVc2VyJ107XG5cbmZ1bmN0aW9uIFVzZXJzQ29udHJvbGxlcigkcmVzb3VyY2UsIFVzZXIsIHRva2VuU2VydmljZSwgJHN0YXRlLCBjdXJyZW50VXNlcikge1xuICBcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLmNvbnRyb2xsZXJOYW1lID0gXCJ1c2Vyc0NvbnRyb2xsZXJcIlxuXG4gIHNlbGYuYWxsICAgICAgICAgID0gW107XG4gIHNlbGYudXNlciAgICAgICAgID0ge307XG4gIHNlbGYucmVnaXN0ZXIgICAgID0gcmVnaXN0ZXI7XG4gIHNlbGYubG9naW4gICAgICAgID0gbG9naW47XG4gIHNlbGYubG9nb3V0ICAgICAgID0gbG9nb3V0O1xuICBzZWxmLmlzTG9nZ2VkSW4gICA9IGlzTG9nZ2VkSW47XG4gIHNlbGYuZ2V0VXNlcnMgICAgID0gZ2V0VXNlcnM7XG5cbiAgZnVuY3Rpb24gcmVnaXN0ZXIoKSB7XG4gICAgVXNlci5yZWdpc3RlcihzZWxmLnVzZXIsIGhhbmRsZUxvZ2luKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvZ2luKCkge1xuICAgIFVzZXIubG9naW4oc2VsZi51c2VyLCBoYW5kbGVMb2dpbik7XG4gIH1cblxuICBmdW5jdGlvbiBsb2dvdXQoKSB7XG4gICAgdG9rZW5TZXJ2aWNlLnJlbW92ZVRva2VuKCk7XG4gICAgY3VycmVudFVzZXIuY2xlYXJVc2VyKCk7XG4gICAgc2VsZi5hbGwgID0gW107XG4gICAgc2VsZi51c2VyID0ge307XG4gIH1cblxuICBmdW5jdGlvbiBpc0xvZ2dlZEluKCkge1xuICAgIHZhciBsb2dnZWRJbiA9ICEhdG9rZW5TZXJ2aWNlLmdldFRva2VuKCk7XG4gICAgcmV0dXJuIGxvZ2dlZEluO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0VXNlcnMoKSB7XG4gICAgVXNlci5xdWVyeShmdW5jdGlvbihkYXRhKXtcbiAgICAgcmV0dXJuIHNlbGYuYWxsID0gZGF0YS51c2VycztcbiAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlTG9naW4ocmVzcG9uc2UpIHtcbiAgICB2YXIgdG9rZW4gPSByZXNwb25zZS50b2tlbiA/IHJlc3BvbnNlLnRva2VuIDogbnVsbDtcbiAgICBpZiAodG9rZW4pIHtcbiAgICAgIHNlbGYuZ2V0VXNlcnMoKTtcbiAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgIH1cbiAgICBzZWxmLnVzZXIgPSB0b2tlblNlcnZpY2UuZGVjb2RlVG9rZW4oKTtcbiAgICBjdXJyZW50VXNlci5zYXZlVXNlcihzZWxmLnVzZXIpO1xuICB9XG5cbiAgaWYgKGN1cnJlbnRVc2VyLmdldFVzZXIoKSkge1xuICAgIC8vIHNlbGYuZ2V0VXNlcnMoKTtcbiAgICAvLyBzZWxmLnVzZXIgPSB0b2tlblNlcnZpY2UuZGVjb2RlVG9rZW4oKTtcbiAgfVxuXG4gIHJldHVybiBzZWxmO1xufSIsImFuZ3VsYXJcbiAgLm1vZHVsZSgndGVtcGxhdGVBcHAnKVxuICAuY29udHJvbGxlcignY2hhdHNDb250cm9sbGVyJywgQ2hhdHNDb250cm9sbGVyKTtcblxuQ2hhdHNDb250cm9sbGVyLiRpbmplY3QgPSBbJ1VzZXInLCAnQ2hhdCcsICdjdXJyZW50VXNlcicsICdzb2NrZXQnLCAnJHN0YXRlUGFyYW1zJywgJyRzdGF0ZSddO1xuXG5mdW5jdGlvbiBDaGF0c0NvbnRyb2xsZXIoVXNlciwgQ2hhdCwgY3VycmVudFVzZXIsIHNvY2tldCwgJHN0YXRlUGFyYW1zLCAkc3RhdGUpIHtcbiAgdmFyIHNlbGYgID0gdGhpcztcbiAgXG4gIHNlbGYuYWxsICAgICAgICAgICA9IFtdO1xuICBzZWxmLmNoYXQgICAgICAgICAgPSB7fTtcbiAgc2VsZi5hbGwgICAgICAgICAgID0gYWxsO1xuICBzZWxmLmdldCAgICAgICAgICAgPSBnZXQ7XG4gIHNlbGYuY3JlYXRlICAgICAgICA9IGNyZWF0ZTtcbiAgc2VsZi5uZXdNZXNzYWdlICAgID0ge31cbiAgc2VsZi5hZGRNZXNzYWdlICAgID0gYWRkTWVzc2FnZTtcbiAgc2VsZi5qb2luQ2hhdCAgICAgID0gam9pbkNoYXQ7XG4gIHNlbGYuY3VycmVudENoYXRJZCA9ICcnO1xuICBzZWxmLmN1cnJlbnRVc2VySWQgPSAnJztcblxuICBzZWxmLm1lc3NhZ2VzICAgID0gW1xuICAgIHtcbiAgICAgIGNvbnRlbnQ6IFwiSGF2aW5nIHByb2JsZW1zIHdpdGggdGhpcy5cIixcbiAgICAgIGF1dGhvcjogXCJBbGljZVwiLFxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXG4gICAgfSxcbiAgICB7XG4gICAgICBjb250ZW50OiBcIk1lLCB0b28hXCIsXG4gICAgICBhdXRob3I6IFwiQm9iXCIsXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcbiAgICB9LFxuICBdXG5cbiAgaWYgKCRzdGF0ZVBhcmFtcy5pZCkge1xuICAgIGNvbnNvbGUubG9nKCRzdGF0ZVBhcmFtcylcbiAgICAvLyBFbWl0IGEgbmV3IGNoYXRDb25uZWN0IHRvIGZldGNoIHRoZSBtZXNzYWdlcyBhbmQgYWRkIHRoZW0gdG8gc2VsZi5tZXNzYWdlc1xuICAgIHNvY2tldC5lbWl0KFwiY2hhdENvbm5lY3RcIiwgJHN0YXRlUGFyYW1zLmlkKSAvLyBHZXQgbWUgdGhlIG1lc3NhZ2VzIFlvXG4gICAgZ2V0KCRzdGF0ZVBhcmFtcy5pZCk7XG4gIH0gXG5cbiAgYWxsKCk7XG4gIGZ1bmN0aW9uIGFsbCgpIHtcbiAgICBDaGF0LnF1ZXJ5KGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgY29uc29sZS5sb2coZGF0YSlcbiAgICAgIHJldHVybiBzZWxmLmFsbCA9IGRhdGE7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXQoaWQpe1xuICAgIENoYXQuZ2V0KHsgaWQ6IGlkfSwgZnVuY3Rpb24oZGF0YSl7XG4gICAgICBzZWxmLmNoYXQgPSBkYXRhO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlKCkge1xuICAgIHNlbGYuY2hhdC5jcmVhdGVkX2J5ICAgPSAgY3VycmVudFVzZXIuX2lkO1xuICAgIHNlbGYuY2hhdC5wYXJ0aWNpcGFudHMgPSBbY3VycmVudFVzZXIuX2lkXTtcbiAgICB2YXIgY2hhdCA9IHsgY2hhdDogc2VsZi5jaGF0IH1cbiAgICBDaGF0LnNhdmUoY2hhdCwgZnVuY3Rpb24oZGF0YSl7XG4gICAgICBzZWxmLmFsbC5wdXNoKGRhdGEpO1xuICAgICAgJHN0YXRlLmdvKFwiY2hhdFwiLCB7IGlkOiBkYXRhLl9pZH0pXG4gICAgICBzZWxmLmNoYXQgPSB7fTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGpvaW5DaGF0KCkge1xuICAgIGNvbnNvbGUubG9nKHNlbGYuY2hhdCk7XG4gICAgLy8gbmVlZCB0byBzZW5kIHRoZSBjaGF0Ll9pZCxcbiAgICAvLyBjdXJyZW50VXNlci5nZXRVc2VyKCkuX2lkO1xuICAgIHNvY2tldC5lbWl0KFwiam9pbkNoYXRcIiwgXG4gICAgICB7IGN1cnJlbnRDaGF0SWQ6ICRzdGF0ZVBhcmFtcy5pZCwgXG4gICAgICAgIGN1cnJlbnRVc2VySWQ6IGN1cnJlbnRVc2VyLmdldFVzZXIoKS5faWQgXG4gICAgICB9KTtcbiAgfVxuICBmdW5jdGlvbiBhZGRNZXNzYWdlKCkge1xuICAgIGNvbnNvbGUubG9nKHNlbGYubmV3TWVzc2FnZSlcbiAgICBzZWxmLm5ld01lc3NhZ2UuY2hhdF9pZCA9ICRzdGF0ZVBhcmFtcy5pZDsgXG4gICAgc2VsZi5uZXdNZXNzYWdlLmF1dGhvciAgPSBjdXJyZW50VXNlci5nZXRVc2VyKCkuX2lkO1xuICAgIHNlbGYubmV3TWVzc2FnZS50aW1lc3RhbXAgPSBuZXcgRGF0ZSgpO1xuXG4gICAgc29ja2V0LmVtaXQoXCJuZXdNZXNzYWdlXCIsIHNlbGYubmV3TWVzc2FnZSlcbiAgICBzZWxmLm5ld01lc3NhZ2UgPSB7fTtcbiAgfVxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIHNvY2tldC5vbihcImNvbm5lY3RcIiwgZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLmxvZyhcIkNvbm5lY3RlZFwiKVxuICB9KVxuXG4gIHNvY2tldC5vbihcInRlc3RcIiwgZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLmxvZyhcImNvbm5lY3RlZCBvbiB0ZXN0XCIpO1xuICB9KVxuXG4gIHNvY2tldC5vbihcInVwZGF0ZU1lc3NhZ2VzXCIsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBzZWxmLm1lc3NhZ2VzLnB1c2goZGF0YSlcbiAgfSlcbn1cblxuXG5cblxuXG5cblxuXG5cblxuXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
