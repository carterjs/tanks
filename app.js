requirejs(['lib/pixi.min.js','js/Camera.js','js/Tank.js','js/Shape.js'], function(PIXI,Camera,Tank,Shape) {

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
  console.log("Device pixel ratio = " + scale);
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
      console.log(pause);
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

  var wallPoints = [];
  var shapes = [];
  var sides = 9;
  var radius = Math.max(width,height);
  var tankHeight = (width+height)/8;
  for(var a=0;a<=2*Math.PI;a+=2*Math.PI/sides) {
    wallPoints.push({
      x: Math.sin(a) * radius,
      y: Math.cos(a) * radius
    });
  }

  var walls = new Shape(wallPoints,0xffffff,0.05,3,0x000000,0.5);
  scene.addChild(walls.graphics);
  shapes.push(walls);

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
  path = [];

  var pathGraphics = new PIXI.Graphics();
  scene.addChild(pathGraphics);

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
      bullet.intersect(shapes,4*radius);
      path = new Array({x: bullet.sprite.x,y: bullet.sprite.y}).concat(bullet.intersections);
      console.log(path);
      bullets.push(bullet);
      scene.addChild(bullet.sprite);
      shoot = false;
    }
  });
  stage.addChild(touchpad);

  var bullets = [];

  var acceleration = 0.005;

  var avg,
  min,
  max;

  function update() {

    if(!pause) {

      if(shoot) {
        var shot = tank.shoot();
        shot.intersect(shapes,4*radius);
        scene.removeChild(aim);
        aim = shot.advancedGraphics;
        scene.addChild(aim);
      }

      // pathGraphics.clear();
      //
      // pathGraphics.lineStyle(50,0,0.1);
      //
      // for(var i=1;i<path.length;i++) {
      //   pathGraphics.moveTo(path[i-1].x,path[i-1].y);
      //   pathGraphics.lineTo(path[i].x,path[i].y);
      // }

      //Update tank
      tank.update(delta);

      avg = {
        x: tank.sprite.x - width/2,
        y: tank.sprite.y - height/2
      };
      min = {
        x: Infinity,
        y: Infinity
      },
      max = {
        x: -Infinity,
        y: -Infinity
      },
      scale;

      //Update bullets
      for(var i=0;i<bullets.length;i++) {
        bullets[i].update(delta);
        avg.x += bullets[i].sprite.x - width/2;
        avg.y += bullets[i].sprite.y - width/2;
        if(bullets[i].sprite.x < min.x) {
          min.x = bullets[i].sprite.x;
        }
        if(bullets[i].sprite.y < min.y) {
          min.y = bullets[i].sprite.y;
        }
        if(bullets[i].sprite.x > max.x) {
          max.x = bullets[i].sprite.x;
        }
        if(bullets[i].sprite.y > max.y) {
          max.y = bullets[i].sprite.y;
        }
      }
      avg.x *= 1/(bullets.length+1);
      avg.y *= 1/(bullets.length+1);

      range = Math.max(max.y-min.y,max.x-min.x);
      scale = Math.max(width,height)/range;
      if(Math.abs(scale) > 0.1 && Math.abs(scale) < 2) {
        //camera.targetScale = scale;
      }

      //Movement by touchpad
      tank.acceleration.x = (direction.x-width/2)/(width/2);
      tank.acceleration.y = (direction.y-height/2)/(height/2);
    }
    //Camera
    camera.update(delta);
    camera.setTarget(tank.sprite.position.x-(width/2/camera.scale),tank.sprite.position.y-(height/2/camera.scale));
    //camera.setTarget(avg.x,avg.y);
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
