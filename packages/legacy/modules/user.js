var db = require('./database');

function User(user) {
  this.name = user.name;
  this.password = user,password;
}

User.prototype.insert = function(callback) {
  var user = this;
  db.open(function(err, client) {
    if (err) return callback(err);
    client.collection('users', function(err, collection) {
      if (err) return callback(err);
      collection.ensureIndex('name', {unique: true});
      collection.insert(user, {safe: true}, function(err, doc) {
        db.close();
        return callback(err, doc);
      });
    });
  });
};

User.prototype.find = function(query, callback) {
  db.open(function(err, client) {
    if (err) return callback(err);
    client.collection('users', function(err, collection) {
      if (err) return callback(err);
      collection.findOne(query, function(err, doc) {
        db.close();
        if (doc) {
          var user = new User(doc);
          callback(err, user);
        } else {
          callback(err);
        }
      });
    });
  });
};
