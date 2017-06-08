define(['js/LineSegment.js'],function(LineSegment) {
  function getDistance(x1,y1,x2,y2) {
    return Math.sqrt(Math.pow(y2-y1,2) + Math.pow(x2-x1,2));
  }
  var Light = function(x,y,radius) {
    this.center = {
      x: x,
      y: y
    }
    this.radius = radius;
    this.rays = [];
    this.outline = [];
    this.shine = function(shapes) {
      this.rays = [];
      this.outline = [];
      for(var i=0;i<shapes.length;i++) {
        for(var j=0;j<shapes[i].lines.length;j++) {
          var lineSegment = shapes[i].lines[j];
          var angle = Math.atan2(lineSegment.y1-this.center.y,lineSegment.x1-this.center.x);
          var angle1 = Math.atan2(lineSegment.y2-this.center.y,lineSegment.x2-this.center.x);
          var angles = [angle-0.005,angle+0.005,angle1-0.005,angle1+0.005];
          for(var a=0;a<2*Math.PI;a+=Math.PI/50) {
            angles.push(a+0.1);
          }
          for(var k=0;k<angles.length;k++) {
            this.rays.push(new LineSegment(this.center.x,this.center.y,this.center.x+Math.cos(angles[k])*this.radius,this.center.y+Math.sin(angles[k])*this.radius));
          }
        }
      }
      for(var i=0;i<this.rays.length;i++) {
        var record = Infinity;
        var closest = null;
        var intersections = [];
        for(var j=0;j<shapes.length;j++) {
          for(var k=0;k<shapes[j].lines.length;k++) {
            var lineSegment = shapes[j].lines[k];
            var intersect = this.rays[i].intersect(lineSegment);
            if(intersect != false) {
              var distance = getDistance(this.center.x,this.center.y,intersect.x,intersect.y);
              if(distance < record) {
                record = distance;
                closest = intersections.length;
              }
              intersections.push(intersect);
            }
          }
        }
        if(closest == null) {
          this.outline.push({
            x: this.rays[i].x2,
            y: this.rays[i].y2,
            angle: Math.atan2(this.rays[i].y2-this.center.y,this.rays[i].x2-this.center.x)
          });
        } else {
          this.outline.push({
            x: intersections[closest].x,
            y: intersections[closest].y,
            angle: Math.atan2(intersections[closest].y-this.center.y,intersections[closest].x-this.center.x)
          });
        }
      }
      //Sort by angle
      this.outline.sort(function(a,b) {
        return a.angle - b.angle;
      });
    };
  }
return Light;
});
