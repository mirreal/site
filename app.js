var express = require('express');
var http = require('http');
var path = require('path');
var db = require('./modules/database');
var user = require('./modules/user');
//var list = require('./modules/list');
//var weibo = require('./modules/weibo');

var app = express();
var server = http.createServer(app);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: 'nodeisfire' }));
app.use(function(req, res, next) {
  if (req.session.loggedIn) {
    res.locals.authenticated = true;
    db.users.findOne({ email: req.session.loggedIn }, function(err, doc) {
      if (err) return next(err);
      res.locals({ 'me': doc });
      next();
    });
  } else {
    res.locals.authenticated = false;
    next();
  }
});
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res) {
  res.render('index');
});
app.get('/login', function(req, res) {
  res.render('login');
});
app.get('/signup', function(req, res) {
  res.render('signup');
});
app.post('/signup', function(req, res, next) {
  db.users.findOne({name: req.body.user.name}, function(err, doc) {
    if (err) return next(err);
    if (doc) {
      return res.render('signup', {info: 'Usename already exist...'});
    } else {
      db.users.findOne({email: req.body.user.email}, function(err, doc) {
        if (err) return next(err);
        if (doc) {
          return res.render('signup', {info: 'Email already exist...'});
        } else {
          db.users.insert(req.body.user, function(err, doc) {
            if (err) return next(err);
            res.redirect('/login/' + doc[0].email);
          });
        }
      });
    }
  });
});
app.get('/login/:signupEmail', function(req, res) {
  res.render('login', { signupEmail: req.params.signupEmail });
});
app.post('/login', function(req, res) {
  db.users.findOne({ email: req.body.user.email, password: req.body.user.password }, function(err, doc) {
    if (err) return next(err);
    if (!doc) return res.send('<p>User not found. <a href=\"/\">Go back</a> and try again.</p>');
    req.session.loggedIn = doc.email.toString();
    res.redirect('/');
  });
});
app.get('/logout', function(req, res) {
  req.session.loggedIn = null;
  res.redirect('/');
});
app.get('/user/:name', function(req, res) {
  db.users.findOne({ name: req.params.name }, function(err, doc) {
    if (err) return next(err);
    if (!doc) return res.send(404);
    res.render('user', { user: doc });
  });
});

app.get('/post', function(req, res) {
  res.render('post');
});
app.post('/post', function(req, res) {
  app.posts.insert(req.body.post, function(err, doc) {
    if (err) return next(err);
    res.redirect('/post/' + doc[0].title);
  });
});
app.get('/post/:title', function(req, res) {
  app.posts.findOne({ title: req.params.title }, function(err, doc) {
    if (err) return next(err);
    if (!doc) return res.send('<h2>error 404</h2><p>Page not Found</p>');
    res.render('showPost', { post: doc });
  });
});
app.get('/lists', function(req, res) {
  res.render('lists');
});
app.get('/weibo', function(req, res) {
  res.render('weibo');
});

var io = require('socket.io').listen(server);
var socketio = require('./socketio');
socketio.list(io, db);
socketio.weibo(io, db);
socketio.user(io, db);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
