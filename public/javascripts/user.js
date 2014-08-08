var socket = io.connect('/user');

var follow = document.getElementById('follow');
follow.onclick = function(event) {
  event.preventDefault();
  var follower = document.getElementsByTagName('h2')[0].innerHTML;
  var followed = document.getElementsByTagName('a')[2].innerHTML;
  console.log(follower + ' follow ' + followed);
  if (follow.innerHTML == 'Follow') {
    socket.emit('follow', {
      follow: 1,
      follower: follower,
      followed: followed
    });
    follow.innerHTML = 'Unfollow';
  } else {
    socket.emit('follow', {
      follow: 0,
      follower: follower,
      followed: followed
    });
    follow.innerHTML = 'Follow';
  }
};
