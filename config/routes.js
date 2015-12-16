var express  = require('express');
var passport = require('passport');
var router   = express.Router();

var usersController = require('../controllers/usersController');
var authenticationsController = require('../controllers/authenticationsController');

router.post('/login',     authenticationsController.login)
router.post('/register',  authenticationsController.register)
// router.post('/facebook',  authenticationsController.facebook)
// router.post('/github',    authenticationsController.github)
// router.post('/instagram', authenticationsController.instagram)
// router.post('/twitter',   authenticationsController.twitter)
// router.post('/linkedin',  authenticationsController.linkedin)
// router.post('/google',    authenticationsController.google)

router.route('/users')
  .get(usersController.usersIndex)

router.route('/users/:id')
  .get(usersController.usersShow)
  .put(usersController.usersUpdate)
  .patch(usersController.usersUpdate)
  .delete(usersController.usersDelete)

router.route('/chats')
  .get(chatsController.chatsIndex)

router.route('/chats/:id')
  .get(chatsController.chatsShow)
  .put(chatsController.chatsUpdate)
  // .patch(chatsController.chatsUpdate)
  // .delete(chatsController.chatsDelete)
  
module.exports = router;