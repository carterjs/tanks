requirejs(['lib/pixi.min.js','js/Camera.js','js/Tank.js','js/Line.js'], function(PIXI,Camera,Tank,Line) {

  //Renderer setup
  var renderer = new PIXI.autoDetectRenderer(100,100);
  renderer.backgroundColor = 0x334422;
  //Sizing and resizing
  renderer.view.style.display = "block";
  var width = 100,
  height = 100;
  //Resize the canvas to the new window size
  var resize = function() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.resize(width,height);
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

  var tank = new Tank(100,100,85,100,0x338844);
  scene.addChild(tank.sprite);

  var enemy = new Tank(200,200,80,95,0x884433);
  scene.addChild(enemy.sprite);

  var touchpad = new PIXI.Sprite();
  touchpad.interactive = true;
  touchpad.position.set(0,0);
  touchpad.width = width;
  touchpad.height = height;
  var start = {
    x: width/2,
    y: height/2
  },
  direction = {
    x: 0,
    y: 0
  },
  lastTouch = 0;

  touchpad.on('pointerdown',function(e) {
    direction.x = e.data.global.x;
    direction.y = e.data.global.y;
    if(now - lastTouch < 250) {
      var bullet = tank.shoot();bullet.intersect(walls,2*radius);
      bullets.push(bullet);
      scene.addChild(bullet.sprite);
    }
    lastTouch = now;
  }).on('pointermove',function(e) {
    direction.x = e.data.global.x;
    direction.y = e.data.global.y;
  });
  stage.addChild(touchpad);

  var bullets = [];

  var acceleration = 0.005;

  var wallPoints = [];
  var walls = [];
  var radius = 500;
  var sides = 5;
  for(var a=0;a<=2*Math.PI;a+=2*Math.PI/sides) {
    wallPoints.push({
      x: Math.sin(a) * radius,
      y: Math.cos(a) * radius
    });
    if(wallPoints.length > 1) {
      var wall = new Line(wallPoints[wallPoints.length-2].x,wallPoints[wallPoints.length-2].y,wallPoints[wallPoints.length-1].x,wallPoints[wallPoints.length-1].y);
      scene.addChild(wall.graphics);
      walls.push(wall);
    }
  }

  function update() {

    if(!pause) {
      //Update tank
      tank.update(delta);
      tank.velocity = {x:0,y:0};
      //Update bullets
      for(var i=0;i<bullets.length;i++) {
        bullets[i].update(delta);
      }
      //Movement by touchpad
      tank.acceleration.x = (direction.x-start.x)/(width/2);
      tank.acceleration.y = (direction.y-start.y)/(height/2);
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
