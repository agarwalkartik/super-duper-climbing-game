w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight;
window.opponentPosition = null;
window.createGame = function(Connection) {
    // console.log("DOM", Connection)
    game = new Phaser.Game("100", "100", Phaser.CANVAS, document.getElementById('game_canvas'));
    var player;
    var platforms;
    var cursors;
    var background;
    var ground;
    var stars;
    var score = 0;
    var scoreText;
    var heightScale = 6;
    var leftButtonDown = false;
    var rightButtonDown = false;
    var upButtonDown = false;
    var platformDistance = 0.25 * game.height;

    function buttonDown(button) {
        if (button.id === 'left') {
            console.log("leftButtonDown")
            leftButtonDown = true;
        } else if (button.id === 'up') {
            upButtonDown = true;
        } else if (button.id === 'right') {
            console.log("rightButtonDown")
            rightButtonDown = true;
        }
        // player.body.velocity.x = 0.4 * game.width;
    }

    function buttonUp(button) {
        if (button.id === 'left') {
            leftButtonDown = false;
        } else if (button.id === 'up') {
            upButtonDown = false;
        } else if (button.id === 'right') {
            rightButtonDown = false;
        }
        // player.body.velocity.x = 0.4 * game.width;
    }

    function actionOnClick() {
        console.log("Button Clicked");
    }

    function killPlayer() {
        console.log("player killed")
        player.kill();
        Connection.sendMessage('endGame', 'iDied');
        window.result = 'loose';
        window.endGame = true
    }
    window.killOpponent = function(){
        opponent.kill();
    }
    var playState = {
        preload: function() {
            game.load.image('background', 'assets/background.png');
            game.load.image('ground', 'assets/platform.png');
            game.load.image('branch', 'assets/branch.png');
            game.load.image('star', 'assets/star.png');
            game.load.image('blue-player', 'assets/blue-player.png');
            game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
            game.load.spritesheet('button', 'assets/button.png');
        },
        create: function() {
            //  We're going to be using physics, so enable the Arcade Physics system
            game.physics.startSystem(Phaser.Physics.ARCADE);
            game.world.setBounds(0, 0, game.width, game.height * heightScale);
            //  A simple background for our game
            background = game.add.tileSprite(0, 0, game.width, game.world.height, 'background');
            // background.scale.setTo(1, heightScale)
            //  The platforms group contains the ground and the 2 ledges we can jump on
            platforms = game.add.group();
            //  We will enable physics for any object that is created in this group
            platforms.enableBody = true;
            // Here we create the ground.
            ground = game.add.sprite(0, game.world.height, 'ground');
            game.physics.arcade.enable(ground);
            ground.enableBody = true;
            //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
            ground.scale.setTo(game.width / 400, 1);
            //  This stops it from falling away when you jump on it
            ground.body.immovable = true;
            ground.fixedToCamera = true;
            ground.cameraOffset.setTo(0, game.height - 32);
            //  Now let's create two ledges
            for (var i = 0; i < 20; i++) {
                var ledge = platforms.create(0, game.world.height - platformDistance * i, 'branch');
                // ledge.scale.setTo(0.6, 1);
                ledge.body.immovable = true;
                ledge.body.checkCollision.down = false;
                ledge.body.checkCollision.left = false;
                ledge.body.checkCollision.right = false;
            }
            // ledge = platforms.create(-150, 250, 'ground');
            // ledge.body.immovable = true;
            // The player and its settings
            player = game.add.sprite(60, game.world.height - 250, 'blue-player');
            opponent = game.add.sprite(60, game.world.height - 250, 'dude');
            //  We need to enable physics on the player
            game.physics.arcade.enable(player);
            //  Player physics properties. Give the little guy a slight bounce.
            player.body.bounce.y = 0.2;
            player.body.gravity.y = 1.8 * game.height;
            player.body.collideWorldBounds = true;
            //  Our two animations, walking left and right.
            // player.animations.add('left', [0, 1, 2, 3], 10, true);
            // player.animations.add('right', [5, 6, 7, 8], 10, true);
            game.camera.follow(player);
            window.following = 'player';
            //  Our controls.
            cursors = game.input.keyboard.createCursorKeys();
            leftButton = game.add.sprite(10, game.world.height - 20, 'button');
            rightButton = game.add.sprite(80, game.world.height - 20, 'button');
            upButton = game.add.sprite(180, game.world.height - 40, 'button');
            leftButton.angle = -90;
            rightButton.angle = 90;
            // leftButton.scale.setTo(0.1, 0.4);
            // rightButton.scale.setTo(0.1, 0.4);
            // upButton.scale.setTo(0.1, 0.4);
            leftButton.inputEnabled = true;
            rightButton.inputEnabled = true;
            upButton.inputEnabled = true;
            leftButton.id = 'left'
            rightButton.id = 'right'
            upButton.id = 'up'
            leftButton.events.onInputDown.add(buttonDown);
            rightButton.events.onInputDown.add(buttonDown);
            upButton.events.onInputDown.add(buttonDown);
            leftButton.events.onInputUp.add(buttonUp);
            rightButton.events.onInputUp.add(buttonUp);
            upButton.events.onInputUp.add(buttonUp);
            // leftButton.onInputDown.add(buttonDown, 'left');
            // rightButton.onInputDown.add(buttonDown, 'right');
            // upButton.onInputDown.add(buttonDown, 'up');
            leftButton.fixedToCamera = true;
            rightButton.fixedToCamera = true;
            upButton.fixedToCamera = true;
            leftButton.cameraOffset.setTo(10, game.height - 10)
            rightButton.cameraOffset.setTo(80, game.height - 60)
            upButton.cameraOffset.setTo(game.width - 60, game.height - 50)
            
        },
        update: function() {
            //  Collide the player and the stars with the platforms
            game.physics.arcade.collide(player, platforms);
            game.physics.arcade.collide(player, ground, killPlayer);
            //  Reset the players velocity (movement)
            player.body.velocity.x = 0;
            if (cursors.left.isDown || leftButtonDown) {
                //  Move to the left
                player.body.velocity.x = -0.4 * game.width;
                // player.animations.play('left');
            } else if (cursors.right.isDown || rightButtonDown) {
                //  Move to the right
                player.body.velocity.x = 0.4 * game.width;
                // player.animations.play('right');
            } else {
                //  Stand still
                player.animations.stop();
                player.frame = 4;
            }
            //  Allow the player to jump if they are touching the ground.
            if ((cursors.up.isDown || upButtonDown) && player.body.touching.down) {
                player.body.velocity.y = -4 * platformDistance;
            }
            Connection.sendMessage('position', {
                x: (player.position.x / game.width).toFixed(4),
                y: (player.position.y / game.height).toFixed(4)
            });
            if (window.opponentPosition) {
                opponent.position.setTo(window.opponentPosition.x * game.width, window.opponentPosition.y * game.height);
                // console.log("here",window.following,window.opponentPosition.y ,player.position.y)
                if (opponent.position.y < player.position.y && window.following === 'player') {
                    // console.log("unfollow player,follow opponent")
                    window.following = 'opponent';
                    game.camera.unfollow(player);
                    game.camera.follow(opponent);
                } else if (opponent.position.y > player.position.y && window.following === 'opponent') {
                    // console.log("unfollow opponent,follow player")
                    window.following = 'player';
                    game.camera.unfollow(opponent);
                    game.camera.follow(player);
                }
            }
            if (window.endGame) {
                window.endGame = false;
                endText = game.add.text(game.world.centerX, game.world.height - game.height/2, window.result, {
                fontSize: '32px',
                fill: '#000'
            });
                endText.anchor.setTo(0.5,0.5);
            }
        }
    }
    var endState = {
        preload: function() {},
        create: function() {},
        update: function() {}
    }
    game.state.add('play', playState);
    game.state.add('end', endState);
    game.state.start('play');
}