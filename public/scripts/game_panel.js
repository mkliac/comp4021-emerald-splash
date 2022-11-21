const GamePanel = (function() {
    
    const totalGameTime = 240;
    const gemMaxAge = 3000;
    let opponent = null;

    const initialize = function(){
        hide();
    };

    const startTheGame = function(players){
        currentUser = Authentication.getUser();

        if(currentUser.username != players.player1 && currentUser.username != players.player2)
            return;
   
        if(currentUser.username == players.player1) opponent = players.player2;
        else opponent = players.player1;

        MenuPanel.hide();
        StartPanel.hide();
        show();

        gameflow();
    }

    const show = function(){
        $("#game-container").show();
        currentUser = Authentication.getUser();
        console.log(currentUser.username,"start");
    }

    const hide = function(){
        $("#game-container").hide();
    }

    const gameflow = function(){
        /* Get the canvas and 2D context */
        const cv = $("canvas").get(0);
        const context = cv.getContext("2d");

        let collectedGems = 0;
        let gameStartTime = 0;      // The timestamp when the game starts
        let hp = 5;
        let numfire = 0;
        let numBomb = 0;
        let numArrow = 0;

        /* Create the sounds */
        const sounds = {
            background: new Audio("resources/background.mp3"),
            collect: new Audio("resources/collect.mp3"),
            gameover: new Audio("resources/gameover.mp3")
        };

        /* Create the game area */
        const gameArea = BoundingBox(context, 165, 60, 420, 800);

        /* Create the sprites in the game */
        const player = Player(context, 427, 240, gameArea); // The player
        const gem = Gem(context, 427, 350, "green");        // The gem
        corners = gameArea.getPoints();
        const fires = []
        const bombs = []

        /* The main processing of the game */
        function doFrame(now) {

            if (gameStartTime == 0) gameStartTime = now;

            /* Update the time remaining */
            const gameTimeSoFar = now - gameStartTime;
            const timeRemaining = Math.ceil((totalGameTime * 1000 - gameTimeSoFar) / 1000);
            $("#time-remaining").text(timeRemaining);

            if (timeRemaining <= 0){
                sounds.collect.pause();
                sounds.background.pause();
                sounds.gameover.play();
                $("#final-gems").html(collectedGems);
                $("#game-over").show();
                return;
            }

            /* Update the sprites */
            gem.update(now);
            player.update(now);

            if(gem.getAge(now) > gemMaxAge)
                gem.randomize(gameArea);

            const {x,y} = gem.getXY();
            const box = player.getBoundingBox();
            if (box.isPointInBox(x, y)) {
                sounds.collect.currentTime = 0;
                console.log("cpt");
                sounds.collect.play();
                collectedGems++;
                gem.randomize(gameArea);
            }
            /* Clear the screen */
            context.clearRect(0, 0, cv.width, cv.height);

            /* Draw the sprites */
            gem.draw();
            player.draw();
            /* Process the next frame */
            requestAnimationFrame(doFrame);
        }
        sounds.background.play();
        /* Handle the keydown of arrow keys and spacebar */
        $(document).on("keydown", function(event) {
            console.log(1);
            switch (event.keyCode) {
                case 37: player.move(1); break;
                case 38: player.move(2); break;
                case 39: player.move(3); break;
                case 40: player.move(4); break;
                case 32: player.speedUp(); break;
            }

        });

        /* Handle the keyup of arrow keys and spacebar */
        $(document).on("keyup", function(event) {

            switch (event.keyCode) {
                case 37: player.stop(1); break;
                case 38: player.stop(2); break;
                case 39: player.stop(3); break;
                case 40: player.stop(4); break;
                case 32: player.slowDown(); break;
            }

        });
        gem.randomize(gameArea);
        /* Start the game */
        requestAnimationFrame(doFrame);
    }

    return {initialize, startTheGame, show, hide};
})();