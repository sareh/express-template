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