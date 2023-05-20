// Draw griad "koordinatensystem"
function draw_grid(ctx, minor, major, stroke, fill) {
  minor = minor || 10;
  major = major || minor * 5;
  stroke = stroke || "#00FF00";
  fill = fill || "#009900";
  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.fillStyle = fill;
  let width = ctx.canvas.width, height = ctx.canvas.height
  for(var x = 0; x < width; x += minor) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.lineWidth = (x % major == 0) ? 0.5 : 0.25;
    ctx.stroke();
    if(x % major == 0 ) {ctx.fillText(x, x, 10);}
  }
  for(var y = 0; y < height; y += minor) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.lineWidth = (y % major == 0) ? 0.5 : 0.25;
    ctx.stroke();
    if(y % major == 0 ) {ctx.fillText(y, 0, y + 10);}
  }
  ctx.restore();
}
// Drawc an Asteroid:
function draw_asteroid(ctx, radius, shape, options) {
  options = options || {};
  ctx.strokeStyle = options.stroke || "white";
  ctx.fillStyle = options.fill || "black";
  ctx.save();
  ctx.beginPath();
  for(let i = 0; i < shape.length; i++) {
    ctx.rotate(2 * Math.PI / shape.length);
    ctx.lineTo(radius + radius * options.noise * shape[i], 0);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
 
  if(options.guide) {
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth = 0.2;
    ctx.arc(0, 0, radius + radius * options.noise, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, radius - radius * options.noise, 0, 2 * Math.PI);
    ctx.stroke();
  }
  ctx.restore();
}

// draw-Ship:

function draw_ship(ctx, radius, options){
  options = options || {};
  let curve1 = options.curve1 || 0.75;
  let curve2 = options.curve2 || 0.75;
  ctx.save();
  if(options.guide){
    ctx.strokeStyle="white";
    ctx.fillStyle="rgba(0,0,0,0.25)";
    ctx.lineWidth=0.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0,2*Math.PI);
    ctx.stroke();
    ctx.fill();
  }

  ctx.lineWidth = options.lineWidth || 2;
  ctx.strokeStyle = options.stroke || "white";
  ctx.fillStyle = options.fill || "black";
  let angle = (options.angle || 0.5 * Math.PI)/2;

  ctx.beginPath();
  ctx.moveTo(radius , 0);
  ctx.quadraticCurveTo(radius*Math.cos(angle)*curve2 , radius*Math.sin(angle)*curve2,
     Math.cos(Math.PI - angle) * radius,
     Math.sin(Math.PI - angle) * radius 
  );

  ctx.quadraticCurveTo(radius*curve1 - radius,0,
    Math.cos(Math.PI + angle) * radius,
    Math.sin(Math.PI + angle) * radius );

  ctx.quadraticCurveTo(
      radius*Math.cos(-angle)*curve2,
      radius*Math.sin(-angle)*curve2,
      radius,0
  );
  ctx.fill();
  ctx.stroke();
  
  if(options.thruster){
    ctx.save()
    ctx.translate(-17 ,0);
    ctx.rotate(Math.PI);
    draw_ship(ctx, radius*0.35 , {
      stroke:'#f5b951',
      fill:'#fc2b4e',
      curve1: -0.75
    })
    ctx.restore();
  }
  if(options.guide){
    ctx.fillStyle="white";
    ctx.beginPath();
    ctx.moveTo(Math.cos(-angle)*radius, Math.sin(-angle)*radius);
    ctx.lineTo(0,0);
    ctx.lineTo(Math.cos(angle)*radius, Math.sin(angle)*radius);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-radius, 0);
    ctx.lineTo(0,0);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(Math.cos(angle)*radius*curve2, Math.sin(angle)*radius*curve2, radius/40, 0, Math.PI*2);
    ctx.stroke();
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(Math.cos(angle)*radius*curve2, Math.sin(-angle)*radius*curve2, radius/40, 0, Math.PI*2);
    ctx.stroke();
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(radius * curve1 - radius, 0, radius/50, 0, Math.PI*2);
    ctx.stroke();
    ctx.fill();
  }


  ctx.restore();

}

// draw_projectile
function draw_projectile(ctx, radius, lifetime){
ctx.save();
ctx.fillStyle = "rgb(100%, 100%, " + (100 * lifetime) + "%)";
ctx.beginPath();
ctx.arc(0,0,radius, 0 , 2 * Math.PI);
ctx.fill();
ctx.restore();
}

// Draw Lines zwischen Objekte
function draw_line(ctx, obj1, obj2) {
  ctx.save();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(obj1.x, obj1.y);
  ctx.lineTo(obj2.x, obj2.y);
  ctx.stroke();
  ctx.restore();
}