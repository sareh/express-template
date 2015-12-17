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
    })
    .state('about', {
      url: '/about',
      templateUrl: '/src/assets/views/about.html',
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
    .state('chats', {
      url: '/chats',
      templateUrl: '/src/assets/views/chats.html',
    })
    .state('chat', {
      url: '/chat',
      templateUrl: '/src/assets/views/chat.html',
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
        tokenService.saveToken(res.data.token);
      }
      return res;
    }

  }
}
angular
  .module('templateApp')
  .service('currentUser', CurrentUser);

CurrentUser.$inject = ['User', 'tokenService']
function CurrentUser(User, tokenService){

  var self  = this;
  self.user = {} 

  self.saveUser = function(user){
    return self.user = user
  }

  self.getUser = function(){
    return self.user;
  }

  self.clearUser = function(){
    return self.user = {};
  }
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
      'query':  { method: 'GET', isArray: false},
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

  // self.getChats();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsInRva2VuU2VydmljZS5qcyIsImF1dGhJbnRlcmNlcHRvci5qcyIsImN1cnJlbnRVc2VyLmpzIiwidXNlci5qcyIsImNoYXQuanMiLCJ1c2Vyc0NvbnRyb2xsZXIuanMiLCJjaGF0c0NvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhbmd1bGFyLWFwcC1jb25jYXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyXG4gIC5tb2R1bGUoJ3RlbXBsYXRlQXBwJywgW1xuICAgICduZ0FyaWEnLFxuICAgICd1aS5yb3V0ZXInLFxuICAgICdhbmd1bGFyLWp3dCcsXG4gICAgJ25nUmVzb3VyY2UnXG4gIF0pIFxuICAuY29uc3RhbnQoJ0FQSScsICdodHRwOi8vbG9jYWxob3N0OjMwMDAvYXBpJylcbiAgLmNvbmZpZyhNYWluUm91dGVyKVxuICAuY29uZmlnKGFkZEF1dGhJbnRlcmNlcHRvcik7XG5cbk1haW5Sb3V0ZXIuJGluamVjdCA9IFsnJHN0YXRlUHJvdmlkZXInLCAnJHVybFJvdXRlclByb3ZpZGVyJ107XG5cbmZ1bmN0aW9uIE1haW5Sb3V0ZXIoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcil7XG4gXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdob21lJywgeyBcbiAgICAgIHVybDogJy8nLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvc3JjL2Fzc2V0cy92aWV3cy9ob21lLmh0bWwnLFxuICAgIH0pXG4gICAgLnN0YXRlKCdhYm91dCcsIHtcbiAgICAgIHVybDogJy9hYm91dCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJy9zcmMvYXNzZXRzL3ZpZXdzL2Fib3V0Lmh0bWwnLFxuICAgIH0pXG4gICAgLnN0YXRlKCdyZWdpc3RlcicsIHtcbiAgICAgIHVybDogJy9yZWdpc3RlcicsXG4gICAgICB0ZW1wbGF0ZVVybDogJy9zcmMvYXNzZXRzL3ZpZXdzL3JlZ2lzdGVyLmh0bWwnLFxuICAgIH0pXG4gICAgLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICB0ZW1wbGF0ZVVybDogJy9zcmMvYXNzZXRzL3ZpZXdzL2xvZ2luLmh0bWwnLFxuICAgIH0pXG4gICAgLnN0YXRlKCd1c2VycycsIHtcbiAgICAgIHVybDogJy91c2VycycsXG4gICAgICB0ZW1wbGF0ZVVybDogJy9zcmMvYXNzZXRzL3ZpZXdzL3VzZXJzLmh0bWwnLFxuICAgIH0pXG4gICAgLnN0YXRlKCdjaGF0cycsIHtcbiAgICAgIHVybDogJy9jaGF0cycsXG4gICAgICB0ZW1wbGF0ZVVybDogJy9zcmMvYXNzZXRzL3ZpZXdzL2NoYXRzLmh0bWwnLFxuICAgIH0pXG4gICAgLnN0YXRlKCdjaGF0Jywge1xuICAgICAgdXJsOiAnL2NoYXQnLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvc3JjL2Fzc2V0cy92aWV3cy9jaGF0Lmh0bWwnLFxuICAgIH0pXG4gICAgLy8gLnN0YXRlKCduZXdjaGF0Jywge1xuICAgIC8vICAgdXJsOiBcIi9uZXdjaGF0XCIsXG4gICAgLy8gICB0ZW1wbGF0ZVVybDogXCIvc3JjL2Fzc2V0cy92aWV3cy9uZXdjaGF0Lmh0bWxcIlxuICAgIC8vIH0pO1xuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59XG5cbmFkZEF1dGhJbnRlcmNlcHRvci4kaW5qZWN0ID0gWyckaHR0cFByb3ZpZGVyJ107XG5cbmZ1bmN0aW9uIGFkZEF1dGhJbnRlcmNlcHRvcigkaHR0cFByb3ZpZGVyKXtcbiAgJGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaCgnYXV0aEludGVyY2VwdG9yJyk7XG59ICBcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgndGVtcGxhdGVBcHAnKVxuICAuc2VydmljZSgndG9rZW5TZXJ2aWNlJywgVG9rZW5TZXJ2aWNlKTtcblxuVG9rZW5TZXJ2aWNlLiRpbmplY3QgPSBbJyR3aW5kb3cnLCAnand0SGVscGVyJ107XG5mdW5jdGlvbiBUb2tlblNlcnZpY2UoJHdpbmRvdywgand0SGVscGVyKXtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgc2VsZi5zZXRUb2tlbiAgICA9IHNldFRva2VuO1xuICBzZWxmLmdldFRva2VuICAgID0gZ2V0VG9rZW47XG4gIHNlbGYuZGVjb2RlVG9rZW4gPSBkZWNvZGVUb2tlbjtcbiAgc2VsZi5yZW1vdmVUb2tlbiA9IHJlbW92ZVRva2VuO1xuXG4gIGZ1bmN0aW9uIHNldFRva2VuICh0b2tlbikge1xuICAgIHJldHVybiAkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhdXRoLXRva2VuJywgdG9rZW4pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0VG9rZW4gKCl7XG4gICAgcmV0dXJuICR3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2F1dGgtdG9rZW4nKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY29kZVRva2VuICgpe1xuICAgIHZhciB0b2tlbiA9IHNlbGYuZ2V0VG9rZW4oKTtcbiAgICByZXR1cm4gdG9rZW4gPyBqd3RIZWxwZXIuZGVjb2RlVG9rZW4odG9rZW4pIDoge307XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVUb2tlbiAoKXtcbiAgICByZXR1cm4gJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnYXV0aC10b2tlbicpO1xuICB9XG59IiwiYW5ndWxhclxuICAubW9kdWxlKCd0ZW1wbGF0ZUFwcCcpXG4gIC5mYWN0b3J5KCdhdXRoSW50ZXJjZXB0b3InLCBBdXRoSW50ZXJjZXB0b3IpO1xuXG5BdXRoSW50ZXJjZXB0b3IuJGluamVjdCA9IFsnQVBJJywgJ3Rva2VuU2VydmljZSddO1xuZnVuY3Rpb24gQXV0aEludGVyY2VwdG9yKEFQSSwgdG9rZW5TZXJ2aWNlKSB7XG5cbiAgcmV0dXJuIHtcbiAgICBcbiAgICByZXF1ZXN0OiBmdW5jdGlvbihjb25maWcpe1xuICAgICAgdmFyIHRva2VuID0gdG9rZW5TZXJ2aWNlLmdldFRva2VuKCk7XG5cbiAgICAgIGlmIChjb25maWcudXJsLmluZGV4T2YoQVBJKSA9PT0gMCAmJiB0b2tlbikge1xuICAgICAgICBjb25maWcuaGVhZGVycy5BdXRob3JpemF0aW9uID0gJ0JlYXJlciAnICsgdG9rZW47XG4gICAgICB9XG4gICAgICByZXR1cm4gY29uZmlnO1xuICAgIH0sXG5cbiAgICByZXNwb25zZTogZnVuY3Rpb24ocmVzKXtcbiAgICAgIGlmIChyZXMuY29uZmlnLnVybC5pbmRleE9mKEFQSSkgPT09IDAgJiYgcmVzLmRhdGEudG9rZW4pIHtcbiAgICAgICAgdG9rZW5TZXJ2aWNlLnNhdmVUb2tlbihyZXMuZGF0YS50b2tlbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuICB9XG59IiwiYW5ndWxhclxuICAubW9kdWxlKCd0ZW1wbGF0ZUFwcCcpXG4gIC5zZXJ2aWNlKCdjdXJyZW50VXNlcicsIEN1cnJlbnRVc2VyKTtcblxuQ3VycmVudFVzZXIuJGluamVjdCA9IFsnVXNlcicsICd0b2tlblNlcnZpY2UnXVxuZnVuY3Rpb24gQ3VycmVudFVzZXIoVXNlciwgdG9rZW5TZXJ2aWNlKXtcblxuICB2YXIgc2VsZiAgPSB0aGlzO1xuICBzZWxmLnVzZXIgPSB7fSBcblxuICBzZWxmLnNhdmVVc2VyID0gZnVuY3Rpb24odXNlcil7XG4gICAgcmV0dXJuIHNlbGYudXNlciA9IHVzZXJcbiAgfVxuXG4gIHNlbGYuZ2V0VXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHNlbGYudXNlcjtcbiAgfVxuXG4gIHNlbGYuY2xlYXJVc2VyID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gc2VsZi51c2VyID0ge307XG4gIH1cbn0iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ3RlbXBsYXRlQXBwJylcbiAgLmZhY3RvcnkoJ1VzZXInLCBVc2VyKVxuXG5Vc2VyLiRpbmplY3QgPSBbJyRyZXNvdXJjZScsICdBUEknXVxuZnVuY3Rpb24gVXNlcigkcmVzb3VyY2UsIEFQSSl7XG5cbiAgcmV0dXJuICRyZXNvdXJjZShcbiAgICBBUEkrJy91c2Vycy86aWQnLCBcbiAgICB7aWQ6ICdAaWQnfSxcbiAgICB7IFxuICAgICAgJ2dldCc6ICAgICAgIHsgbWV0aG9kOiAnR0VUJyB9LFxuICAgICAgJ3NhdmUnOiAgICAgIHsgbWV0aG9kOiAnUE9TVCcgfSxcbiAgICAgICdxdWVyeSc6ICAgICB7IG1ldGhvZDogJ0dFVCcsIGlzQXJyYXk6IGZhbHNlfSxcbiAgICAgICdyZW1vdmUnOiAgICB7IG1ldGhvZDogJ0RFTEVURScgfSxcbiAgICAgICdkZWxldGUnOiAgICB7IG1ldGhvZDogJ0RFTEVURScgfSxcbiAgICAgICdyZWdpc3Rlcic6IHtcbiAgICAgICAgdXJsOiBBUEkgKycvcmVnaXN0ZXInLFxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiXG4gICAgICB9LFxuICAgICAgJ2xvZ2luJzp7XG4gICAgICAgIHVybDogQVBJICsgJy9sb2dpbicsXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCJcbiAgICAgIH1cbiAgICB9KTtcbn0iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ3RlbXBsYXRlQXBwJylcbiAgLmZhY3RvcnkoJ0NoYXQnLCBDaGF0KVxuXG5DaGF0LiRpbmplY3QgPSBbJyRyZXNvdXJjZScsICdBUEknXVxuZnVuY3Rpb24gQ2hhdCgkcmVzb3VyY2UsIEFQSSl7XG5cbiAgcmV0dXJuICRyZXNvdXJjZShcbiAgICBBUEkrJy9jaGF0cy86aWQnLCBcbiAgICB7IGlkOiAgICAgICAgICdAaWQnfSxcbiAgICB7ICdnZXQnOiAgICB7IG1ldGhvZDogJ0dFVCcgfSxcbiAgICAgICdzYXZlJzogICB7IG1ldGhvZDogJ1BPU1QnIH0sXG4gICAgICAncXVlcnknOiAgeyBtZXRob2Q6ICdHRVQnLCBpc0FycmF5OiBmYWxzZX0sXG4gICAgICAvLyAncmVtb3ZlJzogeyBtZXRob2Q6ICdERUxFVEUnIH0sXG4gICAgICAvLyAnZGVsZXRlJzogeyBtZXRob2Q6ICdERUxFVEUnIH1cbiAgICB9KTtcbn0iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ3RlbXBsYXRlQXBwJylcbiAgLmNvbnRyb2xsZXIoJ3VzZXJzQ29udHJvbGxlcicsIFVzZXJzQ29udHJvbGxlcik7XG5cblVzZXJzQ29udHJvbGxlci4kaW5qZWN0ID0gWyckcmVzb3VyY2UnLCAnVXNlcicsICd0b2tlblNlcnZpY2UnLCAnJHN0YXRlJywgJ2N1cnJlbnRVc2VyJ107XG5cbmZ1bmN0aW9uIFVzZXJzQ29udHJvbGxlcigkcmVzb3VyY2UsIFVzZXIsIHRva2VuU2VydmljZSwgJHN0YXRlLCBjdXJyZW50VXNlcikge1xuICBcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHNlbGYuYWxsICAgICAgICAgID0gW107XG4gIHNlbGYudXNlciAgICAgICAgID0ge307XG4gIHNlbGYucmVnaXN0ZXIgICAgID0gcmVnaXN0ZXI7XG4gIHNlbGYubG9naW4gICAgICAgID0gbG9naW47XG4gIHNlbGYubG9nb3V0ICAgICAgID0gbG9nb3V0O1xuICBzZWxmLmlzTG9nZ2VkSW4gICA9IGlzTG9nZ2VkSW47XG4gIHNlbGYuZ2V0VXNlcnMgICAgID0gZ2V0VXNlcnM7XG5cbiAgZnVuY3Rpb24gcmVnaXN0ZXIoKSB7XG4gICAgVXNlci5yZWdpc3RlcihzZWxmLnVzZXIsIGhhbmRsZUxvZ2luKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvZ2luKCkge1xuICAgIFVzZXIubG9naW4oc2VsZi51c2VyLCBoYW5kbGVMb2dpbik7XG4gIH1cblxuICBmdW5jdGlvbiBsb2dvdXQoKSB7XG4gICAgdG9rZW5TZXJ2aWNlLnJlbW92ZVRva2VuKCk7XG4gICAgY3VycmVudFVzZXIuY2xlYXJVc2VyKCk7XG4gICAgc2VsZi5hbGwgID0gW107XG4gICAgc2VsZi51c2VyID0ge307XG4gIH1cblxuICBmdW5jdGlvbiBpc0xvZ2dlZEluKCkge1xuICAgIHZhciBsb2dnZWRJbiA9ICEhdG9rZW5TZXJ2aWNlLmdldFRva2VuKCk7XG4gICAgcmV0dXJuIGxvZ2dlZEluO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0VXNlcnMoKSB7XG4gICAgVXNlci5xdWVyeShmdW5jdGlvbihkYXRhKXtcbiAgICAgcmV0dXJuIHNlbGYuYWxsID0gZGF0YS51c2VycztcbiAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlTG9naW4ocmVzcG9uc2UpIHtcbiAgICB2YXIgdG9rZW4gPSByZXNwb25zZS50b2tlbiA/IHJlc3BvbnNlLnRva2VuIDogbnVsbDtcbiAgICBpZiAodG9rZW4pIHtcbiAgICAgIHNlbGYuZ2V0VXNlcnMoKTtcbiAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgIH1cbiAgICBzZWxmLnVzZXIgPSB0b2tlblNlcnZpY2UuZGVjb2RlVG9rZW4oKTtcbiAgICBjdXJyZW50VXNlci5zYXZlVXNlcihzZWxmLnVzZXIpO1xuICB9XG5cbiAgaWYgKGN1cnJlbnRVc2VyLmdldFVzZXIoKSkge1xuICAgIC8vIHNlbGYuZ2V0VXNlcnMoKTtcbiAgICAvLyBzZWxmLnVzZXIgPSB0b2tlblNlcnZpY2UuZGVjb2RlVG9rZW4oKTtcbiAgfVxuXG4gIHJldHVybiBzZWxmO1xufSIsImFuZ3VsYXJcbiAgLm1vZHVsZSgndGVtcGxhdGVBcHAnKVxuICAuY29udHJvbGxlcignY2hhdHNDb250cm9sbGVyJywgQ2hhdHNDb250cm9sbGVyKTtcblxuQ2hhdHNDb250cm9sbGVyLiRpbmplY3QgPSBbJ1VzZXInLCAnQ2hhdCcsICdjdXJyZW50VXNlciddO1xuXG5mdW5jdGlvbiBDaGF0c0NvbnRyb2xsZXIoVXNlciwgQ2hhdCwgY3VycmVudFVzZXIpIHtcbiAgdmFyIHNlbGYgID0gdGhpcztcbiAgXG4gIHNlbGYuYWxsICAgID0gW107XG4gIHNlbGYuY2hhdCAgID0ge307XG4gIHNlbGYuZ2V0ICAgID0gZ2V0O1xuICBzZWxmLmNyZWF0ZSA9IGNyZWF0ZTtcblxuICBmdW5jdGlvbiBnZXQoKSB7XG4gICAgQ2hhdC5xdWVyeShmdW5jdGlvbihkYXRhKXtcbiAgICAgIHJldHVybiBzZWxmLmFsbCA9IGRhdGE7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgc2VsZi5jaGF0LmNyZWF0ZWRfYnkgICA9ICBjdXJyZW50VXNlci5faWQ7XG4gICAgc2VsZi5jaGF0LnBhcnRpY2lwYW50cyA9IFtjdXJyZW50VXNlci5faWRdO1xuICAgIHZhciBjaGF0ID0geyBjaGF0OiBzZWxmLmNoYXQgfVxuICAgIENoYXQuc2F2ZShjaGF0LCBmdW5jdGlvbihkYXRhKXtcbiAgICAgIHNlbGYuYWxsLnB1c2goZGF0YSk7XG4gICAgICBzZWxmLmNoYXQgPSB7fTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIHNlbGYuZ2V0Q2hhdHMoKTtcbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
