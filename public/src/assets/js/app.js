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
