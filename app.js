var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

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
    app.users.findOne({ email: req.session.loggedIn }, function(err, doc) {
      if (!doc) console.log('Not found.');
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
app.get('/user/:name', function(req, res) {
  app.users.findOne({ name: req.params.name }, function(err, doc) {
    if (err) return next(err);
    if (!doc) return res.send(404);
    res.render('user', { user: doc });
  });
});

app.post('/signup', function(req, res, next) {
  app.users.insert(req.body.user, function(err, doc) {
    if (err) return next(err);
    res.redirect('/login/' + doc[0].email);
  });
});
app.get('/login/:signupEmail', function(req, res) {
  res.render('login', { signupEmail: req.params.signupEmail });
});
app.post('/login', function(req, res) {
  app.users.findOne({ email: req.body.user.email, password: req.body.user.password }, function(err, doc) {
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
app.get('/post', function(req, res) {
  res.render('post');
});
app.post('/post', function(req, res) {
  app.posts.insert(req.body.post, function(err, doc) {
    if (err) return next(err);
    res.redirect('/post/' + doc[0].title);
  });
});
app.get('/post/:postTitle', function(req, res) {
  app.posts.findOne({ title: req.params.postTitle }, function(err, doc) {
    if (err) return next(err);
    if (!doc) return res.send('<h2>error 404</h2><p>Page not Found</p>');
    res.render('showPost', { post: doc });
  });
});

var mongodb = require('mongodb');
var dbServer = new mongodb.Server('127.0.0.1', 27017);
//var dbServer = new mongodb.Server('192.168.229.1', 27017);
new mongodb.Db('mysite', dbServer).open(function(err, client) {
  if (err) throw err;
  console.log('connet to mongodb.');
  app.users = new mongodb.Collection(client, 'users');
  app.posts = new mongodb.Collection(client, 'posts');
  app.lists = new mongodb.Collection(client, 'lists');
  app.weibo = new mongodb.Collection(client, 'weibo');
  client.ensureIndex('users', 'email', function(err) {
    if (err) throw err;
    client.ensureIndex('users', 'password', function(err) {
      if (err) throw err;
      console.log('Ensure index.');
      server.listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
      });
    });
  });
});

app.get('/lists', function(req, res) {
  res.render('lists');
});

var io = require('socket.io').listen(server);
io.of('/lists').on('connection', function(socket) {
  socket.on('online', function() {
    app.lists.find().toArray(function(err, doc) {
      if (err) return next(err);
      var data = [];
      for (var i = 0; i < doc.length; i++) {
        data[i] = doc[i].data;
      }
      socket.emit('online', data);
    });
  });
  socket.on('addList', function(data) {
    socket.broadcast.emit('addList', data);
    var list = { data: data };
    app.lists.insert(list, function(err, doc) {
      if (err) return next(err);
    });
  });
  socket.on('del', function(data) {
    socket.broadcast.emit('del', data);
    app.lists.remove({ data: data}, function(err, doc) {
      if (err) return next(err);
    });
  });
});

app.get('/weibo', function(req, res) {
  res.render('weibo');
});
io.of('/weibo').on('connection', function(socket) {
  socket.on('online', function(data) {
    var followed = [];
    var weibo = [];
    app.users.findOne({ name: data}, function(err, doc) {
      if (err) return next(err);
      if (!doc) return;
      followed = doc.followed;
      if (followed) {
        followed.forEach(function(item) {
          app.weibo.find({ user: item }).toArray(function(err, doc) {
            if (err) return next(err);
            if (doc) weibo = weibo.concat(doc);
          });
        });
      }
      app.weibo.find({ user: data }).toArray(function(err, doc) {
        if (err) return next(err);
        if (doc) weibo = weibo.concat(doc);
        console.log(weibo);
        socket.emit('online', weibo);
      });
      //socket.emit('online', weibo);
    });
  });
  socket.on('add', function(data) {
    app.weibo.insert(data, function(err, doc) {
      if (err) return next(err);
    });
  });
});

io.of('/user').on('connection', function(socket) {
  console.log('connected.');
  socket.on('follow', function(data) {
    app.users.findOne({ name: data.follower }, function(err, doc) {
      if (err) return next(err);
      if (!doc) return;
      app.users.remove(doc);
      if (data.follow == 1) {
        if (!doc.followed) doc.followed = [];
        if (doc.followed.indexOf(data.followed) == -1) doc.followed.push(data.followed);
      } else {
        var index = doc.followed.indexOf(data.followed);
        doc.followed.splice(index, 1);
      }
      app.users.insert(doc, function(err, doc) {
        if (err) return next(err);
      });
    });
  });

});
