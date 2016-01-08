var express        = require('express');
var mongoose       = require('mongoose');
var cors           = require('cors');
var path           = require('path');
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var cookieParser   = require('cookie-parser');
var methodOverride = require('method-override');
var passport       = require('passport');
var jwt            = require('jsonwebtoken');
var expressJWT     = require('express-jwt');
var config         = require('./config/config');
var secret         = config.secret;
var User           = require('./models/user');
var Chat           = require('./models/chat');
var port           = process.env.PORT || 3000;
var app            = express();
var server         = require('http').createServer(app);
// for oauth
// var oauthshim      = require('./config/shim');
// var credentials    = require('./config/credentials');


mongoose.connect(config.database);
require('./config/passport')(passport);

app.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method
    delete req.body._method
    return method
  }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors());
app.use(passport.initialize());

// Define a path where to put this OAuth Shim
// app.all('/proxy', oauthshim);
// Initiate the shim with credentials
// oauthshim.init(creds);

app.use('/api', expressJWT({ secret: secret })
  .unless({
    path: [
      { url: '/api/login',     methods: ['POST'] },
      { url: '/api/register',  methods: ['POST'] },
      { url: '/',              methods: ['GET']  }
      // ,
      // { url: '/api/facebook',  methods: ['POST'] },
      // { url: '/api/github',    methods: ['POST'] },
      // { url: '/api/twitter',   methods: ['POST'] },
      // { url: '/api/instagram', methods: ['POST'] },
      // { url: '/api/linkedin',  methods: ['POST'] },
      // { url: '/api/google',    methods: ['POST'] },
      // { url: '/proxy',         methods: ['GET']  }
    ]
  }));

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({message: 'Unauthorized request.'});
  }
  next();
});

var routes = require('./config/routes');
app.use("/api", routes);

app.use(express.static('public'))

app.get('/', function(req, res) {
  res.sendFile(__dirname + 'index.html');
})


server.listen(port);

var io = require('socket.io')(server);
//NB. a socket's id is io.socket.engine._id

io.on("connect", function(socket){
  socket.emit("test")

  socket.on("newChat", function(data){
    var chat = new Chat(data);
    chat.save(function(err){
      if (err) return res.status(500).send(err);
      res.status(201).send(chat);
    });
  });

  // Create a new one on "chatConnect"
  // socket.on("chatConnect", function(id) {
    // Get messages from that chat using the id
    // socket.join(id)
    // io.emit("updateMessages", data);
  // })
  socket.on("joinChat", function(chatId) {
    socket.join(chatId)
    // io.emit("updateChatMembers", chatId)
  })
// Join a chat here. 
  socket.on("newMessage", function(message) {
    // SAVE HERE
    message.chatId
    message.author
    message.timestamp
    
    Chat.findById(message.chatId, function(err, chat){
      if (err) return res.status(404).json({message: 'Sorry, something went wrong.'});

      res.status(200).json({ chat: chat });
    });

    console.log("Message received ", message);
    io.emit("updateMessages", message);
  })


})


// https://github.com/ga1989/NEAN-2-Realtime-ChatApp-Node-Socketio/blob/master/app.js
// var io   = require('socket.io').listen(app.listen(port));
// require('./config/chat')(app, io);
// require('./config/chatroutes')(app, io);

console.log('App is running on port ' + port);