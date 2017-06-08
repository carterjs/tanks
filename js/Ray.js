define(['js/Line.js'],function(Line) {
  var Ray = function(x1,y1,x2,y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.line = new Line(x1,y1,x2,y2);
    this.intersect(seg) {
      var intersect = this.line.intersect(seg.line);
      if(intersect != false) {
        if(this.x1 >= this.x2) {
          if(intersect.x < this.x1) {
            return intersect;
          }
        } else {
          if(intersect.x > this.x1) {
            return intersect;
          }
        }
        if(this.y1 >= this.y2) {
          if(intersect.y > this.y1) {
            return intersect;
          }
        } else {
          if(intersect.y < this.y1) {
            return intersect;
          }
        }
        return false;

      } else {
        return false;
      }
    }
  }
})
