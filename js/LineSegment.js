define(['js/Line.js'],function(Line) {
  var LineSegment = function(x1,y1,x2,y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.line = new Line(x1,y1,x2,y2);
    this.intersect = function(seg) {
      var intersect = this.line.intersect(seg.line);
      if(intersect != false) {
        if(((intersect.x >= Math.min(this.x1,this.x2) && intersect.x <= Math.max(this.x1,this.x2) && intersect.x >= Math.min(seg.x1,seg.x2) && intersect.x <= Math.max(seg.x1,seg.x2)) && (intersect.y >= Math.min(this.y1,this.y2) && intersect.y <= Math.max(this.y1,this.y2) && intersect.y >= Math.min(seg.y1,seg.y2) && intersect.y <= Math.max(seg.y1,seg.y2)))) {
          return intersect;
        } else {
          return false;
        }
      } else {
        return false;
      }
    };
    this.getAngle = this.line.getAngle;
  }
  return LineSegment;
})
