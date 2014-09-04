var mongodb = require('mongodb');
var config = require('../config.json');
var post = config.post || 27017;
var dbServer = new mongodb.Server(config.host, post);
var db = new mongodb.Db(config.database, dbServer);

db.open(function(err, client) {
  if (err) throw err;
  console.log('connet to mongodb.');
  db.users = new mongodb.Collection(client, 'users');
  db.posts = new mongodb.Collection(client, 'posts');
  db.lists = new mongodb.Collection(client, 'lists');
  db.weibo = new mongodb.Collection(client, 'weibo');
  db.projects = new mongodb.Collection(client, 'projects');
});

module.exports = db;
