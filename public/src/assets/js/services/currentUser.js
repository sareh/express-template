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