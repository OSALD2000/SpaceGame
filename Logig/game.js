var game;
let gameOverSound = new Audio('../sounds/gameOver.wav');
window.onload=function(){
    game  = new AsteroidsGame('asteroids');

 
}

var AsteroidsGame = function(id) {
    this.canvas = document.getElementById(id);
    this.level = 1;
    this.level_indicator = new NumberIndicator("level", this.canvas.width / 2, 5, {
        align: "center",
        pt : 20
    });

    this.c = this.canvas.getContext("2d");
    this.canvas.focus();
    this.guide = false;
    this.game_over = false;
    this.ship_mass = 10;
    this.ship_radius = 15;

    this.asteroid_mass = 5000;            
    this.asteroid_push = 500000; 
    this.mass_destroyed = 500;
    this.score = 0;
    this.fps = 0;
    this.ship = new Ship(
      this.canvas.width / 2,
      this.canvas.height / 2,
      1000, 200
    );
    this.projectiles = [];
    this.asteroids = [];
    this.canvas.addEventListener("keydown", this.keyDown.bind(this), true);
    this.canvas.addEventListener("keyup", this.keyUp.bind(this), true);
    this.asteroids.push(this.moving_asteroid());
    this.asteroids.push(this.moving_asteroid());
    this.health_indicator = new Indicator("health", 5, 5, 100, 10);
    this.score_indicator = new NumberIndicator("score",
                                                this.canvas.width - 10, 5);
    this.fps_indicator = new NumberIndicator("fps",
                                            this.canvas.width - 10,
                                            this.canvas.height - 15,
                                            {digits: 2});
    this.message = new Message(this.c.canvas.width/2,this.c.canvas.height/2);
    this.message_print=true;
    window.requestAnimationFrame(this.frame.bind(this));
}

AsteroidsGame.prototype.reset_game = function(){
    this.game_over = false;
    this.win = false;
    this.message_print=true;

    this.level = 0;
    this.score = 0;
    this.asteroid_mass = 5000;            
    this.asteroid_push = 500000; 
    this.ship = new Ship(
      this.canvas.width / 2,
      this.canvas.height / 2,
      1000, 200
    );
    this.projectiles = [];
    this.asteroids = [];
    this.levelUp();

}

AsteroidsGame.prototype.moving_asteroid = function(elapsed) {
    var asteroid = this.new_asteroid();
    this.push_asteroid(asteroid, elapsed);
    return asteroid;
  }
  
AsteroidsGame.prototype.new_asteroid = function() {
    let mass =(this.asteroid_mass/2) + this.asteroid_mass* Math.random()
    return new Asteroid(
      mass,
      this.canvas.width * Math.random(),
      this.canvas.height * Math.random(), 
    );
  }
  
AsteroidsGame.prototype.push_asteroid = function(asteroid, elapsed) {
    elapsed = elapsed || 0.015;
    asteroid.push(2 * Math.PI * Math.random(), this.asteroid_push, elapsed);
    asteroid.twist(
      (Math.random() - 0.5) * Math.PI * this.asteroid_push * 0.02,
      elapsed
    );
}

AsteroidsGame.prototype.split_asteroid = function(asteroid, elapsed) {
    asteroid.mass -= this.mass_destroyed;
    this.score += this.mass_destroyed;
    var split = 0.25 + 0.5 * Math.random(); // split unevenly
    var ch1 = asteroid.child(asteroid.mass * split);
    var ch2 = asteroid.child(asteroid.mass * (1 - split));
    [ch1, ch2].forEach(function(child) {
      if(child.mass < this.mass_destroyed) {
        this.score += child.mass;
      } else {
        this.push_asteroid(child, elapsed);
        this.asteroids.push(child);
      }
    }, this);
}

