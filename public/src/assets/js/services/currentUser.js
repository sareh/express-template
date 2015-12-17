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