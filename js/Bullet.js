define(['js/Line.js'],function(Line) {
  function getDistance(x1,y1,x2,y2) {
    return Math.sqrt(Math.pow(y2-y1,2) + Math.pow(x2-x1,2));
  }
  var Bullet = function(x,y,radius,angle,mag) {
    this.sprite = new PIXI.Sprite();
    this.sprite.position.set(x,y);
    this.sprite.anchor.set(0.5);
    this.intersection = null;
    var graphics = new PIXI.Graphics();
    graphics.beginFill(0);
    graphics.drawCircle(0,0,radius);
    graphics.endFill();
    this.sprite.texture = graphics.generateTexture();
    this.velocity = {
      x: Math.cos(angle) * mag,
      y: Math.sin(angle) * mag
    };
    this.update = function(delta) {
      if(this.intersection !== null) {
        if(getDistance(this.sprite.x,this.sprite.y,this.intersection.x,this.intersection.y) > mag) {
          this.sprite.position.x += this.velocity.x;
          this.sprite.position.y += this.velocity.y;
        } else {
          this.sprite.position.set(this.intersection.x,this.intersection.y);
        }
      }
    };
    this.intersect = function(lines,radius) {
      var intersections = [];
      var tragectory = new Line(x,y,x+Math.cos(angle)*radius,y+Math.sin(angle)*radius);
      for(var i=0;i<lines.length;i++) {
        var intersection = tragectory.intersect(lines[i]);
        if(intersection !== false) {
          intersections.push(intersection);
        }
      }
      if(intersections.length > 0) {
        var record = Infinity;
        var closest = 0;
        for(var i=0;i<intersections.length;i++) {
          var distance = getDistance(x,y,intersections[i].x,intersections[i].y);
          if(distance < record) {
            record = distance;
            closest = i;
          }
        }
        this.intersection = intersections[closest];
      }
    };
  }
  return Bullet;
})