AsteroidsGame.prototype.keyDown = function(e) {
    this.key_handler(e, true);
  }
  AsteroidsGame.prototype.keyUp = function(e) {
    this.key_handler(e, false);
}
  
  AsteroidsGame.prototype.key_handler = function(e, value) {
    var nothing_handled = false;
    switch(e.key || e.keyCode) {
      case "a":
      case 65: 
      case "ArrowLeft":
      case 37:           
        this.ship.left_thruster = value;
        break;

      case "w":
      case 87: 
      case "ArrowUp":
      case 38:            
        this.ship.thruster_on = value;
        break;

      case "d":
      case 68:
      case "ArrowRight":
      case 39:           
        this.ship.right_thruster = value;
        break;

      case "s":
      case 83:
      case "ArrowDown":
      case 40:
        this.ship.retro_on = value;
        break;

      case " ":
      case 32: 
        if(this.game_over || this.win) {
            console.log("raweras");
            this.reset_game();
        } else {
            this.ship.trigger = value;
        }
        break;
      case "g":
      case 71: // g for guide            
        if(value) this.guide = !this.guide;
        break;
      default:
        nothing_handled = true;
    }
    if(!nothing_handled) e.preventDefault();
}

AsteroidsGame.prototype.frame = function(timestamp) {
    if (!this.previous) this.previous = timestamp;
    if(this.asteroids.length == 0){ 
        this.levelUp();
    }
    var elapsed = timestamp - this.previous;
    this.fps = (1000 / elapsed);
    this.update(elapsed / 1000);
    this.draw();
    this.previous = timestamp;
    window.requestAnimationFrame(this.frame.bind(this));
}

AsteroidsGame.prototype.update = function(elapsed) {
    this.ship.compromised = false;
    this.ship.compromised = false;
    if(this.ship.health <= 0) {
        this.game_over = true;
        return;
    }
    if(this.level > 34){
        this.win = true;
        return;
    }
    this.asteroids.forEach(function(asteroid) {
      asteroid.update(elapsed, this.c);
      if(collision(asteroid, this.ship)) {
        this.ship.compromised = true;
      }
    }, this);
    this.ship.update(elapsed, this.c);
    this.projectiles.forEach(function(p, i, projectiles) {
        p.update(elapsed, this.c);
        if(p.life <= 0) {
          projectiles.splice(i, 1);
        } else {
          this.asteroids.forEach(function(asteroid, j) {
            if(collision(asteroid, p)) {
              projectiles.splice(i, 1);
              this.asteroids.splice(j, 1);
              this.split_asteroid(asteroid, elapsed);
            }
          }, this);
        }
      }, this);
    if(this.ship.trigger && this.ship.loaded) {
      this.projectiles.push(this.ship.projectile(elapsed));
    }
}

AsteroidsGame.prototype.draw = function() {
    if(!this.message_print){
        return;
    }
    else if(this.game_over && this.message_print) {
        this.message.draw(this.c, "GAME OVER", "Press space to play again");
        this.message_print=false;
        gameOverSound.play();
        return;
    }
    else if(this.win  && !this.message_on){
        this.message.draw(this.c, `You Win ! :) `, `Scour : ${this.score} \n Press space to play again`);
        this.win=true;
        this.message_print=false;
        return;
    }
    this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if(this.guide) {
      draw_grid(this.c);
      this.asteroids.forEach(function(asteroid) {
        draw_line(this.c, asteroid, this.ship);
        this.projectiles.forEach(function(projectile){
            draw_line(this.c, projectile, asteroid);
        }, this);
      }, this);
      this.fps_indicator.draw(this.c, this.fps);
    }
    this.asteroids.forEach(function(asteroid) {
      asteroid.draw(this.c, this.guide);
    }, this);
    this.ship.draw(this.c, this.guide);
    this.projectiles.forEach(function(p) {
      p.draw(this.c);
    }, this);

    this.level_indicator.draw(this.c, this.level);
    this.health_indicator.draw(this.c, this.ship.health, this.ship.max_health);
    this.score_indicator.draw(this.c, this.score);
}

AsteroidsGame.prototype.levelUp=function(elapsed){
    this.level +=1;
    let counterMax = this.level > 30 ? 30: this.level;
    this.asteroid_push += ((5000) * (Math.random()*this.level));
    this.asteroid_mass += 50 * (this.level * Math.random());
    for (let counter = 0; counter < 2*counterMax; counter++) {
        this.asteroids.push(this.moving_asteroid(elapsed));
    }
}