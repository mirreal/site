var socket = io.connect('/weibo')
var user = document.getElementsByTagName('a')[4].innerHTML;
socket.emit('online', user);
socket.on('online', function(data) {
  data.forEach(function(item) {
    addWeiboToDOM(item);
  });
});

var input = document.getElementById('input');
var sendBtn = document.getElementById('send');
var weiboLists = document.getElementById('weiboLists');
var word = document.getElementById('word');
input.addEventListener('textInput', function(event) {
  var wordsLeft = 139 - input.value.length;
  word.innerHTML = wordsLeft;
}, false);
input.addEventListener('keydown', function(event) {
  if (event.keyCode == 8) {
    var wordsLeft = 141 - input.value.length;
    wordsLeft = wordsLeft > 140 ? 140 :wordsLeft
    word.innerHTML = wordsLeft;
  }
}, false);
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
  li.innerHTML = '<h4><a href="/user/' + item.user + '">' + item.user +
    '</a> | ' + date + '</h4>' + '<p>' + item.content + '</p>' +
    '<p><a href="#" class="favour"> Favour[' + item.favour + '] </a>' +
    '<a href="/weibo/comment' + item.date + '" class="comment"> Comment </a>' +
    '<a class="forward"> Forward </a><a class="collect"> Collect </a></p>' + '<hr>';
  weiboLists.insertBefore(li, weiboLists.firstChild);
  (function() {
  var weibo = item;
  li.onclick = function(event) {
    console.log(weibo);
    var target = event.target;
    if (target.className == 'favour') {
      event.preventDefault();
      var i = 8, count = target.innerHTML[i];
      while (target.innerHTML[++i] != ']') count += target.innerHTML[i];
      target.innerHTML = ' Favour[' + parseInt(++count) + '] ';
      console.log(user);
      socket.emit('favour', {user: user, weibo: weibo});
    }
    }
  })();
}

function weiboHandle(event, item) {
  console.log(item);
  var target = event.target;
  if (target.className == 'favour') {
    event.preventDefault();
    var i = 8, count = target.innerHTML[i];
    while (target.innerHTML[++i] != ']') count += target.innerHTML[i];
    target.innerHTML = ' Favour[' + parseInt(++count) + '] ';
    socket.emit('favour', {user: user, weibo: item});
  }
}
