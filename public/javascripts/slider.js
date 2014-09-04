$(document).ready(function()
{
  var currentPosition = 0;
  var slideWidth = 750;
  var slides = $('.slide');
  var numberOfSlides = slides.length;

  $('#slidesContainer').css('overflow', 'hidden');

  slides
    .wrapAll('<div id="slideInner"></div>')
    .css({
      'float' : 'left',
      'width' : slideWidth
    });

  $('#slideInner').css('width', slideWidth * numberOfSlides);

  $('#slideshow')
    .prepend('<span class="control" id="leftControl">Clicking moves left</span>')
    .append('<span class="control" id="rightControl">Clicking moves right</span>');

  manageControls(currentPosition);

  $('.control')
    .bind('click', function(){
  currentPosition = ($(this).attr('id')=='rightControl') ? currentPosition+1 : currentPosition-1;
    
    manageControls(currentPosition);
    $('#slideInner').animate({
      'marginLeft' : slideWidth*(-currentPosition)
    });
  });

  function manageControls(position){
    if(position == 0) {
      $('#leftControl').hide();
    } else {
      $('#leftControl').show();
    }
    if(position == numberOfSlides-1) {
      $('#rightControl').hide();
    } else {
      $('#rightControl').show();
    }
  } 
});