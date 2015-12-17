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
      templateUrl: '/public/dist/assets/views/home.html',
    })
    .state('about', {
      url: '/about',
      templateUrl: '/public/dist/assets/views/about.html',
    })
    .state('register', {
      url: '/register',
      templateUrl: '/public/dist/assets/views/register.html',
    })
    .state('login', {
      url: '/login',
      templateUrl: '/public/dist/assets/views/login.html',
    })
    .state('users', {
      url: '/users',
      templateUrl: '/public/dist/assets/views/users.html',
    })
    .state('chats', {
      url: '/chats',
      templateUrl: '/public/dist/assets/views/chats.html',
    })
    .state('chat', {
      url: '/chat',
      templateUrl: '/public/dist/assets/views/chat.html',
    })
    // .state('newchat', {
    //   url: "/newchat",
    //   templateUrl: "/public/dist/assets/views/newchat.html"
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
    self.getUsers();
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

  self.getChats();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsInRva2VuU2VydmljZS5qcyIsImF1dGhJbnRlcmNlcHRvci5qcyIsImN1cnJlbnRVc2VyLmpzIiwidXNlci5qcyIsImNoYXQuanMiLCJ1c2Vyc0NvbnRyb2xsZXIuanMiLCJjaGF0c0NvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhbmd1bGFyLWFwcC1jb25jYXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyXG4gIC5tb2R1bGUoJ3RlbXBsYXRlQXBwJywgW1xuICAgICduZ0FyaWEnLFxuICAgICd1aS5yb3V0ZXInLFxuICAgICdhbmd1bGFyLWp3dCcsXG4gICAgJ25nUmVzb3VyY2UnXG4gIF0pIFxuICAuY29uc3RhbnQoJ0FQSScsICdodHRwOi8vbG9jYWxob3N0OjMwMDAvYXBpJylcbiAgLmNvbmZpZyhNYWluUm91dGVyKVxuICAuY29uZmlnKGFkZEF1dGhJbnRlcmNlcHRvcik7XG5cbk1haW5Sb3V0ZXIuJGluamVjdCA9IFsnJHN0YXRlUHJvdmlkZXInLCAnJHVybFJvdXRlclByb3ZpZGVyJ107XG5cbmZ1bmN0aW9uIE1haW5Sb3V0ZXIoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcil7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICB1cmw6ICcvJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnL3B1YmxpYy9kaXN0L2Fzc2V0cy92aWV3cy9ob21lLmh0bWwnLFxuICAgIH0pXG4gICAgLnN0YXRlKCdhYm91dCcsIHtcbiAgICAgIHVybDogJy9hYm91dCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJy9wdWJsaWMvZGlzdC9hc3NldHMvdmlld3MvYWJvdXQuaHRtbCcsXG4gICAgfSlcbiAgICAuc3RhdGUoJ3JlZ2lzdGVyJywge1xuICAgICAgdXJsOiAnL3JlZ2lzdGVyJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnL3B1YmxpYy9kaXN0L2Fzc2V0cy92aWV3cy9yZWdpc3Rlci5odG1sJyxcbiAgICB9KVxuICAgIC5zdGF0ZSgnbG9naW4nLCB7XG4gICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvcHVibGljL2Rpc3QvYXNzZXRzL3ZpZXdzL2xvZ2luLmh0bWwnLFxuICAgIH0pXG4gICAgLnN0YXRlKCd1c2VycycsIHtcbiAgICAgIHVybDogJy91c2VycycsXG4gICAgICB0ZW1wbGF0ZVVybDogJy9wdWJsaWMvZGlzdC9hc3NldHMvdmlld3MvdXNlcnMuaHRtbCcsXG4gICAgfSlcbiAgICAuc3RhdGUoJ2NoYXRzJywge1xuICAgICAgdXJsOiAnL2NoYXRzJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnL3B1YmxpYy9kaXN0L2Fzc2V0cy92aWV3cy9jaGF0cy5odG1sJyxcbiAgICB9KVxuICAgIC5zdGF0ZSgnY2hhdCcsIHtcbiAgICAgIHVybDogJy9jaGF0JyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnL3B1YmxpYy9kaXN0L2Fzc2V0cy92aWV3cy9jaGF0Lmh0bWwnLFxuICAgIH0pXG4gICAgLy8gLnN0YXRlKCduZXdjaGF0Jywge1xuICAgIC8vICAgdXJsOiBcIi9uZXdjaGF0XCIsXG4gICAgLy8gICB0ZW1wbGF0ZVVybDogXCIvcHVibGljL2Rpc3QvYXNzZXRzL3ZpZXdzL25ld2NoYXQuaHRtbFwiXG4gICAgLy8gfSk7XG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbn1cblxuYWRkQXV0aEludGVyY2VwdG9yLiRpbmplY3QgPSBbJyRodHRwUHJvdmlkZXInXTtcblxuZnVuY3Rpb24gYWRkQXV0aEludGVyY2VwdG9yKCRodHRwUHJvdmlkZXIpe1xuICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKCdhdXRoSW50ZXJjZXB0b3InKTtcbn0gIFxuIiwiYW5ndWxhclxuICAubW9kdWxlKCd0ZW1wbGF0ZUFwcCcpXG4gIC5zZXJ2aWNlKCd0b2tlblNlcnZpY2UnLCBUb2tlblNlcnZpY2UpO1xuXG5Ub2tlblNlcnZpY2UuJGluamVjdCA9IFsnJHdpbmRvdycsICdqd3RIZWxwZXInXTtcbmZ1bmN0aW9uIFRva2VuU2VydmljZSgkd2luZG93LCBqd3RIZWxwZXIpe1xuXG4gIHZhciBzZWxmID0gdGhpcztcblxuICBzZWxmLnNldFRva2VuICAgID0gc2V0VG9rZW47XG4gIHNlbGYuZ2V0VG9rZW4gICAgPSBnZXRUb2tlbjtcbiAgc2VsZi5kZWNvZGVUb2tlbiA9IGRlY29kZVRva2VuO1xuICBzZWxmLnJlbW92ZVRva2VuID0gcmVtb3ZlVG9rZW47XG5cbiAgZnVuY3Rpb24gc2V0VG9rZW4gKHRva2VuKSB7XG4gICAgcmV0dXJuICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2F1dGgtdG9rZW4nLCB0b2tlbik7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRUb2tlbiAoKXtcbiAgICByZXR1cm4gJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYXV0aC10b2tlbicpO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVjb2RlVG9rZW4gKCl7XG4gICAgdmFyIHRva2VuID0gc2VsZi5nZXRUb2tlbigpO1xuICAgIHJldHVybiB0b2tlbiA/IGp3dEhlbHBlci5kZWNvZGVUb2tlbih0b2tlbikgOiB7fTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZVRva2VuICgpe1xuICAgIHJldHVybiAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdhdXRoLXRva2VuJyk7XG4gIH1cbn0iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ3RlbXBsYXRlQXBwJylcbiAgLmZhY3RvcnkoJ2F1dGhJbnRlcmNlcHRvcicsIEF1dGhJbnRlcmNlcHRvcik7XG5cbkF1dGhJbnRlcmNlcHRvci4kaW5qZWN0ID0gWydBUEknLCAndG9rZW5TZXJ2aWNlJ107XG5mdW5jdGlvbiBBdXRoSW50ZXJjZXB0b3IoQVBJLCB0b2tlblNlcnZpY2UpIHtcblxuICByZXR1cm4ge1xuICAgIFxuICAgIHJlcXVlc3Q6IGZ1bmN0aW9uKGNvbmZpZyl7XG4gICAgICB2YXIgdG9rZW4gPSB0b2tlblNlcnZpY2UuZ2V0VG9rZW4oKTtcblxuICAgICAgaWYgKGNvbmZpZy51cmwuaW5kZXhPZihBUEkpID09PSAwICYmIHRva2VuKSB7XG4gICAgICAgIGNvbmZpZy5oZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmVhcmVyICcgKyB0b2tlbjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb25maWc7XG4gICAgfSxcblxuICAgIHJlc3BvbnNlOiBmdW5jdGlvbihyZXMpe1xuICAgICAgaWYgKHJlcy5jb25maWcudXJsLmluZGV4T2YoQVBJKSA9PT0gMCAmJiByZXMuZGF0YS50b2tlbikge1xuICAgICAgICB0b2tlblNlcnZpY2Uuc2F2ZVRva2VuKHJlcy5kYXRhLnRva2VuKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gIH1cbn0iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ3RlbXBsYXRlQXBwJylcbiAgLnNlcnZpY2UoJ2N1cnJlbnRVc2VyJywgQ3VycmVudFVzZXIpO1xuXG5DdXJyZW50VXNlci4kaW5qZWN0ID0gWydVc2VyJywgJ3Rva2VuU2VydmljZSddXG5mdW5jdGlvbiBDdXJyZW50VXNlcihVc2VyLCB0b2tlblNlcnZpY2Upe1xuXG4gIHZhciBzZWxmICA9IHRoaXM7XG4gIHNlbGYudXNlciA9IHt9IFxuXG4gIHNlbGYuc2F2ZVVzZXIgPSBmdW5jdGlvbih1c2VyKXtcbiAgICByZXR1cm4gc2VsZi51c2VyID0gdXNlclxuICB9XG5cbiAgc2VsZi5nZXRVc2VyID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gc2VsZi51c2VyO1xuICB9XG5cbiAgc2VsZi5jbGVhclVzZXIgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBzZWxmLnVzZXIgPSB7fTtcbiAgfVxufSIsImFuZ3VsYXJcbiAgLm1vZHVsZSgndGVtcGxhdGVBcHAnKVxuICAuZmFjdG9yeSgnVXNlcicsIFVzZXIpXG5cblVzZXIuJGluamVjdCA9IFsnJHJlc291cmNlJywgJ0FQSSddXG5mdW5jdGlvbiBVc2VyKCRyZXNvdXJjZSwgQVBJKXtcblxuICByZXR1cm4gJHJlc291cmNlKFxuICAgIEFQSSsnL3VzZXJzLzppZCcsIFxuICAgIHtpZDogJ0BpZCd9LFxuICAgIHsgXG4gICAgICAnZ2V0JzogICAgICAgeyBtZXRob2Q6ICdHRVQnIH0sXG4gICAgICAnc2F2ZSc6ICAgICAgeyBtZXRob2Q6ICdQT1NUJyB9LFxuICAgICAgJ3F1ZXJ5JzogICAgIHsgbWV0aG9kOiAnR0VUJywgaXNBcnJheTogZmFsc2V9LFxuICAgICAgJ3JlbW92ZSc6ICAgIHsgbWV0aG9kOiAnREVMRVRFJyB9LFxuICAgICAgJ2RlbGV0ZSc6ICAgIHsgbWV0aG9kOiAnREVMRVRFJyB9LFxuICAgICAgJ3JlZ2lzdGVyJzoge1xuICAgICAgICB1cmw6IEFQSSArJy9yZWdpc3RlcicsXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCJcbiAgICAgIH0sXG4gICAgICAnbG9naW4nOntcbiAgICAgICAgdXJsOiBBUEkgKyAnL2xvZ2luJyxcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIlxuICAgICAgfVxuICAgIH0pO1xufSIsImFuZ3VsYXJcbiAgLm1vZHVsZSgndGVtcGxhdGVBcHAnKVxuICAuZmFjdG9yeSgnQ2hhdCcsIENoYXQpXG5cbkNoYXQuJGluamVjdCA9IFsnJHJlc291cmNlJywgJ0FQSSddXG5mdW5jdGlvbiBDaGF0KCRyZXNvdXJjZSwgQVBJKXtcblxuICByZXR1cm4gJHJlc291cmNlKFxuICAgIEFQSSsnL2NoYXRzLzppZCcsIFxuICAgIHsgaWQ6ICAgICAgICAgJ0BpZCd9LFxuICAgIHsgJ2dldCc6ICAgIHsgbWV0aG9kOiAnR0VUJyB9LFxuICAgICAgJ3NhdmUnOiAgIHsgbWV0aG9kOiAnUE9TVCcgfSxcbiAgICAgICdxdWVyeSc6ICB7IG1ldGhvZDogJ0dFVCcsIGlzQXJyYXk6IGZhbHNlfSxcbiAgICAgIC8vICdyZW1vdmUnOiB7IG1ldGhvZDogJ0RFTEVURScgfSxcbiAgICAgIC8vICdkZWxldGUnOiB7IG1ldGhvZDogJ0RFTEVURScgfVxuICAgIH0pO1xufSIsImFuZ3VsYXJcbiAgLm1vZHVsZSgndGVtcGxhdGVBcHAnKVxuICAuY29udHJvbGxlcigndXNlcnNDb250cm9sbGVyJywgVXNlcnNDb250cm9sbGVyKTtcblxuVXNlcnNDb250cm9sbGVyLiRpbmplY3QgPSBbJyRyZXNvdXJjZScsICdVc2VyJywgJ3Rva2VuU2VydmljZScsICckc3RhdGUnLCAnY3VycmVudFVzZXInXTtcblxuZnVuY3Rpb24gVXNlcnNDb250cm9sbGVyKCRyZXNvdXJjZSwgVXNlciwgdG9rZW5TZXJ2aWNlLCAkc3RhdGUsIGN1cnJlbnRVc2VyKSB7XG4gIFxuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgc2VsZi5hbGwgICAgICAgICAgPSBbXTtcbiAgc2VsZi51c2VyICAgICAgICAgPSB7fTtcbiAgc2VsZi5yZWdpc3RlciAgICAgPSByZWdpc3RlcjtcbiAgc2VsZi5sb2dpbiAgICAgICAgPSBsb2dpbjtcbiAgc2VsZi5sb2dvdXQgICAgICAgPSBsb2dvdXQ7XG4gIHNlbGYuaXNMb2dnZWRJbiAgID0gaXNMb2dnZWRJbjtcbiAgc2VsZi5nZXRVc2VycyAgICAgPSBnZXRVc2VycztcblxuICBmdW5jdGlvbiByZWdpc3RlcigpIHtcbiAgICBVc2VyLnJlZ2lzdGVyKHNlbGYudXNlciwgaGFuZGxlTG9naW4pO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9naW4oKSB7XG4gICAgVXNlci5sb2dpbihzZWxmLnVzZXIsIGhhbmRsZUxvZ2luKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvZ291dCgpIHtcbiAgICB0b2tlblNlcnZpY2UucmVtb3ZlVG9rZW4oKTtcbiAgICBjdXJyZW50VXNlci5jbGVhclVzZXIoKTtcbiAgICBzZWxmLmFsbCAgPSBbXTtcbiAgICBzZWxmLnVzZXIgPSB7fTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzTG9nZ2VkSW4oKSB7XG4gICAgdmFyIGxvZ2dlZEluID0gISF0b2tlblNlcnZpY2UuZ2V0VG9rZW4oKTtcbiAgICByZXR1cm4gbG9nZ2VkSW47XG4gIH1cblxuICBmdW5jdGlvbiBnZXRVc2VycygpIHtcbiAgICBVc2VyLnF1ZXJ5KGZ1bmN0aW9uKGRhdGEpe1xuICAgICByZXR1cm4gc2VsZi5hbGwgPSBkYXRhLnVzZXJzO1xuICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVMb2dpbihyZXNwb25zZSkge1xuICAgIHZhciB0b2tlbiA9IHJlc3BvbnNlLnRva2VuID8gcmVzcG9uc2UudG9rZW4gOiBudWxsO1xuICAgIGlmICh0b2tlbikge1xuICAgICAgc2VsZi5nZXRVc2VycygpO1xuICAgICAgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgfVxuICAgIHNlbGYudXNlciA9IHRva2VuU2VydmljZS5kZWNvZGVUb2tlbigpO1xuICAgIGN1cnJlbnRVc2VyLnNhdmVVc2VyKHNlbGYudXNlcik7XG4gIH1cblxuICBpZiAoY3VycmVudFVzZXIuZ2V0VXNlcigpKSB7XG4gICAgc2VsZi5nZXRVc2VycygpO1xuICAgIC8vIHNlbGYudXNlciA9IHRva2VuU2VydmljZS5kZWNvZGVUb2tlbigpO1xuICB9XG5cbiAgcmV0dXJuIHNlbGY7XG59IiwiYW5ndWxhclxuICAubW9kdWxlKCd0ZW1wbGF0ZUFwcCcpXG4gIC5jb250cm9sbGVyKCdjaGF0c0NvbnRyb2xsZXInLCBDaGF0c0NvbnRyb2xsZXIpO1xuXG5DaGF0c0NvbnRyb2xsZXIuJGluamVjdCA9IFsnVXNlcicsICdDaGF0JywgJ2N1cnJlbnRVc2VyJ107XG5cbmZ1bmN0aW9uIENoYXRzQ29udHJvbGxlcihVc2VyLCBDaGF0LCBjdXJyZW50VXNlcikge1xuICB2YXIgc2VsZiAgPSB0aGlzO1xuICBcbiAgc2VsZi5hbGwgICAgPSBbXTtcbiAgc2VsZi5jaGF0ICAgPSB7fTtcbiAgc2VsZi5nZXQgICAgPSBnZXQ7XG4gIHNlbGYuY3JlYXRlID0gY3JlYXRlO1xuXG4gIGZ1bmN0aW9uIGdldCgpIHtcbiAgICBDaGF0LnF1ZXJ5KGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgcmV0dXJuIHNlbGYuYWxsID0gZGF0YTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICBzZWxmLmNoYXQuY3JlYXRlZF9ieSAgID0gIGN1cnJlbnRVc2VyLl9pZDtcbiAgICBzZWxmLmNoYXQucGFydGljaXBhbnRzID0gW2N1cnJlbnRVc2VyLl9pZF07XG4gICAgdmFyIGNoYXQgPSB7IGNoYXQ6IHNlbGYuY2hhdCB9XG4gICAgQ2hhdC5zYXZlKGNoYXQsIGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgc2VsZi5hbGwucHVzaChkYXRhKTtcbiAgICAgIHNlbGYuY2hhdCA9IHt9O1xuICAgIH0pO1xuICB9XG5cbiAgc2VsZi5nZXRDaGF0cygpO1xufSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
