requirejs(['lib/pixi.min.js','js/Camera.js','js/Tank.js','js/Shape.js','js/Light.js'], function(PIXI,Camera,Tank,Shape,Light) {

  //Renderer setup
  var renderer = new PIXI.autoDetectRenderer(100,100);
  renderer.backgroundColor = 0x334422;
  //Sizing and resizing
  renderer.view.style.position = "fixed";
  renderer.view.style.top = 0 + "px";
  renderer.view.style.right = 0 + "px";
  renderer.view.style.bottom = 0 + "px";
  renderer.view.style.left = 0 + "px";
  var width = 100,
  height = 100,
  scale = window.devicePixelRatio;
  //Resize the canvas to the new window size
  var resize = function() {
    width = window.innerWidth*scale;
    height = window.innerHeight*scale;
    renderer.resize(width,height);
    renderer.view.style.width = width/scale + "px";
    renderer.view.style.height = height/scale + "px";
  }
  resize();
  //List of functions called when the window is resized
  var resizeCallbacks = [resize];
  function windowResized() {
    for(var i=0;i<resizeCallbacks.length;i++) {
      resizeCallbacks[i]();
    }
  }
  window.onresize = windowResized;
  document.body.appendChild(renderer.view);
  //Stage
  var stage = new PIXI.Container();
  //Fade elements in and out
  var fadeIn = [];
  var fadeOut = [];
  //Fixed elements
  var fixed = new PIXI.Container();
  //Pause screen
  var pauseScreen = new PIXI.Container();
  var pauseText = new PIXI.Text("Game Paused",{
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xffffff
  });
  var pause = false;
  var pauseGraphics = new PIXI.Graphics();
  pauseScreen.addChild(pauseGraphics);
  pauseText.anchor.set(0.5);
  var resizePauseScreen = function() {
    if(pause) {
      if(!fadeIn.includes(pauseScreen)) {
        if(fadeOut.includes(pauseScreen)) {
          fadeOut.splice(fadeOut.indexOf(pauseScreen));
        }
        fadeIn.push(pauseScreen);
      }
      pauseText.position.set(width/2,height/2);
      pauseGraphics.clear();
      pauseGraphics.beginFill(0xaa0000,0.75);
      pauseGraphics.drawRect(0,0,width,height);
      pauseGraphics.endFill();
    } else {
      if(!fadeOut.includes(pauseScreen)) {
        if(fadeIn.includes(pauseScreen)) {
          fadeIn.splice(fadeIn.indexOf(pauseScreen));
        }
        fadeOut.push(pauseScreen);
      }
    }
  }
  pauseScreen.visible = false;
  resizeCallbacks.push(resizePauseScreen);
  pauseScreen.addChild(pauseText);
  //Keyboard input
  var keys = [/*W*/87,/*A*/65,/*S*/83,/*D*/68,/*Space*/32];
  var keysDown = [];
  function justPressed(key) {
    switch(key) {
      case 32:
      pause = !pause;
      resizePauseScreen();
      break;
    }
  }
  function readInput(e,state) {
    var key = e.which;
    if(keys.includes(key)) {
      if(keysDown.includes(key)) {
        //Key not down
        if(!state) {
          //Key was just released
          keysDown.splice(keysDown.indexOf(key),1);
        }
      } else if(state) {
        //Key was just pressed
        justPressed(key);
        keysDown.push(key);
      }
    }
  }
  window.addEventListener('keydown',function(e) {
    readInput(e,true);
  });
  window.addEventListener('keyup',function(e) {
    readInput(e,false);
  });
  //Elements affected by camera
  var scene = new PIXI.Container();
  stage.addChild(scene);
  stage.addChild(pauseScreen);

  var camera = new Camera(0,0);

  var shapes = [];
  var sides = 9;
  var radius = Math.max(width,height)/2;
  var tankHeight = (width+height)/(2*6);

  function rectPoints(x,y,width,height) {
    var points = [];
    points.push({
      x: x,
      y: y
    });
    points.push({
      x: x+width,
      y: y
    });
    points.push({
      x: x+width,
      y: y+height
    });
    points.push({
      x: x,
      y: y+height
    });
    return points;
  }

  function scew(points,range) {
    var newPoints = points;
    for(var i=0;i<points.length;i++) {
      points[i].x += (Math.random()-0.5) * range/2;
      points[i].y += (Math.random()-0.5) * range/2;
    }
    return newPoints;
  }

  var walls = new Shape(scew(rectPoints(-radius,-radius,radius*2,radius*2),radius/4),0xffffff,0.1,5,0,0.5);
  scene.addChild(walls.graphics);
  shapes.push(walls);

  var topLeft = new Shape(scew(rectPoints(-radius*(3/4),-radius*(3/4),radius/2,radius/2),radius/8),0xff0000,0.25,5,0,0.5);
  scene.addChild(topLeft.graphics);
  shapes.push(topLeft);

  var topRight = new Shape(scew(rectPoints(radius/4,-radius*(3/4),radius/2,radius/2),radius/8),0x00ff00,0.25,5,0,0.5);
  scene.addChild(topRight.graphics);
  shapes.push(topRight);

  var bottomLeft = new Shape(scew(rectPoints(-radius*(3/4),radius/4,radius/2,radius/2),radius/8),0x0000ff,0.25,5,0,0.5);
  scene.addChild(bottomLeft.graphics);
  shapes.push(bottomLeft);

  var bottomRight = new Shape(scew(rectPoints(radius/4,radius/4,radius/2,radius/2),radius/8),0xff0000,0.25,5,0,0.5);
  scene.addChild(bottomRight.graphics);
  shapes.push(bottomRight);

  var tank = new Tank(0,0,tankHeight/1.25,tankHeight,0x338844);
  scene.addChild(tank.sprite);

  var touchpad = new PIXI.Sprite();
  var touchpadGraphics = new PIXI.Graphics();
  touchpadGraphics.lineStyle(5);
  touchpadGraphics.drawRect(0,0,width,height);
  touchpad.texture = touchpadGraphics.generateTexture();
  touchpad.interactive = true;
  touchpad.anchor.set(0.5);
  var start,
  direction = {
    x: 0,
    y: 0
  },
  lastTouch = 0,
  shoot = false,
  bounces = 5;

  var setTouchpad = function() {
    touchpad.position.set(width/2,height/2);
    touchpad.width = width;
    touchpad.height = height;
  }
  setTouchpad();
  resizeCallbacks.push(setTouchpad);

  var aim = new PIXI.Graphics();
  scene.addChild(aim);

  touchpad.on('pointerdown',function(e) {
    direction.x = e.data.global.x;
    direction.y = e.data.global.y;
    if(now - lastTouch < 250) {
      shoot = true;
    }
    lastTouch = now;
  }).on('pointermove',function(e) {
    direction.x = e.data.global.x;
    direction.y = e.data.global.y;
  }).on('pointerup',function() {
    if(shoot) {
      scene.removeChild(aim.advancedGraphics);
      var bullet = tank.shoot();
      bullet.intersect(shapes,bounces,4*radius);
      bullets.push(bullet);
      scene.addChild(bullet.sprite);
      shoot = false;
    }
  });
  stage.addChild(touchpad);

  var bullets = [];

  var acceleration = 0.005;

  var min,
  max,
  bounds = new PIXI.Graphics();
  scene.addChild(bounds);

  var light = new Light(0,0,1000);
  var lightGraphics = new PIXI.Graphics();

  scene.addChild(lightGraphics);

  function update() {

    if(!pause) {

      //Light
      lightGraphics.clear();
      lightGraphics.beginFill(0xffffff,0.1);
      lightGraphics.lineStyle(1,0,1);
      for(var i=1;i<light.outline.length;i++) {
        if(i == 1) {
          lightGraphics.moveTo(light.outline[0].x,light.outline[0].y);
        }
        lightGraphics.lineTo(light.outline[i].x,light.outline[i].y);
      }
      if(light.outline.length > 1) {
        lightGraphics.lineTo(light.outline[0].x,light.outline[0].y);
      }
      lightGraphics.endFill();

      light.shine(shapes);

      if(shoot) {
        var shot = tank.shoot();
        shot.intersect(shapes,bounces,4*radius);
        scene.removeChild(aim);
        aim = shot.advancedGraphics;
        scene.addChild(aim);
      } else {
        scene.removeChild(aim);
      }

      //Update tank
      tank.update(delta);
      light.center.x = tank.sprite.x;
      light.center.y = tank.sprite.y;

      min = {
        x: Infinity,
        y: Infinity
      },
      max = {
        x: -Infinity,
        y: -Infinity
      },
      scale;


      if(tank.x < min.x) {
        min.x = tank.x;
      }
      if(tank.y < min.y) {
        min.y = tank.y;
      }
      if(tank.x > max.x) {
        max.x = tank.x;
      }
      if(tank.y > max.y) {
        max.y = tank.y;
      }

      //Update bullets
      for(var i=0;i<bullets.length;i++) {
        bullets[i].update(delta);
        if(bullets[i].active) {
          for(var j=0;j<bullets[i].intersections.length;j++) {
            if(bullets[i].sprite.x < min.x) {
              min.x = bullets[i].intersections[j].x;
            }
            if(bullets[i].sprite.y < min.y) {
              min.y = bullets[i].intersections[j].y;
            }
            if(bullets[i].sprite.x > max.x) {
              max.x = bullets[i].intersections[j].x;
            }
            if(bullets[i].sprite.y > max.y) {
              max.y = bullets[i].intersections[j].y;
            }
          }
        }
      }

      var range = Math.max(max.x-min.x,max.y-min.y);
      var calcScale = Math.max(Math.min(width,height)/(2*range),0.5);
      if(calcScale == Infinity) {
        calcScale = 1;
      }
      if(calcScale > 0.1 && calcScale < 2) {
        if(calcScale < camera.targetScale || calcScale == 1) {
          camera.targetScale = calcScale;
        }
      }

      //Movement by touchpad
      tank.acceleration.x = (direction.x-width/2)/(width/2);
      tank.acceleration.y = (direction.y-height/2)/(height/2);
    }
    //Camera
    camera.update(delta);
    camera.setTarget(tank.sprite.position.x-(width/2/camera.scale),tank.sprite.position.y-(height/2/camera.scale));
    scene.scale.set(camera.scale);
    scene.position.set(camera.offset.x*camera.scale,camera.offset.y*camera.scale);
    //Fading elements in
    for(var i=0;i<fadeIn.length;i++) {
      if('fadeProgress' in fadeIn[i]) {
        fadeIn[i].fadeProgress += delta/100;
        if(fadeIn[i].fadeProgress < 1) {
          fadeIn[i].alpha = -Math.cos(Math.PI*fadeIn[i].fadeProgress);
        } else {
          delete fadeIn[i].fadeProgress;
          fadeIn[i].alpha = 1;
          fadeIn.splice(i,1);
        }
      } else {
        //Initialize
        fadeIn[i].visible = true;
        fadeIn[i].alpha = 0;
        fadeIn[i].fadeProgress = 0;
      }
    }
    //Fading elements out
    for(var i=0;i<fadeOut.length;i++) {
      if('fadeProgress' in fadeOut[i]) {
        fadeOut[i].fadeProgress += delta/100;
        if(fadeOut[i].fadeProgress < 1) {
          fadeOut[i].alpha = Math.cos(Math.PI*fadeOut[i].fadeProgress);
        } else {
          delete fadeOut[i].fadeProgress;
          fadeOut[i].visible = false;
          fadeOut[i].alpha = 1;
          fadeOut.splice(i,1);
        }
      } else {
        //Initialize
        fadeOut[i].fadeProgress = 0;
      }
    }
  }
  var now = Date.now(),
  last = now,
  targetStep = 1000/60,
  step = targetStep,
  delta = 1;
  function loop() {
    now = Date.now();
    step = now-last;
    delta = step/targetStep;
    update(delta);
    renderer.render(stage);
    window.requestAnimationFrame(loop);
    last = now;
  }
  loop();

});
