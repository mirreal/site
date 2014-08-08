var socket = io.connect('/weibo')
var user = document.getElementsByTagName('a')[2].innerHTML;
socket.emit('online', user);
socket.on('online', function(data) {
  data.forEach(function(item) {
    addWeiboToDOM(item);
  });
});

var input = document.getElementById('input');
var sendBtn = document.getElementById('send');
var weiboLists = document.getElementById('weiboLists');
sendBtn.onclick = function() {
  var content= input.value;
  if (!content) content = ' ';
  var weibo = {
    content: content,
    user: user,
    date: Date.now()
  };
  addWeiboToDOM(weibo);
  socket.emit('add', weibo);
  input.value = '';
  input.focus();
}
function addWeiboToDOM(item) {
  var li = document.createElement('li');
  var date = new Date(item.date).toString();
  li.innerHTML = '<h4>' + item.user + ' | ' + date + '</h4>' +
    '<p>' + item.content + '</p>';
  weiboLists.insertBefore(li, weiboLists.firstChild);
}
