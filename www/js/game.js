w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight;
window.createGame = function(Connection) {
    // console.log("DOM", Connection)
    var game = new Phaser.Game("100", "100", Phaser.CANVAS, document.getElementById('game_canvas'), {
        preload: preload,
        create: create,
        update: update,
        render: render
    });
    // boot = function() {};
    // boot.prototype = {
    //     preload: function() {
    //         this.load.image('preloadbar', 'assets/preloader-bar.png');
    //     },
    //     create: function() {
    //         this.game.stage.backgroundColor = '#5555ff';
    //         this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    //         this.scale.pageAlignHorizontally = true;
    //         this.scale.pageAlignVertically = true;
    //         this.game.physics.startSystem(Phaser.Physics.ARCADE);
    //         this.state.start('Preload');
    //     }
    // };
    // game.state.add('Boot', boot);
    // game.state.start('Boot');
    function preload() {
        game.load.image('spikes', 'assets/spikes.png');
        game.load.image('star', 'assets/star.png');
        game.load.image('player', 'assets/player.png');
        game.load.image('background', 'assets/background.png');
        game.load.image('tile', 'assets/tile.png');
        game.load.image('left', 'assets/left.png');
    }
    var player;
    var cursors;
    var stars;
    var score = 0;
    var scoreText;
    var count = 0;
    var backgroundSprite;
    var spikes;
    var leftArrow;
    var rightArrow;
    var opponent;
    var platforms;
    // var timer;
    var previousPlatform;
    heightCriteria = 0.04;
    platformLengthDifficulty = 0.4;
    platformSpeed = 50;
    var tileHeight = 0.3;

    function addPlatform() {
        console.log("add platform")
        var y = -tileHeight * game.height;
        var x1_offset, x2_offset;
        if (previousPlatform == undefined) {
            previousPlatform = {
                "pos_count": -1
            };
            x1_offset = 0.1 * game.width;
            x2_offset = 0.8 * game.width;
        } else {
            var randX1_pos = Math.random();
            if (Math.abs(previousPlatform.pos_count) >= 2) {
                if (previousPlatform.pos_count < 0) {
                    randX1_pos = 1;
                } else {
                    randX1_pos = 0;
                }
            }
            if (randX1_pos < 0.5) {
                x1_offset = (Math.random() * (previousPlatform.x1 - 0)) + 0;
                if (previousPlatform.pos_count > 0) {
                    previousPlatform.pos_count = -1;
                } else {
                    previousPlatform.pos_count--;
                }
                // console.log('if', previousPlatform.x1, x1_offset);
            } else {
                x1_offset = (Math.random() * ((game.width - player.width) - previousPlatform.x1)) + previousPlatform.x1;
                if (previousPlatform.pos_count < 0) {
                    previousPlatform.pos_count = 1;
                } else {
                    previousPlatform.pos_count++;
                }
                // console.log('else', previousPlatform.x1, x1_offset);
            }
        }
        var platformLength = platformLengthDifficulty * game.width;
        x2_offset = x1_offset + platformLength;
        previousPlatform = addTile(x1_offset, x2_offset, y, previousPlatform);
        previousPlatform["x1"] = x1_offset;
        previousPlatform["y1"] = x2_offset;
    }

    function create() {
        //  We're going to be using physics, so enable the Arcade Physics system
        // game.stage.backgroundColor = '#5555ff';
        game.world.setBounds(0, 0, game.width, game.height);
        game.physics.startSystem(Phaser.Physics.ARCADE);
        backgroundSprite = game.add.tileSprite(0, 0, game.width, 10000, 'background');
        spikes = game.add.tileSprite(0, game.height - 96 - 100, game.width, 96, 'spikes');
        spikes.enableBody = true;
        game.physics.arcade.enable(spikes);
        spikes.body.immovable = true;
        player = game.add.sprite(0, 0, 'player');
        player.enableBody = true;
        game.physics.arcade.enable(player);
        player.body.gravity.y = 1000;
        player.body.collideWorldBounds = true;
        player.body.bounce.set(0.2)
        opponent = game.add.sprite(0, 0, 'star');
        // opponent.enableBody = true;
        // game.physics.arcade.enable(opponent);
        // opponent.body.gravity.y = 1000;
        leftArrow = game.add.sprite(0, game.height - 96, 'left')
        rightArrow = game.add.sprite(200, game.height - 96, 'left')
        upArrow = game.add.sprite(300, game.height - 96, 'left')
        leftArrow.scale.setTo(0.3, 0.3);
        rightArrow.scale.setTo(-0.3, 0.3);
        upArrow.scale.setTo(0.3, 0.3);
        upArrow.angle += 90;
        platforms = game.add.group();
        platforms.enableBody = true;
        //  Our controls.
        cursors = game.input.keyboard.createCursorKeys();
        game.input.addPointer();
        game.input.onTap.add(function() {
            // Connection.endGame();
            // console.log("tapped")
        });
        game.input.onHold.add(function() {
            // console.log("hold")
        });
        game.input.onDown.add(function() {
            // console.log("down")
        });
        spikes.bringToTop();
        player.bringToTop();
        addPlatform();
        // console.log("HERE",addPlatform)
        // game.camera.follow(spikes);
    }

    function addTile(x1, x2, y, previousPlatform) {
        // console.log('addTile', x1, x2, y);
        platform = platforms.create(x1, y, 'tile');
        platform.scale.x = (platformLengthDifficulty * game.width) / platform.width;
        platform.checkWorldBounds = true;
        platform.body.immovable = true;
        platform.body.velocity.y = platformSpeed;
        platform.body.checkCollision.down = false;
        platform.body.checkCollision.left = false;
        platform.body.checkCollision.right = false;
        previousPlatform["sprite_body"] = platform;
        platform.events.onOutOfBounds.add(function(platform) {
            if (platform.position.y > 0) {
                // console.log('killing');
                platform.destroy();
            }
        }, this);
        return previousPlatform;
    }

    function getPlatformTimer(gameSpeed) {
        return 4000 * gameSpeed;
    }

    function getPlatformSpeed(gameSpeed) {
        return 50 * gameSpeed;
    }

    function update() {
        // spikes.body.velocity.y = 0;
        if (player.position.y < 100) {
            console.log("speed change")
            platformSpeed = 200;
            for (var i = 0; i < platforms.children.length; i++) {
                platforms.children[i].body.velocity.y = platformSpeed;
            }
            // platformSpeed = 100;
            // timer.delay = 2000;
            // for (var i = 0; i < platforms.children.length; i++) {
            //     platforms.children[i]['body']['velocity']['y'] = platformSpeed;
            // }
            // spikes.position.y -= 1;
            // game.camera.y -= 1;   
        } else {
            platformSpeed = 50;
            for (var i = 0; i < platforms.children.length; i++) {
                platforms.children[i].body.velocity.y = platformSpeed;
            }
            // platformSpeed = 50;
            // timer.delay = 4000;
            // for (var i = 0; i < platforms.children.length; i++) {
            //     platforms.children[i]['body']['velocity']['y'] = platformSpeed;
            // }
        }
        // timer.delay = 
        // backgroundSprite.tilePosition.y += 0.5;
        game.physics.arcade.collide(player, spikes);
        // game.physics.arcade.collide(opponent, spikes);
        game.physics.arcade.collide(player, platforms)
            // game.physics.arcade.collide(player, platforms,function(){
            //     // console.log("Collide callback",player.body.touching.down);
            //     // return player.body.touching.down;
            // },function(){
            //     console.log("Process callback",player.body.touching)
            //     return player.body.touching.down;
            //     // return false;
            // });
            // game.physics.arcade.collide(opponent, platforms);
            // console.log("PLayer",player.position);
            // window.setPlayer(player.position)   
        Connection.sendMessage('position', {
            x: (player.position.x / game.width).toFixed(4),
            y: (player.position.y / game.height).toFixed(4)
        });
        count += 0.005
        player.body.velocity.x = 0;
        if (cursors.left.isDown) {
            //  Move to the left
            player.body.velocity.x = -150;
        } else if (cursors.right.isDown) {
            //  Move to the right
            player.body.velocity.x = 150;
        } else {
            //  Stand still
        }
        //  Allow the player to jump if they are touching the ground.
        if (player.body.touching.down && cursors.up.isDown) {
            player.body.velocity.y = -750;
        }
        if (previousPlatform && previousPlatform["sprite_body"] != undefined) {
            if (previousPlatform["sprite_body"].position.y > heightCriteria * game.height) {
                addPlatform();
            }
        }
    }

    function render() {
        game.debug.cameraInfo(game.camera, 32, 32);
    }
    window.setPlayer = function(position) {
        // console.log("Set player",position);
        game.add.tween(opponent).to({
            x: position.x * game.width,
            y: position.y * game.height
        }, 200, "Linear", true);
        // opponent.position.setTo(position.x*game.width,position.y*game.height );
    }
    window.destroyGame = function() {
        game.destroy();
    }
}