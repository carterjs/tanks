define(['js/Line.js'],function(Line) {
  function getDistance(x1,y1,x2,y2) {
    return Math.sqrt(Math.pow(y2-y1,2) + Math.pow(x2-x1,2));
  }
  var Bullet = function(x,y,radius,angle,mag) {
    this.active = true;
    this.sprite = new PIXI.Sprite();
    this.sprite.position.set(x,y);
    this.radius = radius;
    this.angle = angle;
    this.sprite.anchor.set(0.5);
    this.intersections = [];
    this.advancedGraphics = new PIXI.Graphics();
    var graphics = new PIXI.Graphics();
    graphics.beginFill(0);
    graphics.drawCircle(0,0,radius);
    graphics.endFill();
    this.sprite.texture = graphics.generateTexture();
    this.velocity = {
      x: Math.cos(angle) * mag,
      y: Math.sin(angle) * mag
    },
    this.path = [],
    this.progress = 0;
    this.update = function(delta) {
      if(this.intersections.length > 0) {
        if(getDistance(this.sprite.x,this.sprite.y,this.intersections[0].x,this.intersections[0].y) > mag) {
          this.sprite.position.x = this.path[Math.round(this.progress * (this.path.length-1))].x;
          this.sprite.position.y = this.path[Math.round(this.progress * (this.path.length-1))].y;
        } else {
          this.intersections.splice(0,1);
        }
      }
      if(this.progress < 1) {
        this.progress += delta/this.path.length;
        if(this.progress > 1) {
          this.progress = 1;
        }
      } else {
        this.active = false;
      }
    };
    this.intersect = function(shapes,bounces,radius) {
      var currentAngle = this.angle;
      var current = {
        x: x,
        y: y
      };
      for(var i=0;i<bounces;i++) {
        var hits = [];
        var hitLines = [];
        var tragectory = new Line(current.x,current.y,current.x+Math.cos(currentAngle)*radius,current.y+Math.sin(currentAngle)*radius);
        var record = Infinity;
        var closest = null;
        for(var j=0;j<shapes.length;j++) {
          for(var k=0;k<shapes[j].lines.length;k++) {
            var intersection = tragectory.intersect(shapes[j].lines[k]);
            if(intersection != false) {
              var distance = getDistance(current.x,current.y,intersection.x,intersection.y);
              if(distance < record) {
                record = distance;
                closest = hits.length;
              }
              hits.push(intersection);
              hitLines.push(shapes[j].lines[k]);
            }
          }
        }
        if(hits.length > 0) {
          var normal = hitLines[closest].getAngle()+Math.PI/2;
          var nextAngle = 2 * normal - Math.PI - currentAngle;
          this.intersections.push({
            x: hits[closest].x,
            y: hits[closest].y,
            line: hitLines[closest],
            angleIn: currentAngle,
            angleOut: nextAngle
          });
          current.x = hits[closest].x - Math.cos(currentAngle);
          current.y = hits[closest].y - Math.sin(currentAngle);
          currentAngle = nextAngle % (Math.PI*2);
        }
      }
      //Generate path to follow
      this.intersections.unshift({
        x: this.sprite.x,
        y: this.sprite.y
      });
      for(var i=1;i<this.intersections.length;i++) {
        var distance = getDistance(this.intersections[i-1].x,this.intersections[i-1].y,this.intersections[i].x,this.intersections[i].y);
        var pointCount = Math.round(distance/mag);
        var angle = Math.atan2(this.intersections[i].y-this.intersections[i-1].y,this.intersections[i].x-this.intersections[i-1].x);
        for(var j=0;j<pointCount;j++) {
          if(j == pointCount - 1) {
            this.path.push({
              x: this.intersections[i].x,
              y: this.intersections[i].y
            })
          } else {
            this.path.push({
              x: this.intersections[i-1].x + Math.cos(angle) * mag * j,
              y: this.intersections[i-1].y + Math.sin(angle) * mag * j
            });
          }
        }
      }
      //Generate graphics
      for(var i=1;i<this.intersections.length;i++) {
        this.advancedGraphics.lineStyle(this.radius/2,0x880000,0.25/i+0.25);
        this.advancedGraphics.moveTo(this.intersections[i-1].x,this.intersections[i-1].y);
        this.advancedGraphics.lineTo(this.intersections[i].x,this.intersections[i].y);
        if(i == this.intersections.length-1) {
          this.advancedGraphics.lineStyle(5,0,0.25);
          this.advancedGraphics.beginFill(0x008800,0.5);
          this.advancedGraphics.drawCircle(this.intersections[i].x,this.intersections[i].y,100);
          this.advancedGraphics.endFill();
        }
      }
    };
  }
  return Bullet;
})
