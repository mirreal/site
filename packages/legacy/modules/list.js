//module.exports = List;
function List(content) {
  this.content = content;
}

module.exports = function(io, app) {
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
};
