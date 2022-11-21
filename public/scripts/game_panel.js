const GamePanel = (function() {
    
    const totalGameTime = 240;
    const gemMaxAge = 3000;
    let opponent = null;

    const initialize = function(){
        hide();
    };
    
    let GameControl = null;

    const startTheGame = function(players){
        currentUser = Authentication.getUser();

        if(currentUser.username != players.player1 && currentUser.username != players.player2)
            return;
   
        if(currentUser.username == players.player1) opponent = players.player2;
        else opponent = players.player1;

        MenuPanel.hide();
        StartPanel.hide();
        show();

        GameControl = gameflow();

    }

    const show = function(){
        $("#game-container").show();
        currentUser = Authentication.getUser();
        console.log(currentUser.username,"start");
    }

    const hide = function(){
        $("#game-container").hide();
    }

    const p2SetCanvas = function(user, canvas){
        if(opponent == user.username)
            GameControl.setP2Canvas(canvas);
    }

    const gameflow = function(){
        /* Get the canvas and 2D context */
        const cv1 = $("canvas").get(0);
        const context1 = cv1.getContext("2d");
        const cv2 = $("canvas").get(1);
        const context2 = cv2.getContext("2d");

        let collectedGems = [0,0];
        let gameStartTime = 0;      // The timestamp when the game starts
        let hp = [5,5];
        let numfire = [0,0];
        let numBomb = [0,0];
        let numArrow = [0,0];

        /* Create the sounds */
        const sounds = {
            background: new Audio("resources/background.mp3"),
            collect: new Audio("resources/collect.mp3"),
            gameover: new Audio("resources/gameover.mp3")
        };

        /* Create the game area */
        const gameArea1 = BoundingBox(context1, 165, 60, 420, 800);
        const gameArea2 = BoundingBox(context2, 165, 60, 420, 800);
        /* Create the sprites in the game */
        const player1 = Player(context1, 427, 240, gameArea1); // The player
        const player2 = Player(context2, 427, 240, gameArea2); // The player
        const gem1 = Gem(context1, 427, 350, "green");        // The gem
        const gem2 = Gem(context2, 427, 350, "green");        // The gem
        corners1 = gameArea1.getPoints();
        corners2 = gameArea2.getPoints();
        let fires1 = []
        let fires2 = []
        let bombs1 = []
        let bombs2 = []

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
                $("#final-gems").html(collectedGems[0]);
                $("#game-over").show();
                return;
            }

            /* Update the sprites */
            gem1.update(now);
            player1.update(now);
            //gem2.update(now);
            //player2.update(now);

            if(gem1.getAge(now) > gemMaxAge){
                gem1.randomize(gameArea1);
                //Socket.newGem(JSON.stringtify(gem1.getInfo()));
            }

            const {x,y} = gem1.getXY();
            const box = player1.getBoundingBox();
            if (box.isPointInBox(x, y)) {
                sounds.collect.currentTime = 0;
                sounds.collect.play();
                collectedGems[0]++;
                gem1.randomize(gameArea1);
                //Socket.newGem(JSON.stringtify(gem1.getInfo()));
            }
            /* Clear the screen */
            context1.clearRect(0, 0, cv1.width, cv1.height);
            //context2.clearRect(0, 0, cv2.width, cv2.height);
            /* Draw the sprites */
            gem1.draw();
            player1.draw();
            //context2.drawImage(cv1, 0,0);
            //gem2.draw();
            //player2.draw();
            /* Process the next frame */
            Socket.setP2Canvas(cv1.toDataURL());
            requestAnimationFrame(doFrame);
        }
        sounds.background.play();
        /* Handle the keydown of arrow keys and spacebar */
        $(document).on("keydown", function(event) {
            switch (event.keyCode) {
                case 37: player1.move(1); break;
                case 38: player1.move(2); break;
                case 39: player1.move(3); break;
                case 40: player1.move(4); break;
                case 32: player1.speedUp(); break;
            }

        });

        /* Handle the keyup of arrow keys and spacebar */
        $(document).on("keyup", function(event) {

            switch (event.keyCode) {
                case 37: player1.stop(1); break;
                case 38: player1.stop(2); break;
                case 39: player1.stop(3); break;
                case 40: player1.stop(4); break;
                case 32: player1.slowDown(); break;
            }

        });


        gem1.randomize(gameArea1);
        /* Start the game */
        requestAnimationFrame(doFrame);

        //P2 Control

        const setP2Canvas = function(canvas){
            let image = new Image();
            image.onload = function() {
                context2.clearRect(0, 0, cv2.width, cv2.height);
                context2.drawImage(image,0,0);
            };
            image.src = canvas;
        }
        // const p2MoveLeft = function(){
        //     player2.move(1);
        // }

        // const p2MoveUp = function(){
        //     player2.move(2);
        // }

        // const p2MoveRight = function(){
        //     player2.move(3);
        // }

        // const p2MoveDown = function(){
        //     player2.move(4);
        // }

        // const p2GenerateNewGem = function(color, x, y){
        //     gem2.setColor(color);
        //     gem2.setXY(x,y);
        // }  
        
        return {setP2Canvas};
    }

    return {initialize, startTheGame, show, hide, p2SetCanvas};
})();