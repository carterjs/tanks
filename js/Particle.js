define(function() {
  var Particle = function(x,y,xv,yv,width,height,color,lifespan) {
    this.active = true;
    this.velocity = {
      x: xv,
      y: yv
    }
    this.sprite = new PIXI.Sprite();
    this.sprite.anchor.set(0.5);
    this.sprite.position.set(x,y);
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(0);
    graphics.beginFill(color);
    graphics.drawRect(x,y,width,height);
    graphics.endFill();
    this.sprite.texture = graphics.generateTexture();
    this.startTime = null;
    this.endTime = null;
    this.lifespan = lifespan;
    this.update = function(now,delta) {
      if(this.startTime != null) {
        if(now < this.endTime) {
          var percent = (now-this.startTime)/(this.endTime-this.startTime);
          this.sprite.scale.set(1-percent);
          this.sprite.alpha = (1-percent)/2;
        } else {
          this.active = false;
        }
      } else {
        //Initialize
        this.startTime = now;
        this.endTime = this.startTime + this.lifespan;
      }
      this.sprite.position.x += this.velocity.x * delta;
      this.sprite.position.y += this.velocity.y * delta;
      this.sprite.rotation += (this.velocity.x * delta)/100;
    };
  }
  return Particle;
});
