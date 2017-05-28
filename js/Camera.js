define(function() {
  var Camera = function(x,y) {
    this.offset = {
      x: x,
      y: y
    },
    this.scale = 0.1,
    this.targetScale = 1,
    this.scaleProgress = 0;
  }
  Camera.prototype.setTarget = function(x,y) {
    this.offset.x = -x,
    this.offset.y = -y;
  }
  Camera.prototype.update = function(delta) {
    this.scale += (this.targetScale-this.scale)/10*delta;
  }
  return Camera;
});
