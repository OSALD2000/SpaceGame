// Inheritans function
function extend(ChildClass, ParentClass){
  var parent = new ParentClass();
  ChildClass.prototype = Object.create(ParentClass.prototype);
  ChildClass.prototype.super = parent.constructor;
  ChildClass.prototype.constructor = ChildClass;
}

// Mass :

function Mass( mass, radius,x, y, angle, x_speed, y_speed, rotation_speed){
  this.x = x;
  this.y = y;
  this.mass = mass || 1;
  this.radius = radius || 50;
  this.angle = angle || 0;
  this.x_speed = x_speed || 0;
  this.y_speed = y_speed || 0;
  this.rotation_speed = rotation_speed || 0;
}

Mass.prototype.update = function(elapsed, ctx){
     this.x += this.x_speed*elapsed;
     this.y += this.y_speed*elapsed;

     this.angle += this.rotation_speed*elapsed;
     this.angle %= (2* Math.PI);

     if(this.x-this.radius > ctx.canvas.width){
      this.x = this.radius;
     }

     if(this.x-this.radius < 0){
        this.x = ctx.canvas.width + this.radius;
     }


     if(this.y-this.radius > ctx.canvas.height){
       this.y = this.radius;
     }

     if(this.y-this.radius < 0){
      this.y = ctx.canvas.height - this.radius;
     }
}

// 2. Newtons Law:
Mass.prototype.push= function(angle, force, elapsed){
  this.x_speed += elapsed *(Math.cos(angle) * force)/this.mass;
  this.y_speed += elapsed *(Math.sin(angle) * force)/this.mass;
}

Mass.prototype.twist = function(force, elapsed){
  this.rotation_speed += elapsed * force / this.mass;
}

Mass.prototype.speed = function(){
  return Math.sqrt(Math.pow(this.x_speed,2) + Math.pow(this.y_speed,2));
}

Mass.prototype.movment_angle = function(){
  return Math.atan2(this.y_speed, this.x_speed);
}


function Asteroid(mass, x, y, x_speed, y_speed, rotation_speed) {
  var density = 1; // kg per square pixel
  var radius = Math.sqrt((mass / density) / Math.PI);
  this.super(mass, radius, x, y, 0, x_speed, y_speed, rotation_speed);
  this.circumference = 2 * Math.PI * this.radius;
  this.segments = Math.ceil(this.circumference / 15);
  this.segments = Math.min(25, Math.max(5, this.segments));
  this.noise = 0.2;
  this.shape = [];
  for(var i = 0; i < this.segments; i++) {
    this.shape.push(2 * (Math.random() - 0.5));
  }
}
extend(Asteroid, Mass);

Asteroid.prototype.draw = function(ctx, guide) {
  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.rotate(this.angle);
  draw_asteroid(ctx, this.radius, this.shape, {
    noise: this.noise,
    guide: guide
  });
  ctx.restore();
}

Asteroid.prototype.child = function(mass) {
  return new Asteroid(
    mass, this.x, this.y,
    this.x_speed, this.y_speed,
    this.rotation_speed
  )
}

function Ship(x, y, power, weapon_power  ) {
  this.super(10, 20, x, y,  Math.PI);
  this.thruster_power = power;
  this.steering_power = power / 20;
  this.right_thruster = false;
  this.left_thruster = false;
  this.thruster_on = false;
  this.retro_on = false;
  this.trigger =false;

  this.loaded = false;
  this.weapon_reload_time = 0.25; // seconds
  this.time_until_reloaded = this.weapon_reload_time;
  this.weapon_power = weapon_power || 200;

  this.compromised = false;
  this.max_health = 2.0;
  this.health = this.max_health;
}
extend(Ship, Mass);

