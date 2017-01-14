w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight;
window.opponentPosition = null;
window.createGame = function(Connection) {
    // console.log("DOM", Connection)
    game = new Phaser.Game("100", "100", Phaser.CANVAS, document.getElementById('game_canvas'), {
        preload: preload,
        create: create,
        update: update,
        render: render
    });

    function preload() {
        game.load.image('background', 'assets/background.png');
        game.load.image('ground', 'assets/platform.png');
        game.load.image('star', 'assets/star.png');
        game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
        game.load.spritesheet('button', 'assets/button_sprite_sheet.png', 193, 71);
    }
    var player;
    var platforms;
    var cursors;
    var background;
    var stars;
    var score = 0;
    var scoreText;
    var heightScale = 6;

    function create() {
        //  We're going to be using physics, so enable the Arcade Physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.setBounds(0, 0, game.width, game.height * heightScale);
        //  A simple background for our game
        background = game.add.tileSprite(0, 0, game.width, game.height * heightScale, 'background');
        // background.scale.setTo(1, heightScale)
        //  The platforms group contains the ground and the 2 ledges we can jump on
        platforms = game.add.group();
        //  We will enable physics for any object that is created in this group
        platforms.enableBody = true;
        // Here we create the ground.
        var ground = platforms.create(0, game.world.height, 'ground');
        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        ground.scale.setTo(game.width / 400, 1);
        //  This stops it from falling away when you jump on it
        ground.body.immovable = true;
        ground.fixedToCamera = true;
        ground.cameraOffset.setTo(0, game.height - 32);
        //  Now let's create two ledges
        for (var i = 0; i < 20; i++) {
            var ledge = platforms.create((i % 2 === 0 ? 0 : 600), (6 - 0.1* i) * game.height, 'ground');
            ledge.scale.setTo(0.6, 1);
            ledge.body.immovable = true;
            ledge.body.checkCollision.down = false;
            ledge.body.checkCollision.left = false;
            ledge.body.checkCollision.right = false;
        }
        // ledge = platforms.create(-150, 250, 'ground');
        // ledge.body.immovable = true;
        // The player and its settings
        player = game.add.sprite(32, game.world.height - 150, 'dude');
        opponent = game.add.sprite(32, game.world.height - 150, 'dude');
        //  We need to enable physics on the player
        game.physics.arcade.enable(player);
        //  Player physics properties. Give the little guy a slight bounce.
        player.body.bounce.y = 0.2;
        player.body.gravity.y = 1.8 * game.height;
        player.body.collideWorldBounds = true;
        //  Our two animations, walking left and right.
        player.animations.add('left', [0, 1, 2, 3], 10, true);
        player.animations.add('right', [5, 6, 7, 8], 10, true);
        //  Our controls.
        cursors = game.input.keyboard.createCursorKeys();
        leftButton = game.add.sprite(20, game.world.height - 40, 'button');
        leftButton.inputEnabled = true;
        console.log(leftButton);
        rightButton = game.add.button(60, game.world.height - 40, 'button', actionOnClick, this, 2, 1, 0);
        upButton = game.add.button(180, game.world.height - 40, 'button', actionOnClick, this, 2, 1, 0);
        downButton = game.add.button(220, game.world.height - 40, 'button', actionOnClick, this, 2, 1, 0);
        leftButton.scale.setTo(0.1, 0.4);
        rightButton.scale.setTo(0.1, 0.4);
        upButton.scale.setTo(0.1, 0.4);
        downButton.scale.setTo(0.1, 0.4);
        game.camera.follow(player);
        // leftButton.onInputDown.add(left, this);
        rightButton.onInputDown.add(right, this);
        upButton.onInputDown.add(up, this);
        downButton.onInputDown.add(down, this);
        upButton.fixedToCamera = true;
        upButton.cameraOffset.setTo(180, game.height - 40)
    }

    function down() {
        player.body.velocity.x = 0.4 * game.width;
    }

    function up() {
        player.body.velocity.y = -2 * game.width;
    }

    function right() {
        player.body.velocity.x = 0.4 * game.width;
    }

    function left() {
        player.body.velocity.x = -0.4 * game.width;
    }

    function actionOnClick() {
        console.log("Button Clicked")
    }

    function update() {
        //  Collide the player and the stars with the platforms
        game.physics.arcade.collide(player, platforms);
        //  Reset the players velocity (movement)
        player.body.velocity.x = 0;
        if (cursors.left.isDown) {
            //  Move to the left
            player.body.velocity.x = -0.4 * game.width;
            player.animations.play('left');
        } else if (cursors.right.isDown) {
            //  Move to the right
            player.body.velocity.x = 0.4 * game.width;
            player.animations.play('right');
        } else {
            //  Stand still
            player.animations.stop();
            player.frame = 4;
        }
        //  Allow the player to jump if they are touching the ground.
        if (cursors.up.isDown) {
            player.body.velocity.y = -0.4 * game.height;
        }
        if (cursors.down.isDown) {
            player.body.velocity.y = 0.4 * game.height;
        }
        Connection.sendMessage('position', {
            x: (player.position.x / game.width).toFixed(4),
            y: (player.position.y / game.height).toFixed(4)
        });
        if (window.opponentPosition) {
            opponent.position.setTo(window.opponentPosition.x * game.width, window.opponentPosition.y * game.height);
            if(window.opponentPosition.y <= player.position.y && window.following === 'player'){
                console.log("unfollow player,follow opponent")
                game.camera.unfollow(player);
                game.camera.follow(opponent);
                window.following = 'player';
            }else if (window.opponentPosition.y > player.position.y && window.following === 'opponent'){
                console.log("unfollow opponent,follow player")
                window.following = 'opponent'
                game.camera.unfollow(opponent);
                game.camera.follow(player);

            }
        }

    }

    function render() {
        game.debug.text(game.time.fps, 64, 32);
    }
}