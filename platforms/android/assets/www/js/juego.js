var app={
  inicio: function(){

    velocidadX = 0;
    velocidadY = 0;
    
    alto  = document.documentElement.clientHeight;
    ancho = document.documentElement.clientWidth;
    
    app.vigilaSensores();
    app.iniciaJuego();
  },

  iniciaJuego: function(){

    var fireRate = 100;
    var nextFire = 0;
    var vidas = 3;
    var nivel = 1;
    var numAst=1;
    var cantAst=1;
    var numBalas=0;
    var cantBalas=40;
    var puntuacion = 0;

    var sprite;
    var asteroide;
    var bullet;
    var bullets;
    var bulletTime = 0;
    var explosions;

    var music;
    var fx1, fx2, fx3, fx4;
    var button;
    var musicMute = false;
    var musicUp = false;
    var musicDown = false;
    var fxMute = false;
    var fxUp = false;
    var fxDown = false;

      
    function preload() {
  
      game.load.image('space', 'assets/skies/deep-space.jpg');
      game.load.image('bullet', 'assets/games/asteroids/bullets.png');
      game.load.image('asteroide1', 'assets/games/asteroids/asteroid1.png');
      game.load.image('asteroide2', 'assets/games/asteroids/asteroid2.png');
      //game.load.image('asteroide3', 'assets/games/asteroids/asteroid3.png');
      game.load.image('ship', 'assets/games/asteroids/ship.png');
      game.load.spritesheet('explode', 'assets/games/asteroids/explode.png',128,128);
      game.load.spritesheet('rain', 'assets/skies/rain.png', 17, 17);
      //Audio
      game.load.audio('tommy', 'assets/audio/tommy_in_goa.mp3');

      game.load.audio('laser', 'assets/audio/SoundsEffects/shot1.wav');
      game.load.audio('explota', 'assets/audio/SoundsEffects/sentry_explode.wav');
      game.load.audio('death', 'assets/audio/SoundsEffects/player_death.wav');
      game.load.audio('nivel', 'assets/audio/SoundsEffects/pickup.wav');
      game.load.audio('blaster', 'assets/audio/SoundsEffects/blaster.mp3');

      game.load.image('menu', 'assets/buttons/number-buttons-90x90.png', 270, 180);

    }

    function create() {

        //  This will run in Canvas mode, so let's gain a little speed and display
        game.renderer.clearBeforeRender = false;
        game.renderer.roundPixels = true;

        //  We need arcade physics
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //  A spacey background
        game.add.tileSprite(0, 0, game.width, game.height, 'space');
/*
        var emitter = game.add.emitter(game.world.centerX, 0, 400);
        emitter.width = game.world.width;
        emitter.makeParticles('rain');

        emitter.minParticleScale = 0.1;
        emitter.maxParticleScale = 0.5;

        emitter.setYSpeed(300, 500);
        emitter.setXSpeed(-5, 5);

        emitter.minRotation = 0;
        emitter.maxRotation = 0;

        emitter.start(false, 1600, 5, 0);
*/
        music = game.add.audio('tommy');

        fx1 = game.add.audio('laser');
        fx2 = game.add.audio('explota');
        fx3 = game.add.audio('death');
        fx4 = game.add.audio('nivel');
        fx5 = game.add.audio('blaster');
        
        fx1.volume = 0.2;
        fx2.volume = 0.2;
        fx3.volume = 0.2;
        fx4.volume = 0.2;
        fx5.volume = 0.2;
        
        music.play();
        music.volume = 0.1;
        music.loop = true;
        music.muteOnPause = false;

        explosions = game.add.group();
        explosions.createMultiple(30, 'explode');
        explosions.forEach(setupAsk, this);
    
        asteroide = game.add.group();
        asteroide.enableBody = true;
        asteroide.physicsBodyType = Phaser.Physics.ARCADE;

        createAsteroide();

        //  Our ships bullets
        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;

        //  Para crear las Balas
        crearBalas();

        //  Crear el ship del Juego
        sprite = game.add.sprite(ancho/2, alto/2, 'ship');
        sprite.anchor.set(0.5);

        //  and its physics settings
        game.physics.enable(sprite, Phaser.Physics.ARCADE);

        sprite.body.collideWorldBounds = true;
        sprite.body.onWorldBounds = new Phaser.Signal();

        pause_label = game.add.text(ancho - 70, alto - 30, 'Menu', { font: '24px Arial', fill: '#fff' });
        pause_label.inputEnabled = true;
        pause_label.events.onInputUp.add(function () {
            // When the paus button is pressed, we pause the game
            game.paused = true;

            // Then add the menu
            menu = game.add.sprite(ancho/2, alto/2, 'menu');
            menu.anchor.setTo(0.5, 0.5);

            // And a label to illustrate which menu item was chosen. (This is not necessary)
            choiseLabel = game.add.text(ancho/2, alto-150, 'Click fuera del menu para continuar.', { font: '20px Arial', fill: '#fff' });
            choiseLabel.anchor.setTo(0.5, 0.5);
        });

        // Add a input listener that can help us return from being paused
        game.input.onDown.add(unpause, self);

        // And finally the method that handels the pause menu
        function unpause(event){
            // Only act if paused
            if(game.paused){
                // Calculate the corners of the menu
                var x1 = ancho/2 - 270/2, x2 = ancho/2 + 270/2,
                    y1 = alto/2 - 180/2, y2 = alto/2 + 180/2;

                // Check if the click was inside the menu
                if(event.x > x1 && event.x < x2 && event.y > y1 && event.y < y2 ){
                    // The choicemap is an array that will help us see which item was clicked
                    var choisemap = ['musicMute', 'musicUp', 'musicDown', 'fxMute', 'fxUp', 'fxDown'];

                    // Get menu local coordinates for the click
                    var x = event.x - x1,
                        y = event.y - y1;

                    // Calculate the choice 
                    var choise = Math.floor(x / 90) + 3*Math.floor(y / 90);

                    // Display the choice
                    choiseLabel.text = 'Tu opción del Menu fue: ' + choisemap[choise];

                    if (choisemap[choise] === 'musicMute'){
                      musicMute = true;
                    } 
                    if (choisemap[choise] === 'musicUp'){
                      musicUp = true;
                    }
                    if (choisemap[choise] === 'musicDown'){
                      musicDown = true;
                    }

                    if (choisemap[choise] === 'fxMute'){
                      fxMute = true;
                    } 
                    if (choisemap[choise] === 'fxUp'){
                      fxUp = true;
                    }
                    if (choisemap[choise] === 'fxDown'){
                      fxDown = true;
                    }                    

                }
                else{
                    // Remove the menu and the label
                    menu.destroy();
                    choiseLabel.destroy();

                    // Unpause the game
                    game.paused = false;
                }
            }
        };

        //  Game input
        //  Tell it we don't want physics to manage the rotation
        sprite.body.allowRotation = false;
    }

    function render(){
      game.debug.text("Score: " + puntuacion + " Niv: " + nivel + " Weap.: " + numBalas + ' Liv.:' + vidas, 12,12);
      //game.debug.text("VelX: " + velocidadX + " VelY: " + velocidadY, 12,12);
      //game.debug.spriteInfo(sprite, 32,32);
      //game.debug.text('Ast: ' + asteroide.countLiving() + ' Music Vol: ' + music.volume.toFixed(1),12,34);
      game.debug.text("Aster.: " + asteroide.countLiving(), 13, alto - 17);
    }

    function update(){
      
        sprite.body.velocity.y = (velocidadY * 300);
        sprite.body.velocity.x = (velocidadX * -300);

        sprite.rotation = game.physics.arcade.angleToPointer(sprite);

        if (game.input.activePointer.isDown){
           fire();
        }
      
        game.physics.arcade.overlap(bullets, asteroide, collisionHandler, null, this);
        game.physics.arcade.collide(sprite, asteroide, collisionSprite, null, this);

        if (musicMute){
          music.mute = true;
          musicMute = false;
        }
        if (musicUp){
          music.volume += 0.1;
          musicUp = false;
        }
        if (musicDown){
          music.volume -= 0.1;
          musicDown = false;
        }

        if (fxMute){
          fx1.mute = true;
          fx2.mute = true
          fx3.mute = true
          fx4.mute = true
          fx5.mute = true
          fxMute = false;
        }
        if (fxUp){
          fx1.volume += 0.1;
          fx2.volume += 0.1;
          fx3.volume += 0.1;
          fx4.volume += 0.1;
          fx5.volume += 0.1;
          fxUp = false;
        }
        if (fxDown){
          fx1.volume -= 0.1;
          fx2.volume -= 0.1;
          fx3.volume -= 0.1;
          fx4.volume -= 0.1;
          fx5.volume -= 0.1;
          fxDown = false;
        }        
    }

    function fire(fx){

      if (game.time.now > nextFire && bullets.countDead() > 0){
        
        nextFire = game.time.now + fireRate;
        var bullet = bullets.getFirstDead();

        bullet.reset(sprite.x -8, sprite.y -8);
        bullet.velocity

        game.physics.arcade.moveToPointer(bullet, 500);

        if (numBalas >0 ){
          numBalas--;
          fx1.play();
        }else{
          if (puntuacion > 10){
            crearBalas();
            puntuacion -=10;
          }else{
            gameOver();
          }
        }
      }
    }

    function createAsteroide(){

      numAst = nivel * 6;
      cantAst = numAst;

      for (var i = 0; i < numAst/2; i++){
            //var x;
                        
            //do{
            //    x = game.world.randomX;
            //} while ( (x < (ancho/2 + 20)) || (x > (ancho/2 -20)));

              var c = asteroide.create(game.world.randomX, game.world.randomY, 'asteroide1', game.rnd.integerInRange(0, 16));
              c.name = 'ast' + i;
              c.anchor.set(0.5);
              c.body.angularVelocity = 70 * nivel;
              c.body.velocity.setTo(70 * nivel ,-70 * nivel);
              c.body.collideWorldBounds = true;
              c.body.bounce.setTo(1,1);
            
      }

      for (var i = numAst/2; i < numAst; i++){
            //var x;
           
            //do{
            //    x = game.world.randomX;
            //} while ( (x < (ancho/2 + 20)) || (x > (ancho/2 -20)));

              var c = asteroide.create(game.world.randomX, game.world.randomY, 'asteroide2', game.rnd.integerInRange(0, 16));
              c.name = 'ast' + i;
              c.anchor.set(0.5);
              c.body.angularVelocity = -70 * nivel;
              c.body.velocity.setTo(-70 * nivel,70 * nivel);
              c.body.collideWorldBounds = true;
              c.body.bounce.setTo(1,1);
      }
    }

    function crearBalas(){
        
        numBalas = cantBalas * nivel;

        bullets.createMultiple(numBalas, 'bullet');
        bullets.setAll('checkWorldBounds', true);
        bullets.setAll('outOfBoundsKill', true);
        //bullets.velocity.setAll(600);
        
    }

    function setupAsk (ast){
      ast.anchor.x = 0.1;
      ast.anchor.y = 0.1;
      ast.animations.add('explode');
    }

    function collisionHandler (bullest, ast) {

        var explosion = explosions.getFirstExists(false);
        explosion.reset(ast.body.x, ast.body.y);
        explosion.play('explode',30, false, true);

        ast.kill();
        bullest.kill();
        puntuacion = puntuacion + 1;

        fx2.play();

        cantAst = cantAst - 1;

        if (!cantAst){
          nivel++;
          sprite.x = ancho/2;
          sprite.y = alto/2;
          createAsteroide();
          crearBalas();
          vidas++;
          fx4.play();
        }
    }

    function collisionSprite(sprite, ast) {

        if (vidas > 1){

          sprite.tint = 0xffff00;
          game.time.events.loop(Phaser.Timer.SECOND * 1, function(){sprite.tint = 0xffffff;}, this);
          fx5.play();
          vidas--;

        }else{
          
          gameOver();

        }
    }

    function presenta(){

      game.add.text(51, alto/2, 'Game Asteroide!', { fontSize: '50px', fill: '#ff0000' });
      game.add.text(ancho/2 - 110, alto/2 + 73, 'Click para Iniciar ', { fontSize: '25px', fill: '#ffff00' });
      game.input.onTap.addOnce(function(){document.location.reload(true);},this);      

    }    

    function gameOver(){
          
      game.add.text(51, alto/2, 'Game Over!', { fontSize: '50px', fill: '#ff0000' });
      game.add.text(ancho/2 - 110, alto/2 + 73, 'Click para Reiniciar ', { fontSize: '25px', fill: '#ffff00' });
      fx3.play();

      sprite.kill();

      game.input.onTap.addOnce(function(){document.location.reload(true);},this);      

    }

    var estados = { preload: preload, create: create, update: update, render: render };
    var game = new Phaser.Game(ancho, alto, Phaser.CANVAS, 'phaser',estados);
  },

  inicioX: function(){
    return app.numeroAleatorioHasta(ancho - DIAMETRO_BOLA );
  },

  inicioY: function(){
    return app.numeroAleatorioHasta(alto - DIAMETRO_BOLA );
  },

  numeroAleatorioHasta: function(limite){
    return Math.floor(Math.random() * limite);
  },

  vigilaSensores: function(){
    
    function onError() {
        console.log('onError!');
    }

    function onSuccess(datosAceleracion){
      app.detectaAgitacion(datosAceleracion);
      app.registraDireccion(datosAceleracion);
    }

    navigator.accelerometer.watchAcceleration(onSuccess, onError,{ frequency: 10 });
  },

  detectaAgitacion: function(datosAceleracion){
    var agitacionX = datosAceleracion.x > 10;
    var agitacionY = datosAceleracion.y > 10;

    if (agitacionX || agitacionY){
      setTimeout(app.recomienza, 1000);
    }
  },

  recomienza: function(){
    document.location.reload(true);
  },

  registraDireccion: function(datosAceleracion){
    velocidadX = datosAceleracion.x ;
    velocidadY = datosAceleracion.y ;
  }

};

if ('addEventListener' in document) {
    document.addEventListener('deviceready', function() {
        app.inicio();
    }, false);
}