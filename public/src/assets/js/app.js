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
