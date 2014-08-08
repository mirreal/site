var socket = io.connect('/lists');
socket.emit('online');
socket.on('online', function(data) {
  for (var i = 0; i < data.length; i++) {
    addListToDOM(data[i]);
  }
});
socket.on('addList', function(data) {
  addListToDOM(data);
});
socket.on('del', function(data) {
  removeListFromDOM(data);
});

var lists = document.getElementById('to_do_lists');
var input = document.getElementById('input');
var sendBtn = document.getElementById('send');
sendBtn.onclick = addList;
document.addEventListener('keydown', function(event) {
  if (event.keyCode == 13) addList();
}, false);

function addList() {
  var value= input.value;
  if (!value) value = ' ';
  addListToDOM(value);
  socket.emit('addList', value);
  input.value = '';
  input.focus();
};

function addListToDOM(text) {
  var li = document.createElement('li');
  li.setAttribute('id', text);
  li.innerHTML = '<button class="done">Done</button>' +
    '<button class="del">Del</button>' + text;
  lists.insertBefore(li, lists.firstChild);
  li.onclick = deleteList;
}

function deleteList(event) {
  if (event.target.className == 'del') {
    var key = event.target.parentNode.id.toString();
    removeListFromDOM(key);
    socket.emit('del', key);
  }
}

function removeListFromDOM(key) {
  var li = document.getElementById(key);
  lists.removeChild(li);
}
