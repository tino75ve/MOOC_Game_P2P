// PDVS-LAC
// Juego para SmartPhone utilizando Acelerómetro y librería Phaser.
// Desarrollo del Ing. Laurentino Da Costa
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

    var vidas = 3;
    var nivel = 1;
    var numAst=1;
    var cantAst=1;
    var numBalas=0;
    var cantBalas=40;
    var puntuacion = 0;

    var startField;
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
    var valorMusic = 0.1;
    var fxMute = false;
    var fxUp = false;
    var fxDown = false;
    var valorFx = 0.1;

    //Inicio del PRELOAD  
    function preload() {

      //Cargar Imágenes
      game.load.image('space', 'assets/skies/deep-space.jpg');
      game.load.image('bullet', 'assets/games/asteroids/bullets.png');
      game.load.image('asteroide1', 'assets/games/asteroids/asteroid1.png');
      game.load.image('asteroide2', 'assets/games/asteroids/asteroid2.png');
      game.load.image('inicio', 'assets/skies/Inicio.png');
      game.load.image('ship', 'assets/games/asteroids/ship.png');
      game.load.spritesheet('explode', 'assets/games/asteroids/explode.png',128,128);

      //Cargar Música
      game.load.audio('tommy', 'assets/audio/tommy_in_goa.mp3');
      //Cargar Efectos
      game.load.audio('laser', 'assets/audio/SoundsEffects/shot1.wav');
      game.load.audio('explota', 'assets/audio/SoundsEffects/sentry_explode.wav');
      game.load.audio('death', 'assets/audio/SoundsEffects/player_death.wav');
      game.load.audio('nivel', 'assets/audio/SoundsEffects/pickup.wav');
      game.load.audio('blaster', 'assets/audio/SoundsEffects/blaster.mp3');
      //Cargar Botones Menú
      game.load.image('menu', 'assets/buttons/music-buttons-90x90.png', 270, 180);

    }
    //Fin del PRELOAD

    //Inicio del CREATE
    function create() {
  
        game.renderer.clearBeforeRender = false;
        game.renderer.roundPixels = true;

        // Se inicia modo arcade physics
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Se adiciona el background del Juego.
        startField = game.add.tileSprite(0, 0, game.width, game.height, 'space');

        // Cargar la música de fondo.
        music = game.add.audio('tommy');
        // Cargar los Efectos
        fx1 = game.add.audio('laser');
        fx2 = game.add.audio('explota');
        fx3 = game.add.audio('death');
        fx4 = game.add.audio('nivel');
        fx5 = game.add.audio('blaster');
        // Fijar volumen inicial de los Efectos
        fx1.volume = valorFx;
        fx2.volume = valorFx;
        fx3.volume = valorFx;
        fx4.volume = valorFx;
        fx5.volume = valorFx;
        // Reproducir la música de fondo, y ajustar volumen inicial
        music.play();
        music.volume = valorMusic;
        music.loop = true;
        
        // Crear efecto de Explosión de los Asteroides
        explosions = game.add.group();
        explosions.createMultiple(30, 'explode');
        explosions.forEach(setupAsk, this);
    
        asteroide = game.add.group();
        asteroide.enableBody = true;
        asteroide.physicsBodyType = Phaser.Physics.ARCADE;

        // Crear los Asteroides en pantalla modo aleatorio.
        createAsteroide();

        // Crear el Grupo de Balas y asignar modo ARCADE.
        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;

        //  Crear las Balas
        crearBalas();
  
        //  Crear el SPRITE del Juego
        sprite = game.add.sprite(ancho/2, alto/2, 'ship');
        sprite.anchor.set(0.5);

        // Asignar modo ARCADE al Sprite.
        game.physics.enable(sprite, Phaser.Physics.ARCADE);
        // Establecer los bordes de pantalla como fronteras del Sprite.  
        sprite.body.collideWorldBounds = true;
        sprite.body.onWorldBounds = new Phaser.Signal();

        // Ejecutar la presentación del Juego.
        presenta();
    
        // Crear etiqueta en Pantalla para ejecutar 'MENU' que ajusta Música y Efectos.
        pause_label = game.add.text(ancho - 70, alto - 30, 'Menu', { font: '24px Arial', fill: '#fff' });
        pause_label.inputEnabled = true;
        pause_label.events.onInputUp.add(function () {
            // Cuando la etiqueta 'Menu' es presionada se pausa el juego
            game.paused = true;

            // Se adiciona el menu
            menu = game.add.sprite(ancho/2, alto/2, 'menu');
            menu.anchor.setTo(0.5, 0.5);

            // Indicamos con una etiqueta nuestra selección.
            choiseLabel = game.add.text(ancho/2, alto-150, 'Click fuera del menu para continuar.', { font: '20px Arial', fill: '#fff' });
            choiseLabel.anchor.setTo(0.5, 0.5);
        });

        // Adicionamos un manejador de evento para desactivar la pausa al hacer Click fuera del menu.
        game.input.onDown.add(unpause, self);

        // Se define función que maneja en Evento Click en Menu.
        function unpause(event){
            // Solo si la pausa esta activa.
            if(game.paused){
                // Calcula las esquinas del menu.
                var x1 = ancho/2 - 270/2, x2 = ancho/2 + 270/2,
                    y1 = alto/2 - 180/2, y2 = alto/2 + 180/2;

                // Verifica si se realizó Click dentro del menu.
                if(event.x > x1 && event.x < x2 && event.y > y1 && event.y < y2 ){
                    // El 'choicemap' es un arreglo que nos ayuda a indicar la opción seleccionada.
                    var choisemap = ['musicMute', 'musicUp', 'musicDown', 'fxMute', 'fxUp', 'fxDown'];

                    // Toma las coordenadas del Click sobre el Menu.
                    var x = event.x - x1,
                        y = event.y - y1;

                    // Calculamos la opción 
                    var choise = Math.floor(x / 90) + 3*Math.floor(y / 90);

                    // Mostrar la opción seleccionada.
                    choiseLabel.text = 'Tu opción del Menu fue: ' + choisemap[choise];
                    
                    // Acorde a la opción habilitar su ejecución en el UPDATE.
                    if (choisemap[choise] === 'musicMute'){
                      musicMute = true;
                    }
                    if (choisemap[choise] === 'musicUp'){
                      musicUp = true;
                      valorMusic += 0.1;
                    }
                    if (choisemap[choise] === 'musicDown'){
                      musicDown = true;
                      if (valorMusic > 0){
                        valorMusic -= 0.1;
                      }
                    }

                    if (choisemap[choise] === 'fxMute'){
                      fxMute = true;
                    } 
                    if (choisemap[choise] === 'fxUp'){
                      fxUp = true;
                      valorFx += 0.1;
                    }
                    if (choisemap[choise] === 'fxDown'){
                      fxDown = true;
                      if (valorFx > 0){
                        valorFx -= 0.1;
                      }
                    }                    

                  }
                  else{
                    // Remover el Menu y la Etiqueta.
                    menu.destroy();
                    choiseLabel.destroy();

                    // Eliminar la pausa del Juego.
                    game.paused = false;
                  }
            }
        };
        // No aplicar la leyes Físicas sobre la rotación del Sprite.
        sprite.body.allowRotation = false;
    }
    // Fin de CREATE.

    // Inicio de UPDATE
    function update(){

        startField.tilePosition.y = (-nivel * sprite.y);
        startField.tilePosition.x = (-nivel * sprite.x);

        sprite.body.velocity.y = (velocidadY * 300);
        sprite.body.velocity.x = (velocidadX * -300);

        sprite.rotation = game.physics.arcade.angleToPointer(sprite);

        if (game.input.activePointer.isDown){
           fire();
        }
      
        game.physics.arcade.overlap(bullets, asteroide, overlapHandler, null, this);
        game.physics.arcade.collide(sprite, asteroide, collisionSprite, null, this);
        game.physics.arcade.collide(asteroide);

        if (musicMute && fxUp && musicDown){
          vidas = 999;
          musicMute = false;
          fxUp = false;
          musicDown = false;
        }        
        if (musicMute){
          music.mute = true;
          musicMute = false;
        }
        if (musicUp || musicDown){
          music.volume = valorMusic;
          musicUp = false;
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
        if (fxUp || fxDown){
          fx1.volume = valorFx;
          fx2.volume = valorFx;
          fx3.volume = valorFx;
          fx4.volume = valorFx;
          fx5.volume = valorFx;
          fxUp = false;
          fxDown = false;
        }
    }
    // Fin de UPDATE

    // Inicio RENDER
    function render(){
      game.debug.text("Puntos: " + puntuacion + " Niv: " + nivel + ' Vidas:' + vidas, 13,13);
      game.debug.text("Aster.: " + asteroide.countLiving()+ " Balas: " + numBalas, 13, alto - 17);
    }
    // Fin de RENDER

    // Función de Disparar
    function fire(){

      if (game.time.now > bulletTime)
      {
          bullet = bullets.getFirstExists(false);

          if (bullet)
          {
              bullet.reset(sprite.body.x + 16, sprite.body.y + 16);
              bullet.lifespan = 2000;
              bullet.rotation = sprite.rotation;
             
              game.physics.arcade.velocityFromRotation(sprite.rotation, 1100, bullet.body.velocity);

              bulletTime = game.time.now + 97;

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
    }

    // Función para Crear los Asteroides modo Aleatorio en Pantalla.
    function createAsteroide(){

      numAst = 2 * nivel + 4;
      cantAst = numAst;
      var y;

      for (var i = 0; i < numAst/2; i++){
                                    
            do{
                y = game.world.randomY;
            } while ( y > (alto/2 - 50));

              var c = asteroide.create(game.world.randomX, y, 'asteroide1', game.rnd.integerInRange(0, 16));
              c.name = 'ast' + i;
              c.anchor.set(0.5);
              c.body.angularVelocity = 70 + (50 * Math.round(nivel / 2)) ;
              c.body.velocity.setTo((70 + (50 * Math.round(nivel / 2))) ,-(70 + (50 * Math.round(nivel / 2))));
              c.body.collideWorldBounds = true;
              c.body.bounce.setTo(1,1);
      }

      for (var i = numAst/2; i < numAst; i++){
                       
            do{
                y = game.world.randomY;
            } while ( y < (alto/2 + 50));

              var c = asteroide.create(game.world.randomX, y, 'asteroide2', game.rnd.integerInRange(0, 16));
              c.name = 'ast' + i;
              c.anchor.set(0.5);
              c.body.angularVelocity = -(70 + (50 * Math.round(nivel / 2)));
              c.body.velocity.setTo(-(70 + (50 * Math.round(nivel / 2))),(70 + (50 * Math.round(nivel / 2))));
              c.body.collideWorldBounds = true;
              c.body.bounce.setTo(1,1);
      }
    }

    // Función para Crear las Balas
    function crearBalas(){
        
        numBalas = cantBalas +  2 * numAst ;

        bullets.createMultiple(numBalas, 'bullet');
        bullets.setAll('checkWorldBounds', true);
        bullets.setAll('outOfBoundsKill', true);
    }

    // Función de la Animación de Explosión.
    function setupAsk (ast){
      ast.anchor.x = 0.1;
      ast.anchor.y = 0.1;
      ast.animations.add('explode');
    }

    // Función del Overlap de Balas contra Asteroides
    function overlapHandler (bullets, ast) {

        var explosion = explosions.getFirstExists(false);
        explosion.reset(ast.body.x, ast.body.y);
        explosion.play('explode',30, false, true);

        ast.kill();
        puntuacion = puntuacion + 10;
        fx2.play();

        cantAst = cantAst - 1;

        if (!cantAst){
          nivel++;
          sprite.x = ancho/2;
          sprite.y = alto/2;
          crearBalas();
          vidas++;
          var msg = game.add.text(ancho/2 - 107, alto/2 - 150, '           Nivel : ' + nivel + '\n TAP para Continuar', { fontSize: '25px', fill: '#ffffff' });

          fx4.play();
          sprite.kill();
          game.input.onTap.addOnce(function(){
            msg.destroy();
            sprite.revive();
            createAsteroide();
          }
          ,this); 
/*
          game.paused = true;
          setTimeout(function(){
            game.paused = false;
            fx4.play();
            
          }, 2000); */
        }
    }

    // Función de la Colisión de Asteroides contra el Sprite.
    function collisionSprite(sprite, ast) {

        if (vidas > 1){
          sprite.tint = 0xffff00;
          game.time.events.loop(Phaser.Timer.SECOND * 1, function(){sprite.tint = 0xffffff;}, this);
          fx5.play();
          vidas--;
        }else{
          var explosion = explosions.getFirstExists(false);
          explosion.reset(sprite.body.x, sprite.body.y);
          explosion.play('explode',30, false, true);
          fx2.play();
          
          vidas = 0;
          gameOver();
        }
    }

    // Función que realiza Presentación Inicial.
    function presenta(){
      
      game.paused = true;
      logo = game.add.sprite(ancho/2 - 167, alto/2 - 125, 'inicio');

      game.input.onTap.addOnce(function(){
          logo.kill();
          game.paused = false;
          sprite.visible = true;
        }
        ,this);      
    }

    // Función que indica final del Juego.
    function gameOver(){
      
      game.add.text(31, alto/2 -150, '  Puntos: ' + puntuacion, { fontSize: '40px', fill: '#ff00ff' });    
      game.add.text(51, alto/2 -30, 'Game Over!', { fontSize: '50px', fill: '#ff0000' });
      game.add.text(ancho/2 - 110, alto/2 + 73, ' TAP para Reiniciar ', { fontSize: '25px', fill: '#ffff00' });
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
        console.log('Error en Sensores!');
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
//PDVS-LAC