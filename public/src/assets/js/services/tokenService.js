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