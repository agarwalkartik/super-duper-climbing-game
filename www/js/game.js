w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight;
window.createGame = function(Connection) {
    console.log("DOM", Connection)
    var game = new Phaser.Game("100", "100", Phaser.CANVAS, document.getElementById('game_canvas'), {
        preload: preload,
        create: create,
        update: update
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
        game.load.image('player', 'assets/player.png');
        game.load.image('background', 'assets/background.png');
        game.load.image('tile', 'assets/tile.png');
    }
    var player;
    var platforms;
    var cursors;
    var stars;
    var score = 0;
    var scoreText;
    var count = 0;
    var backgroundSprite;
    var spikes;
    var tileWidth;
    var tileHeight;
    var timer;
    function create() {
        //  We're going to be using physics, so enable the Arcade Physics system
        // game.stage.backgroundColor = '#5555ff';
        game.physics.startSystem(Phaser.Physics.ARCADE);
        backgroundSprite = game.add.tileSprite(0, 0, game.width, game.height, 'background');
        spikes = game.add.tileSprite(0, game.height - 96, game.width, 96, 'spikes');
        var player = game.add.sprite(0, 0, 'player');
        player.enableBody = true;
        tileWidth = game.cache.getImage('tile').width;
        tileHeight = game.cache.getImage('tile').height;
        platforms = game.add.group();
        platforms.enableBody = true;
        platforms.createMultiple(100, 'tile');
        //  Our controls.
        cursors = game.input.keyboard.createCursorKeys();
        game.input.addPointer();
        game.input.onTap.add(function() {
            // Connection.endGame();
            console.log("tapped")
        });
        game.input.onHold.add(function() {
            console.log("hold")
        });
        game.input.onDown.add(function() {
            console.log("down")
        });
        timer = game.time.events.loop(4000, addPlatform, game);
        spikes.bringToTop();
        player.bringToTop();
    }

    function addTile(x, y) {
        var tile = platforms.getFirstDead();
        tile.reset(x, y);
        tile.body.velocity.y = 50;
        tile.body.immovable = true;
        tile.checkWorldBounds = true;
        tile.outOfBoundsKill = true;
    }

    function addPlatform(y) {
        if (typeof(y) == "undefined") {
            y = -tileHeight;
        }
        var tilesNeeded = Math.ceil(game.world.width / tileWidth);
        var hole = Math.floor(Math.random() * (tilesNeeded - 3)) + 1;
        for (var i = 0; i < tilesNeeded; i++) {
            if (i != hole && i != hole + 1) {
                addTile(i * tileWidth, y);
            }
        }
    }

    function update() {
        // console.log("PLayer",player.position);
        // window.setPlayer(player.position)   
        // Connection.sendMessage('position',{
        //     x: player.position.x,
        //     y: player.position.y
        // });
        count += 0.005
        backgroundSprite.tilePosition.y += 0.5;
    }
    window.setPlayer = function(position) {
        console.log("set player", player)
            // player.position.setTo(position.x, position.y);
    }
    window.destroyGame = function() {
        game.destroy();
    }
}