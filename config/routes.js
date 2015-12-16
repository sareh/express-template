var express  = require('express');
var passport = require('passport');
var router   = express.Router();

var authenticationsController = require('../controllers/authenticationsController');
var usersController = require('../controllers/usersController');
var chatsController = require('../controllers/chatsController');

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
  .patch(usersController.usersUpdate)
  .delete(usersController.usersDelete)

router.route('/chats')
  .get(chatsController.chatsIndex)
  .post(chatsController.chatsCreate)

router.route('/chats/:id')
  .get(chatsController.chatsShow)
  .patch(chatsController.chatsUpdate)
  .post(chatsController.chatsJoin)
  .post(chatsController.chatsLeave)
  .delete(chatsController.chatsDelete)
  
module.exports = router;