Ship.prototype.draw = function(ctx, guide) {
  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.rotate(this.angle);
  if(guide && this.compromised) {
    ctx.save();
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
  draw_ship(ctx, this.radius, {
    guide: guide,
    thruster: this.thruster_on
  });
  ctx.restore();
}

Ship.prototype.update = function(elapsed) {
  this.loaded = this.time_until_reloaded === 0;
  if(!this.loaded) {
    this.time_until_reloaded -= Math.min(elapsed, this.time_until_reloaded);
  }
  this.push(this.angle, (this.thruster_on - this.retro_on) * this.thruster_power, elapsed);
  this.twist((this.right_thruster - this.left_thruster) * this.steering_power, elapsed);
  
  if(this.compromised) {
    this.health -= Math.min(0.01, this.health );
  }

  Mass.prototype.update.apply(this, arguments);
}

Ship.prototype.projectile = function(elapsed) {
  this.time_until_reloaded = this.weapon_reload_time;
  var p = new Projectile(0.025, 1,
    this.x + Math.cos(this.angle) * this.radius,
    this.y + Math.sin(this.angle) * this.radius,
    this.x_speed,
    this.y_speed,
    this.rotation_speed
  );
  p.push(this.angle, this.weapon_power, elapsed);
  this.push(this.angle + Math.PI, this.weapon_power, elapsed);
  return p;
}


//Projectile
function Projectile(mass, lifetime, x, y, x_speed, y_speed, rotation_speed) {
  var density = 0.001; 
  var radius = Math.sqrt((mass / density) / Math.PI);
  this.super(mass, radius, x, y, 0, x_speed, y_speed, rotation_speed);
  this.lifetime = lifetime;
  this.life = 1.0;
}
extend(Projectile, Mass);

Projectile.prototype.update = function(elapsed, ctx) {
  this.life -= (elapsed / this.lifetime);
  Mass.prototype.update.apply(this, arguments);
}

Projectile.prototype.draw = function(ctx, guide) {
  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.rotate(this.angle);
  draw_projectile(ctx, this.radius, this.life, guide);
  ctx.restore();
}

// Health Zeiger 
function Indicator(label, x, y, width, height) {
  this.label = label + ": ";
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}

Indicator.prototype.draw = function(c, max, level) {
  c.save();
  c.strokeStyle = "white";
  c.fillStyle = "white";
  c.font = this.height + "pt Arial";
  var offset = c.measureText(this.label).width;
  c.fillText(this.label, this.x, this.y + this.height - 1);
  c.beginPath();
  c.rect(offset + this.x, this.y, this.width, this.height);
  c.stroke();
  c.beginPath();
  c.rect(offset + this.x, this.y, this.width * (max / level), this.height);
  c.fill();
  c.restore()
}

// Scour und fps zhealer!
function NumberIndicator(label, x, y, options) {
  options = options || {}
  this.label = label + ": ";
  this.x = x;
  this.y = y;
  this.digits = options.digits || 0;
  this.pt = options.pt || 10;
  this.align = options.align || 'end';

}

NumberIndicator.prototype.draw = function(c, value) {
  c.save();
  c.fillStyle = "white";
  c.font = this.pt + "pt Arial";
  c.textAlign = this.align;
  c.fillText(
    this.label + value.toFixed(this.digits),
    this.x, this.y + this.pt - 1
  );
  c.restore();
}

// Message Class "GameOver Message"
function Message(x, y, options) {
  options = options || {};
  this.x = x;
  this.y = y;
  this.main_pt = options.main_pt || 28;
  this.sub_pt = options.sub_pt || 18;
  this.fill = options.fill || "white";
  this.textAlign = options.align || 'center';
}

Message.prototype.draw = function(c, main, sub) {
  c.save();
  c.fillStyle = this.fill;
  c.textAlign = this.textAlign;
  c.font = this.main_pt + "pt Arial";
  c.fillText(main, this.x, this.y);
  c.font = this.sub_pt + "pt Arial";
  c.fillText(sub, this.x, this.y + this.main_pt);
  c.restore();
}