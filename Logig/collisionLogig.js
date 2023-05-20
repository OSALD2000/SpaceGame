function collision(obj1, obj2) {
    return distance_between(obj1, obj2) < (obj1.radius + obj2.radius);
}
  
function distance_between(obj1, obj2) {
    return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2));
}

