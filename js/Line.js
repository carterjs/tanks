define(function() {
  var Line = function(x1,y1,x2,y2) {
    this.x1 = x1,
    this.y1 = y1,
    this.x2 = x2,
    this.y2 = y2;
    this.graphics = new PIXI.Graphics(),
    this.update = function() {
      this.A = this.y2 - this.y1;
      this.B = this.x1 - this.x2;
      this.C = this.A * this.x1 + this.B * this.y1;
      this.graphics.clear();
      this.graphics.lineStyle(1);
      this.graphics.moveTo(this.x1,this.y1);
      this.graphics.lineTo(this.x2,this.y2);
    },
    this.update(),
    this.intersect = function(line) {
      var denom = (this.A*line.B - line.A*this.B);
      var x = (line.B*this.C - this.B*line.C)/denom;
      var y = (this.A*line.C - line.A*this.C)/denom;
      if(((x >= Math.min(this.x1,this.x2) && x <= Math.max(this.x1,this.x2) && x >= Math.min(line.x1,line.x2) && x <= Math.max(line.x1,line.x2)) && (y >= Math.min(this.y1,this.y2) && y <= Math.max(this.y1,this.y2) && y >= Math.min(line.y1,line.y2) && y <= Math.max(line.y1,line.y2))) && denom != 0) {
        return {
          x: x,
          y: y
        }
      } else {
        return false;
      }
    },
    this.getAngle = function() {
      return Math.atan2(this.y2-this.y1,this.x2-this.x1);
    };
  }
  return Line;
});
