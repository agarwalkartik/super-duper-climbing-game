w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight;
var addTileForSlave;
var opponentPosition;
var platformsMap;
window.createGame = function(Connection) {
    // console.log("DOM", Connection)
    game = new Phaser.Game("100", "100", Phaser.CANVAS, document.getElementById('game_canvas'), {
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
        game.load.image('star', 'assets/player.png');
        game.load.image('player', 'assets/player.png');
        game.load.image('background', 'assets/background.png');
        game.load.image('tile', 'assets/tile.png');
        game.load.image('left', 'assets/left.png');
    }
    var player;
    var role;
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
    // var platforms;
    // var timer;
    var previousPlatform;
    heightCriteria = 0.04;
    platformLengthDifficulty = 0.4;
    platformSpeed = 0.2 * game.height;
    var tileHeight = 0.3;

    function addPlatform(data) {
        previousPlatform = addTile(data.x1_offset, data.x2_offset, data.y, data.previousPlatform);
    }

    function generatePlatformPosition() {
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
        previousPlatform["x1"] = x1_offset;
        previousPlatform["y1"] = x2_offset;
        return {
            x1_offset: x1_offset,
            x2_offset: x2_offset,
            y: y,
            previousPlatform: previousPlatform
        };
    }

    function create() {
        window.ready = false;
        window.handshake = false;
        role = localStorage.role;
        //  We're going to be using physics, so enable the Arcade Physics system
        // game.stage.backgroundColor = '#5555ff';
        game.world.setBounds(0, 0, game.width, game.height);
        game.time.advancedTiming = true;
        game.physics.startSystem(Phaser.Physics.ARCADE);
        backgroundSprite = game.add.tileSprite(0, 0, game.width, 10000, 'background');
        // spikes = game.add.tileSprite(0, game.height - 96 - 100, game.width, 96, 'spikes');
        // spikes.enableBody = true;
        // game.physics.arcade.enable(spikes);
        // spikes.body.immovable = true;
        player = game.add.sprite(0, 0, 'player');
        player.enableBody = true;
        player.scale.setTo(0.2 * game.width / player.width, 0.1 * game.height / player.height);
        game.physics.arcade.enable(player);
        player.body.gravity.y = 1.8 * game.height;
        player.body.collideWorldBounds = true;
        player.body.bounce.set(0.2)
        opponent = game.add.sprite(0, 0, 'star');
        opponent.scale.setTo(0.2 * game.width / opponent.width, 0.1 * game.height / opponent.height);
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
        leftArrow.inputEnabled = true;
        leftArrow.events.onInputDown.add(function() {}, this)
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
        // spikes.bringToTop();
        if (role === 'master') {
            // generateAndRenderPlatforms();
        }
        player.bringToTop();
        // console.log("HERE",addPlatform)
        // game.camera.follow(spikes);
    }

    function generateAndRenderPlatforms() {
        var data = generatePlatformPosition();
        Connection.sendMessage('platformAdd', {
            x1_offset: (data.x1_offset / game.width).toFixed(4),
            x2_offset: (data.x2_offset / game.width).toFixed(4),
            y: (data.y / game.height).toFixed(4)
        });
        addPlatform(data);
    }

    function addTile(x1, x2, y, previousPlatform) {
        // console.log('addTile', x1, x2, y);
        platform = platforms.create(x1, y, 'tile');
        platform.scale.x = (platformLengthDifficulty * game.width) / platform.width;
        platform.checkWorldBounds = true;
        platform.body.immovable = true;
        // if (role === 'master') {
            // console.log("setting tile speed",platformSpeed * (1 / game.time.fps))
        platform.body.velocity.y = platformSpeed ;
        // }
        // console.log("VEL",platformSpeed ,game.time.fps,getDeltaTime())
        platform.body.checkCollision.down = false;
        platform.body.checkCollision.left = false;
        platform.body.checkCollision.right = false;
        platform.events.onOutOfBounds.add(function(platform) {
            if (platform.position.y > 0) {
                // console.log('killing');
                platform.destroy();
            }
        }, this);
        // if (role === 'master') {
        previousPlatform["sprite_body"] = platform;
        return previousPlatform;
        // }
    }
    addTileForSlave = addTile;

    function changeSpeed(speed) {
        platformSpeed = speed * game.height;
        for (var i = 0; i < platforms.children.length; i++) {
            platforms.children[i].body.velocity.y = platformSpeed;
        }
    }
    // function getDeltaTime(){
    //     fps = game.time.fps == 0 ? game.time.fps: 60;
    //     return (10/(fps));
    // }
    function update() {
        // spikes.body.velocity.y = 0;
        if (window.ready === false && game.time.fps !== 0) {
            console.log("i am not ready, getting ready now",game.time.fps)
            window.ready = true;
            if (window.otherUserReady === true) {
                Connection.sendMessage('handshake', 'true');
                window.handshake = true;
            } else {
                Connection.sendMessage('ready', 'true');
            }
        } else if (window.handshake === true && (window.firstTime === undefined)) {
            generateAndRenderPlatforms();
            window.firstTime = false;
        }else{
             if (previousPlatform && previousPlatform["sprite_body"] != undefined) {
            if (previousPlatform["sprite_body"].position.y > heightCriteria * game.height) {
                // if (role === 'master') {
                    generateAndRenderPlatforms()
                // }
            }
        }
        }
        if (platformsMap && platformsMap.length) {
            // plotPlatforms(platformsMap);
        }
        if (opponentPosition) {
            opponent.position.setTo(opponentPosition.x * game.width, opponentPosition.y * game.height);
        }
        if (player.position.y < 100) {
            // changeSpeed(200)
            // platformSpeed = 100;
            // timer.delay = 2000;
            // for (var i = 0; i < platforms.children.length; i++) {
            //     platforms.children[i]['body']['velocity']['y'] = platformSpeed;
            // }
            // spikes.position.y -= 1;
            // game.camera.y -= 1;   
        } else {
            // changeSpeed(50)
            // platformSpeed = 50;
            // timer.delay = 4000;
            // for (var i = 0; i < platforms.children.length; i++) {
            //     platforms.children[i]['body']['velocity']['y'] = platformSpeed;
            // }
        }
        // Connection.sendMessage('platformSpeed', platformSpeed);
        // timer.delay = 
        // backgroundSprite.tilePosition.y += 0.5;
        // game.physics.arcade.collide(player, spikes);
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
        // if (role === 'master') {
        //     var platformPositonArray = [];
        //     for (var i = 0; i < platforms.children.length; i++) {
        //         platformPositonArray.push({
        //             x: platforms.children[i].position.x / game.width,
        //             y: platforms.children[i].position.y / game.height
        //         });
        //     }
        //     // Connection.sendMessage('platformsArray', platformPositonArray);
        // }
        Connection.sendMessage('position', {
            x: (player.position.x / game.width).toFixed(4),
            y: (player.position.y / game.height).toFixed(4)
        });
        count += 0.005
        player.body.velocity.x = 0;
        if (cursors.left.isDown) {
            //  Move to the left
            player.body.velocity.x = -0.4 * game.width;
        } else if (cursors.right.isDown) {
            //  Move to the right
            player.body.velocity.x = 0.4 * game.width;
        } else {
            //  Stand still
        }
        if ( /*player.body.touching.down &&*/ cursors.up.isDown) {
            player.body.velocity.y = -1.35 * (game.height);
        }
       
    }
    plotPlatforms = function(data) {
        // for (var i = 0; i < data.length; i++) {
        //     if (platforms.children[i]) {
        //         platforms.children[i].position.x = data[i].x * game.width;
        //         platforms.children[i].position.y = data[i].y * game.height;
        //     }
        // }
    };

    function render() {
        game.debug.text(game.time.fps, 64, 32);
    }
    window.setPlayer = function(position) {
        opponentPosition = position
            // opponent.position.setTo(position.x * game.width, position.y * game.height);
    }
    window.destroyGame = function() {
        game.destroy();
    }
    window.addPlatformForSlave = function(data) {
        addTileForSlave(data.x1_offset * game.width, data.x2_offset * game.width, data.y * game.height)
    }
    window.changeSpeedForSlave = function(data) {
        changeSpeed(data);
    }
    window.plotPlatformsForSlave = function(data) {
        platformsMap = data;
        // plotPlatforms(data);
    }
}