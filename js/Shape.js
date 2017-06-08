define(['js/LineSegment.js'],function(LineSegment) {
  var Shape = function(points,fill,fillAlpha,border,borderColor,borderAlpha) {
    this.lines = [];
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(fill,fillAlpha);
    this.graphics.lineStyle(border,borderColor,borderAlpha);
    if(points.length > 0) {
      this.graphics.moveTo(points[0].x,points[0].y);
    }
    for(var i=1;i<points.length;i++) {
      this.graphics.lineTo(points[i].x,points[i].y);
      this.lines.push(new LineSegment(points[i-1].x,points[i-1].y,points[i].x,points[i].y));
    }
    this.graphics.lineTo(points[0].x,points[0].y);
    this.lines.push(new LineSegment(points[points.length-1].x,points[points.length-1].y,points[0].x,points[0].y));
    this.graphics.endFill();
  }
  return Shape;
});
