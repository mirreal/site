exports.list = function(io, db) {
  io.of('/lists').on('connection', function(socket) {
    socket.on('online', function() {
      db.lists.find().toArray(function(err, doc) {
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
      db.lists.insert(list, function(err, doc) {
        if (err) return next(err);
      });
    });
    socket.on('del', function(data) {
      socket.broadcast.emit('del', data);
      db.lists.remove({ data: data }, function(err, doc) {
        if (err) return next(err);
      });
    });
  });
};

exports.user = function(io, db) {
  io.of('/user').on('connection', function(socket) {
    console.log('connected.');
    socket.on('follow', function(data) {
      db.users.findOne({ name: data.follower }, function(err, doc) {
        if (err) return next(err);
        if (!doc) return;
        db.users.remove(doc);
        if (data.follow == 1) {
          if (!doc.followed) doc.followed = [];
          if (doc.followed.indexOf(data.followed) == -1) doc.followed.push(data.followed);
        } else {
          var index = doc.followed.indexOf(data.followed);
          doc.followed.splice(index, 1);
        }
        db.users.insert(doc, function(err, doc) {
          if (err) return next(err);
        });
      });
    });
  });
};

exports.weibo = function(io, db) {
  io.of('/weibo').on('connection', function(socket) {
    
    socket.on('online', function(data) {
      var usersFind = [];
      var weibo = [];
      db.users.findOne({ name: data }, function(err, doc) {
        if (err) return next(err);
        if (!doc) return;
        usersFind = doc.followed;
        if (usersFind) usersFind.push(data);
        else usersFind = [data];
        findWeibo(usersFind);
        /*
        usersFind.forEach(function(item) {
          db.weibo.find({ user: item }).toArray(function(err, doc) {
            if (err) return next(err);
            socket.emit('online', doc);
          });
        });
        */
      });
      
      function findWeibo(usersArray) {
        var n = usersArray.length;
        function tryNextUser(i) {
          if (i >= n) {
            selectionSort(weibo, 'date');
            socket.emit('online', weibo);
            return;
          }
          db.weibo.find({user: usersArray[i]}).toArray(function(err, doc) {
            if (err) return next(err);
            if (doc) weibo = weibo.concat(doc);
            tryNextUser(i+1);
          });
        }
        tryNextUser(0);
      }
    });
    socket.on('add', function(data) {
      db.weibo.insert(data, function(err, doc) {
        if (err) return next(err);
      });
    });
    socket.on('favour', function(data) {
      console.log(data.user);
      weibo = {
        user: data.weibo.user,
        date: data.weibo.date
      }
      db.weibo.update(weibo, {$set: {favour: data.user}}, {safe: true},
          function(err) {
        if (err) return next(err);
        console.log('update success...');
      });
    });

  });
};

function selectionSort(array, key) {
  for (var i = 0, n = array.length; i < n; i++) {
    for (var j = i+1, min = i; j < n; j++) {
      if (array[j][key] < array[min][key]) min = j;
    }
    var tmp = array[min];
    array[min] = array[i];
    array[i] = tmp;
  }
}
