var signup = document.getElementById('signup');

signup.onsubmit = function(event) {
  event.preventDefault();
  var form = signup.elements;
  if (signup.elements[1].value == '') return alert('Input username.');
  if (form[2].value == '') return alert('Input email');
  if (form[3].value == '') {
    return alert('Input password...');
  } else {
    if (form[3].value != form[4].value) {
      form[4].value = '';
      return alert('Password error...');
    }
  }
  signup.submit();
};
