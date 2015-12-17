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












//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsInRva2VuU2VydmljZS5qcyIsImF1dGhJbnRlcmNlcHRvci5qcyIsImN1cnJlbnRVc2VyLmpzIiwic29ja2V0RmFjdG9yeS5qcyIsInVzZXIuanMiLCJjaGF0LmpzIiwidXNlcnNDb250cm9sbGVyLmpzIiwiY2hhdHNDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFuZ3VsYXItYXBwLWNvbmNhdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXJcbiAgLm1vZHVsZSgndGVtcGxhdGVBcHAnLCBbXG4gICAgJ25nQXJpYScsXG4gICAgJ3VpLnJvdXRlcicsXG4gICAgJ2FuZ3VsYXItand0JyxcbiAgICAnbmdSZXNvdXJjZSdcbiAgXSkgXG4gIC5jb25zdGFudCgnQVBJJywgJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9hcGknKVxuICAuY29uZmlnKE1haW5Sb3V0ZXIpXG4gIC5jb25maWcoYWRkQXV0aEludGVyY2VwdG9yKTtcblxuTWFpblJvdXRlci4kaW5qZWN0ID0gWyckc3RhdGVQcm92aWRlcicsICckdXJsUm91dGVyUHJvdmlkZXInXTtcblxuZnVuY3Rpb24gTWFpblJvdXRlcigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKXtcbiBcbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2hvbWUnLCB7IFxuICAgICAgdXJsOiAnLycsXG4gICAgICB0ZW1wbGF0ZVVybDogJy9zcmMvYXNzZXRzL3ZpZXdzL2hvbWUuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnY2hhdHNDb250cm9sbGVyIGFzIGNoYXRzJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdhYm91dCcsIHtcbiAgICAgIHVybDogJy9hYm91dCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJy9zcmMvYXNzZXRzL3ZpZXdzL2Fib3V0Lmh0bWwnLFxuICAgIH0pXG4gICAgLnN0YXRlKCdwcm9maWxlJywge1xuICAgICAgdXJsOiAnL3Byb2ZpbGUnLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvc3JjL2Fzc2V0cy92aWV3cy9wcm9maWxlLmh0bWwnLFxuICAgIH0pXG4gICAgLnN0YXRlKCdyZWdpc3RlcicsIHtcbiAgICAgIHVybDogJy9yZWdpc3RlcicsXG4gICAgICB0ZW1wbGF0ZVVybDogJy9zcmMvYXNzZXRzL3ZpZXdzL3JlZ2lzdGVyLmh0bWwnLFxuICAgIH0pXG4gICAgLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICB0ZW1wbGF0ZVVybDogJy9zcmMvYXNzZXRzL3ZpZXdzL2xvZ2luLmh0bWwnLFxuICAgIH0pXG4gICAgLnN0YXRlKCd1c2VycycsIHtcbiAgICAgIHVybDogJy91c2VycycsXG4gICAgICB0ZW1wbGF0ZVVybDogJy9zcmMvYXNzZXRzL3ZpZXdzL3VzZXJzLmh0bWwnLFxuICAgIH0pXG4gICAgLnN0YXRlKCdjaGF0Jywge1xuICAgICAgdXJsOiAnL2NoYXRzLzppZCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJy9zcmMvYXNzZXRzL3ZpZXdzL2NoYXQuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnY2hhdHNDb250cm9sbGVyIGFzIGNoYXRzJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdjaGF0cycsIHtcbiAgICAgIHVybDogJy9jaGF0cycsXG4gICAgICB0ZW1wbGF0ZVVybDogJy9zcmMvYXNzZXRzL3ZpZXdzL2NoYXRzLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ2NoYXRzQ29udHJvbGxlciBhcyBjaGF0cydcbiAgICB9KVxuICAgIC8vIC5zdGF0ZSgnbmV3Y2hhdCcsIHtcbiAgICAvLyAgIHVybDogXCIvbmV3Y2hhdFwiLFxuICAgIC8vICAgdGVtcGxhdGVVcmw6IFwiL3NyYy9hc3NldHMvdmlld3MvbmV3Y2hhdC5odG1sXCJcbiAgICAvLyB9KTtcbiAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xufVxuXG5hZGRBdXRoSW50ZXJjZXB0b3IuJGluamVjdCA9IFsnJGh0dHBQcm92aWRlciddO1xuXG5mdW5jdGlvbiBhZGRBdXRoSW50ZXJjZXB0b3IoJGh0dHBQcm92aWRlcil7XG4gICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goJ2F1dGhJbnRlcmNlcHRvcicpO1xufSAgXG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ3RlbXBsYXRlQXBwJylcbiAgLnNlcnZpY2UoJ3Rva2VuU2VydmljZScsIFRva2VuU2VydmljZSk7XG5cblRva2VuU2VydmljZS4kaW5qZWN0ID0gWyckd2luZG93JywgJ2p3dEhlbHBlciddO1xuZnVuY3Rpb24gVG9rZW5TZXJ2aWNlKCR3aW5kb3csIGp3dEhlbHBlcil7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHNlbGYuc2V0VG9rZW4gICAgPSBzZXRUb2tlbjtcbiAgc2VsZi5nZXRUb2tlbiAgICA9IGdldFRva2VuO1xuICBzZWxmLmRlY29kZVRva2VuID0gZGVjb2RlVG9rZW47XG4gIHNlbGYucmVtb3ZlVG9rZW4gPSByZW1vdmVUb2tlbjtcblxuICBmdW5jdGlvbiBzZXRUb2tlbiAodG9rZW4pIHtcbiAgICByZXR1cm4gJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYXV0aC10b2tlbicsIHRva2VuKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFRva2VuICgpe1xuICAgIHJldHVybiAkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhdXRoLXRva2VuJyk7XG4gIH1cblxuICBmdW5jdGlvbiBkZWNvZGVUb2tlbiAoKXtcbiAgICB2YXIgdG9rZW4gPSBzZWxmLmdldFRva2VuKCk7XG4gICAgcmV0dXJuIHRva2VuID8gand0SGVscGVyLmRlY29kZVRva2VuKHRva2VuKSA6IHt9O1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlVG9rZW4gKCl7XG4gICAgcmV0dXJuICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2F1dGgtdG9rZW4nKTtcbiAgfVxufSIsImFuZ3VsYXJcbiAgLm1vZHVsZSgndGVtcGxhdGVBcHAnKVxuICAuZmFjdG9yeSgnYXV0aEludGVyY2VwdG9yJywgQXV0aEludGVyY2VwdG9yKTtcblxuQXV0aEludGVyY2VwdG9yLiRpbmplY3QgPSBbJ0FQSScsICd0b2tlblNlcnZpY2UnXTtcbmZ1bmN0aW9uIEF1dGhJbnRlcmNlcHRvcihBUEksIHRva2VuU2VydmljZSkge1xuXG4gIHJldHVybiB7XG4gICAgXG4gICAgcmVxdWVzdDogZnVuY3Rpb24oY29uZmlnKXtcbiAgICAgIHZhciB0b2tlbiA9IHRva2VuU2VydmljZS5nZXRUb2tlbigpO1xuXG4gICAgICBpZiAoY29uZmlnLnVybC5pbmRleE9mKEFQSSkgPT09IDAgJiYgdG9rZW4pIHtcbiAgICAgICAgY29uZmlnLmhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCZWFyZXIgJyArIHRva2VuO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICB9LFxuXG4gICAgcmVzcG9uc2U6IGZ1bmN0aW9uKHJlcyl7XG4gICAgICBpZiAocmVzLmNvbmZpZy51cmwuaW5kZXhPZihBUEkpID09PSAwICYmIHJlcy5kYXRhLnRva2VuKSB7XG4gICAgICAgIHRva2VuU2VydmljZS5zZXRUb2tlbihyZXMuZGF0YS50b2tlbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuICB9XG59IiwiYW5ndWxhclxuICAubW9kdWxlKCd0ZW1wbGF0ZUFwcCcpXG4gIC5zZXJ2aWNlKCdjdXJyZW50VXNlcicsIEN1cnJlbnRVc2VyKTtcblxuQ3VycmVudFVzZXIuJGluamVjdCA9IFsndG9rZW5TZXJ2aWNlJ11cbmZ1bmN0aW9uIEN1cnJlbnRVc2VyKHRva2VuU2VydmljZSl7XG5cbiAgdmFyIHNlbGYgID0gdGhpcztcbiAgc2VsZi51c2VyID0ge30gXG5cbiAgc2VsZi5zYXZlVXNlciA9IGZ1bmN0aW9uKHVzZXIpe1xuICAgIHJldHVybiBzZWxmLnVzZXIgPSB1c2VyXG4gIH1cblxuICBzZWxmLmdldFVzZXIgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0b2tlblNlcnZpY2UuZGVjb2RlVG9rZW4oKTtcbiAgfVxuXG4gIHNlbGYuY2xlYXJVc2VyID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gc2VsZi51c2VyID0ge307XG4gIH1cbn0iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ3RlbXBsYXRlQXBwJylcbiAgLmZhY3RvcnkoJ3NvY2tldCcsIFNvY2tldEZhY3RvcnkpO1xuXG5mdW5jdGlvbiBTb2NrZXRGYWN0b3J5KCRyb290U2NvcGUpIHtcbiAgdmFyIHNvY2tldCA9IGlvLmNvbm5lY3QoKTtcbiAgcmV0dXJuIHtcbiAgICBvbjogZnVuY3Rpb24gKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICAgIHNvY2tldC5vbihldmVudE5hbWUsIGZ1bmN0aW9uICgpIHsgIFxuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHNvY2tldCwgYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBlbWl0OiBmdW5jdGlvbiAoZXZlbnROYW1lLCBkYXRhLCBjYWxsYmFjaykge1xuICAgICAgc29ja2V0LmVtaXQoZXZlbnROYW1lLCBkYXRhLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjay5hcHBseShzb2NrZXQsIGFyZ3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgIH1cbiAgfTtcbn0iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ3RlbXBsYXRlQXBwJylcbiAgLmZhY3RvcnkoJ1VzZXInLCBVc2VyKVxuXG5Vc2VyLiRpbmplY3QgPSBbJyRyZXNvdXJjZScsICdBUEknXVxuZnVuY3Rpb24gVXNlcigkcmVzb3VyY2UsIEFQSSl7XG5cbiAgcmV0dXJuICRyZXNvdXJjZShcbiAgICBBUEkrJy91c2Vycy86aWQnLCBcbiAgICB7aWQ6ICdAaWQnfSxcbiAgICB7IFxuICAgICAgJ2dldCc6ICAgICAgIHsgbWV0aG9kOiAnR0VUJyB9LFxuICAgICAgJ3NhdmUnOiAgICAgIHsgbWV0aG9kOiAnUE9TVCcgfSxcbiAgICAgICdxdWVyeSc6ICAgICB7IG1ldGhvZDogJ0dFVCcsIGlzQXJyYXk6IGZhbHNlfSxcbiAgICAgICdyZW1vdmUnOiAgICB7IG1ldGhvZDogJ0RFTEVURScgfSxcbiAgICAgICdkZWxldGUnOiAgICB7IG1ldGhvZDogJ0RFTEVURScgfSxcbiAgICAgICdyZWdpc3Rlcic6IHtcbiAgICAgICAgdXJsOiBBUEkgKycvcmVnaXN0ZXInLFxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiXG4gICAgICB9LFxuICAgICAgJ2xvZ2luJzp7XG4gICAgICAgIHVybDogQVBJICsgJy9sb2dpbicsXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCJcbiAgICAgIH1cbiAgICB9KTtcbn0iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ3RlbXBsYXRlQXBwJylcbiAgLmZhY3RvcnkoJ0NoYXQnLCBDaGF0KVxuXG5DaGF0LiRpbmplY3QgPSBbJyRyZXNvdXJjZScsICdBUEknXVxuZnVuY3Rpb24gQ2hhdCgkcmVzb3VyY2UsIEFQSSl7XG5cbiAgcmV0dXJuICRyZXNvdXJjZShcbiAgICBBUEkrJy9jaGF0cy86aWQnLCBcbiAgICB7IGlkOiAgICAgICAgICdAaWQnfSxcbiAgICB7ICdnZXQnOiAgICB7IG1ldGhvZDogJ0dFVCcgfSxcbiAgICAgICdzYXZlJzogICB7IG1ldGhvZDogJ1BPU1QnIH0sXG4gICAgICAncXVlcnknOiAgeyBtZXRob2Q6ICdHRVQnLCBpc0FycmF5OiB0cnVlfSxcbiAgICAgIC8vICdyZW1vdmUnOiB7IG1ldGhvZDogJ0RFTEVURScgfSxcbiAgICAgIC8vICdkZWxldGUnOiB7IG1ldGhvZDogJ0RFTEVURScgfVxuICAgIH0pO1xufSIsImFuZ3VsYXJcbiAgLm1vZHVsZSgndGVtcGxhdGVBcHAnKVxuICAuY29udHJvbGxlcigndXNlcnNDb250cm9sbGVyJywgVXNlcnNDb250cm9sbGVyKTtcblxuVXNlcnNDb250cm9sbGVyLiRpbmplY3QgPSBbJyRyZXNvdXJjZScsICdVc2VyJywgJ3Rva2VuU2VydmljZScsICckc3RhdGUnLCAnY3VycmVudFVzZXInXTtcblxuZnVuY3Rpb24gVXNlcnNDb250cm9sbGVyKCRyZXNvdXJjZSwgVXNlciwgdG9rZW5TZXJ2aWNlLCAkc3RhdGUsIGN1cnJlbnRVc2VyKSB7XG4gIFxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMuY29udHJvbGxlck5hbWUgPSBcInVzZXJzQ29udHJvbGxlclwiXG5cbiAgc2VsZi5hbGwgICAgICAgICAgPSBbXTtcbiAgc2VsZi51c2VyICAgICAgICAgPSB7fTtcbiAgc2VsZi5yZWdpc3RlciAgICAgPSByZWdpc3RlcjtcbiAgc2VsZi5sb2dpbiAgICAgICAgPSBsb2dpbjtcbiAgc2VsZi5sb2dvdXQgICAgICAgPSBsb2dvdXQ7XG4gIHNlbGYuaXNMb2dnZWRJbiAgID0gaXNMb2dnZWRJbjtcbiAgc2VsZi5nZXRVc2VycyAgICAgPSBnZXRVc2VycztcblxuICBmdW5jdGlvbiByZWdpc3RlcigpIHtcbiAgICBVc2VyLnJlZ2lzdGVyKHNlbGYudXNlciwgaGFuZGxlTG9naW4pO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9naW4oKSB7XG4gICAgVXNlci5sb2dpbihzZWxmLnVzZXIsIGhhbmRsZUxvZ2luKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvZ291dCgpIHtcbiAgICB0b2tlblNlcnZpY2UucmVtb3ZlVG9rZW4oKTtcbiAgICBjdXJyZW50VXNlci5jbGVhclVzZXIoKTtcbiAgICBzZWxmLmFsbCAgPSBbXTtcbiAgICBzZWxmLnVzZXIgPSB7fTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzTG9nZ2VkSW4oKSB7XG4gICAgdmFyIGxvZ2dlZEluID0gISF0b2tlblNlcnZpY2UuZ2V0VG9rZW4oKTtcbiAgICByZXR1cm4gbG9nZ2VkSW47XG4gIH1cblxuICBmdW5jdGlvbiBnZXRVc2VycygpIHtcbiAgICBVc2VyLnF1ZXJ5KGZ1bmN0aW9uKGRhdGEpe1xuICAgICByZXR1cm4gc2VsZi5hbGwgPSBkYXRhLnVzZXJzO1xuICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVMb2dpbihyZXNwb25zZSkge1xuICAgIHZhciB0b2tlbiA9IHJlc3BvbnNlLnRva2VuID8gcmVzcG9uc2UudG9rZW4gOiBudWxsO1xuICAgIGlmICh0b2tlbikge1xuICAgICAgc2VsZi5nZXRVc2VycygpO1xuICAgICAgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgfVxuICAgIHNlbGYudXNlciA9IHRva2VuU2VydmljZS5kZWNvZGVUb2tlbigpO1xuICAgIGN1cnJlbnRVc2VyLnNhdmVVc2VyKHNlbGYudXNlcik7XG4gIH1cblxuICBpZiAoY3VycmVudFVzZXIuZ2V0VXNlcigpKSB7XG4gICAgLy8gc2VsZi5nZXRVc2VycygpO1xuICAgIC8vIHNlbGYudXNlciA9IHRva2VuU2VydmljZS5kZWNvZGVUb2tlbigpO1xuICB9XG5cbiAgcmV0dXJuIHNlbGY7XG59IiwiYW5ndWxhclxuICAubW9kdWxlKCd0ZW1wbGF0ZUFwcCcpXG4gIC5jb250cm9sbGVyKCdjaGF0c0NvbnRyb2xsZXInLCBDaGF0c0NvbnRyb2xsZXIpO1xuXG5DaGF0c0NvbnRyb2xsZXIuJGluamVjdCA9IFsnVXNlcicsICdDaGF0JywgJ2N1cnJlbnRVc2VyJywgJ3NvY2tldCcsICckc3RhdGVQYXJhbXMnLCAnJHN0YXRlJ107XG5cbmZ1bmN0aW9uIENoYXRzQ29udHJvbGxlcihVc2VyLCBDaGF0LCBjdXJyZW50VXNlciwgc29ja2V0LCAkc3RhdGVQYXJhbXMsICRzdGF0ZSkge1xuICB2YXIgc2VsZiAgPSB0aGlzO1xuICBcbiAgc2VsZi5hbGwgICAgICAgICA9IFtdO1xuICBzZWxmLmNoYXQgICAgICAgID0ge307XG4gIHNlbGYuYWxsICAgICAgICAgPSBhbGw7XG4gIHNlbGYuZ2V0ICAgICAgICAgPSBnZXQ7XG4gIHNlbGYuY3JlYXRlICAgICAgPSBjcmVhdGU7XG4gIHNlbGYubmV3TWVzc2FnZSAgPSB7fVxuICBzZWxmLmFkZE1lc3NhZ2UgID0gYWRkTWVzc2FnZTtcbiAgc2VsZi5tZXNzYWdlcyAgICA9IFtcbiAgICB7XG4gICAgICBjb250ZW50OiBcIkhhdmluZyBwcm9ibGVtcyB3aXRoIHRoaXMuXCIsXG4gICAgICBhdXRob3I6IFwiQWxpY2VcIixcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxuICAgIH0sXG4gICAge1xuICAgICAgY29udGVudDogXCJNZSwgdG9vIVwiLFxuICAgICAgYXV0aG9yOiBcIkJvYlwiLFxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXG4gICAgfSxcbiAgXVxuXG4gIGlmICgkc3RhdGVQYXJhbXMuaWQpIHtcbiAgICAvLyBFbWl0IGEgbmV3IGNoYXRDb25uZWN0IHRvIGZldGNoIHRoZSBtZXNzYWdlcyBhbmQgYWRkIHRoZW0gdG8gc2VsZi5tZXNzYWdlc1xuICAgIHNvY2tldC5lbWl0KFwiY2hhdENvbm5lY3RcIiwgJHN0YXRlUGFyYW1zLmlkKSAvLyBHZXQgbWUgdGhlIG1lc3NhZ2VzIFlvXG4gICAgZ2V0KCRzdGF0ZVBhcmFtcy5pZCk7XG4gIH0gXG5cbiAgYWxsKCk7XG4gIGZ1bmN0aW9uIGFsbCgpIHtcbiAgICBDaGF0LnF1ZXJ5KGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgY29uc29sZS5sb2coZGF0YSlcbiAgICAgIHJldHVybiBzZWxmLmFsbCA9IGRhdGE7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXQoaWQpe1xuICAgIENoYXQuZ2V0KHsgaWQ6IGlkfSwgZnVuY3Rpb24oZGF0YSl7XG4gICAgICBzZWxmLmNoYXQgPSBkYXRhO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlKCkge1xuICAgIHNlbGYuY2hhdC5jcmVhdGVkX2J5ICAgPSAgY3VycmVudFVzZXIuX2lkO1xuICAgIHNlbGYuY2hhdC5wYXJ0aWNpcGFudHMgPSBbY3VycmVudFVzZXIuX2lkXTtcbiAgICB2YXIgY2hhdCA9IHsgY2hhdDogc2VsZi5jaGF0IH1cbiAgICBDaGF0LnNhdmUoY2hhdCwgZnVuY3Rpb24oZGF0YSl7XG4gICAgICBzZWxmLmFsbC5wdXNoKGRhdGEpO1xuICAgICAgJHN0YXRlLmdvKFwiY2hhdFwiLCB7IGlkOiBkYXRhLl9pZH0pXG4gICAgICBzZWxmLmNoYXQgPSB7fTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZE1lc3NhZ2UoKXtcbiAgICBjb25zb2xlLmxvZyhzZWxmLm5ld01lc3NhZ2UpXG4gICAgc2VsZi5uZXdNZXNzYWdlLmNoYXRfaWQgPSAkc3RhdGVQYXJhbXMuaWQ7IFxuICAgIHNlbGYubmV3TWVzc2FnZS5hdXRob3IgID0gY3VycmVudFVzZXIuZ2V0VXNlcigpLl9pZDtcbiAgICBzZWxmLm5ld01lc3NhZ2UudGltZXN0YW1wID0gbmV3IERhdGUoKTtcblxuICAgIHNvY2tldC5lbWl0KFwibmV3TWVzc2FnZVwiLCBzZWxmLm5ld01lc3NhZ2UpXG4gICAgc2VsZi5uZXdNZXNzYWdlID0ge307XG4gIH1cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICBzb2NrZXQub24oXCJjb25uZWN0XCIsIGZ1bmN0aW9uKCl7XG4gICAgY29uc29sZS5sb2coXCJDb25uZWN0ZWRcIilcbiAgfSlcblxuICBzb2NrZXQub24oXCJ0ZXN0XCIsIGZ1bmN0aW9uKCl7XG4gICAgY29uc29sZS5sb2coXCJjb25uZWN0ZWQgb24gdGVzdFwiKTtcbiAgfSlcblxuICBzb2NrZXQub24oXCJ1cGRhdGVNZXNzYWdlc1wiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgc2VsZi5tZXNzYWdlcy5wdXNoKGRhdGEpXG4gIH0pXG59XG5cblxuXG5cblxuXG5cblxuXG5cblxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
