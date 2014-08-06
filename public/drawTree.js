var canvas = document.querySelector("#canvas");
var ctx = canvas.getContext("2d");
drawTree(ctx, 320, 470, 60, -Math.PI / 2, 12, 12);

function drawTree(ctx, startX, startY, length, angle, depth, branchWidth) {
  if (depth == 0) return;

  var MAX_ANGLE= Math.PI / 2;

  var rand = Math.random;
    
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineCap = 'round';
  ctx.lineWidth = branchWidth;
  var endX = startX + length * Math.cos(angle);
  var endY = startY + length * Math.sin(angle);
  ctx.lineTo(endX, endY);
  
  if (depth <= 2) {
    ctx.strokeStyle = 'rgb(0,' + (((rand() * 64) + 64) >> 0) + ',0)';
  } else {
    ctx.strokeStyle = 'rgb(' + (((rand() * 64) + 64) >> 0) + ', 50, 25)';
  }
  ctx.stroke();

  depth -= 1;
  branchWidth *= 0.7;

  var subBranches = rand() < 0.9 ? 2 : 3;
  for (var i = 0; i < subBranches; i++) {
    var newAngle = angle + (rand()-0.5) * MAX_ANGLE;
    var newLength = length * (0.7 + rand() * 0.3);
    drawTree(ctx, endX, endY, newLength, newAngle, depth, branchWidth);
  }
}