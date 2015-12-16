var gravatar = require('gravatar');

module.exports = function(app,io){
  app.get('/', function(req, res){
    res.render('home');
  });

  app.get('/create', function(req,res){
    var id = Math.round((Math.random() * 1000000));
    res.redirect('/chat/'+id);
  });

  app.get('/chat/:id', function(req,res){
    res.render('chat');
  });

  var chat = io.of('/socket').on('connection', function (socket) {
    socket.on('load',function(data){
      if(chat.clients(data).length === 0 ) {
        socket.emit('peopleinchat', {number: 0});
      } else if(chat.clients(data).length === 1) {
        socket.emit('peopleinchat', {
          number: 1,
          user: chat.clients(data)[0].username,
          avatar: chat.clients(data)[0].avatar,
          id: data
        });
      } else if(chat.clients(data).length >= 2) {

        chat.emit('tooMany', {boolean: true});
      }
    });

    socket.on('login', function(data) {
      if(chat.clients(data.id).length < 2){
        socket.username = data.user;
        socket.room = data.id;
        socket.avatar = gravatar.url(data.avatar, {s: '140', r: 'x', d: 'mm'});
        socket.emit('img', socket.avatar);
        socket.join(data.id);

        if(chat.clients(data.id).length == 2) {

          var usernames = [],
          avatars = [];
          usernames.push(chat.clients(data.id)[0].username);
          usernames.push(chat.clients(data.id)[1].username);
          avatars.push(chat.clients(data.id)[0].avatar);
          avatars.push(chat.clients(data.id)[1].avatar);
          chat.in(data.id).emit('startChat', {
            boolean: true,
            id: data.id,
            users: usernames,
            avatars: avatars
          });
        }
      }
      else {
        socket.emit('tooMany', {boolean: true});
      }
    });
    socket.on('disconnect', function() {
      socket.broadcast.to(this.room).emit('leave', {
        boolean: true,
        room: this.room,
        user: this.username,
        avatar: this.avatar
      });

      socket.leave(socket.room);
    });
    socket.on('msg', function(data){
      socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
    });
  });
};