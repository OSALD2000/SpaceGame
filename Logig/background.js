var $ = document.querySelectorAll.bind(document); 
asteroidCtx= $('.asteroid')[0].getContext("2d");
shiplCtx= $('.ship')[0].getContext("2d");
let asteroidsBackground = [];
let ships = [];

for (let index = 0; index < 8 ; index++) {
    asteroidsBackground.push(new Asteroid(
        10000,
        $('.asteroid')[0].width * Math.random(),
        $('.asteroid')[0].height * Math.random(), 
   
      ))
}

for (let index = 0; index < 10 ; index++) {
    ships.push(new Ship(
        $('.asteroid')[0].width * Math.random(),
        $('.asteroid')[0].height * Math.random(), 
      ))
}

asteroidsBackground.forEach(asteroid =>
    asteroid.draw(asteroidCtx)
);
asteroidsBackground.forEach(asteroid =>
    asteroid.draw(shiplCtx)
);

ships.forEach(ship =>
    ship.thruster_on = true
);

ships.forEach(ship =>
    ship.draw(asteroidCtx)
);
ships.forEach(ship =>
    ship.draw(shiplCtx)
);
