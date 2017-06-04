define(['lib/pixi.min.js','js/Bullet.js'],function(PIXI,Bullet) {
   var Tank = function(x,y,width,height,color) {
    this.x = x,
    this.y = y,
    this.width = width,
    this.height = height,
    this.acceleration = {
      x: 0.1,
      y: 0
    },
    this.velocity = {
      x: 0,
      y: 0
    },
    this.newShots = [];
    this.sprite = new PIXI.Sprite(),
    this.body = new PIXI.Sprite(),
    this.turret = new PIXI.Sprite(),
    this.barrel = new PIXI.Sprite();
    this.sprite.addChild(this.body);
    this.sprite.addChild(this.barrel);
    this.sprite.addChild(this.turret);
    this.sprite.position.set(x,y);
    this.body.anchor.set(0.5);
    this.turret.anchor.set(0.5);
    this.barrel.anchor.set(0.5,1);
    this.body.tint = 0xdddddd;
    this.barrel.tint = 0xeeeeee;
    var bodyGraphics = new PIXI.Graphics();
    bodyGraphics.beginFill(color,1);
    bodyGraphics.lineStyle(width/8,0,0.5);
    bodyGraphics.moveTo(width/8,0);
    bodyGraphics.lineTo(width*(7/8),0);
    bodyGraphics.lineTo(width,height/8);
    bodyGraphics.lineTo(width,height*(7/8));
    bodyGraphics.lineTo(width*(7/8),height);
    bodyGraphics.lineTo(width/8,height);
    bodyGraphics.lineTo(0,height*(7/8));
    bodyGraphics.lineTo(0,height/8);
    bodyGraphics.endFill();
    this.body.texture = bodyGraphics.generateTexture();
    var barrelGraphics = new PIXI.Graphics();
    barrelGraphics.beginFill(color,1);
    barrelGraphics.lineStyle(1,0,0.5);
    barrelGraphics.drawRect((width-width/8)/2,height/2,width/8,height/2);
    barrelGraphics.endFill();
    barrelGraphics.beginFill(0x440000);
    barrelGraphics.lineStyle(2,0,0.5);
    barrelGraphics.drawRect((width-width/8)/2,height/2,width/8,width/16);
    barrelGraphics.endFill();
    this.barrel.texture = barrelGraphics.generateTexture();
    var turretGraphics = new PIXI.Graphics();
    turretGraphics.beginFill(color,1);
    turretGraphics.lineStyle(2,0,0.5);
    turretGraphics.drawCircle(width/2,height/2,width/4);
    turretGraphics.endFill();
    this.turret.texture = turretGraphics.generateTexture();
  }
  Tank.prototype.shoot = function() {
      var startY = this.sprite.y + Math.sin(this.barrel.rotation - Math.PI/2) * this.body.height/2;
        var startX = this.sprite.x + Math.cos(this.barrel.rotation - Math.PI/2) * this.body.height/2;
      return new Bullet(startX,startY,this.width/16,this.barrel.rotation-Math.PI/2,50);
  }
  Tank.prototype.update = function(delta) {
    this.velocity.y = Math.max(-10,Math.min(10,this.velocity.y*0.9+this.acceleration.y));
    this.velocity.x = Math.max(-10,Math.min(10,this.velocity.x*0.9+this.acceleration.x));
    this.sprite.position.x += this.velocity.x * delta;
    this.sprite.position.y += this.velocity.y * delta;
    this.targetAngle = Math.atan2(this.velocity.y,this.velocity.x) + Math.PI/2;
    if(Math.abs(this.targetAngle-this.barrel.rotation) > 0.01) {
      if(Math.abs(this.targetAngle-this.barrel.rotation) > Math.PI) {
        if(this.targetAngle > this.barrel.rotation) {
          this.barrel.rotation -= (2*Math.PI-Math.abs(this.targetAngle - this.barrel.rotation))/5;
        } else {
          this.barrel.rotation += (2*Math.PI-Math.abs(this.targetAngle - this.barrel.rotation))/5;
        }
      } else {
        if(this.targetAngle > this.barrel.rotation) {
          this.barrel.rotation += (Math.abs(this.targetAngle - this.barrel.rotation))/5 * delta;
        } else {
          this.barrel.rotation -= (Math.abs(this.targetAngle - this.barrel.rotation))/5 * delta;
        }
      }
      if(this.barrel.rotation > 2*Math.PI) {
        this.barrel.rotation -= 2*Math.PI;
      } else if(this.barrel.rotation < 0) {
        this.barrel.rotation += 2*Math.PI;
      }
    }
    if(Math.abs(this.targetAngle-this.body.rotation) > 0.01) {
      if(Math.abs(this.barrel.rotation-this.body.rotation) > Math.PI) {
        if(this.barrel.rotation > this.body.rotation) {
          this.body.rotation -= (2*Math.PI-Math.abs(this.barrel.rotation - this.body.rotation))/10;
        } else {
          this.body.rotation += (2*Math.PI-Math.abs(this.barrel.rotation - this.body.rotation))/10;
        }
      } else {
        if(this.barrel.rotation > this.body.rotation) {
          this.body.rotation += (Math.abs(this.barrel.rotation - this.body.rotation))/10;
        } else {
          this.body.rotation -= (Math.abs(this.barrel.rotation - this.body.rotation))/10;
        }
      }
      if(this.body.rotation > 2*Math.PI) {
        this.body.rotation -= 2*Math.PI;
      } else if(this.body.rotation < 0) {
        this.body.rotation += 2*Math.PI;
      }
    }
  }
  return Tank;
});
