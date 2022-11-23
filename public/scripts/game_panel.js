const GamePanel = (function() {
    
    const totalGameTime = 100;
    const gemMaxAge = 3000;
    let opponent = null;
    let GameControl = null;

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

        GameControl = gameflow();

    }

    const show = function(){
        $("#game-container").show();
        currentUser = Authentication.getUser();
    }

    const hide = function(){
        $("#game-container").hide();
    }

    const getOpponent = function(){
        return opponent;
    }

    const getGameControl = function(){
        return GameControl;
    }

    const gameflow = function(){
        /* Get the canvas and 2D context */
        const cv1 = $("canvas").get(0);
        const context1 = cv1.getContext("2d");
        const cv2 = $("canvas").get(1);
        const context2 = cv2.getContext("2d");

        let collectedGems = 0;
        let gameStartTime = 0;      // The timestamp when the game starts
        let hp = 5;
        let gameover = false;

        let numFire = 0;
        let numBomb = 0;
        let numArrow = 0;

        let doubleTimeoutID = null;
        let shieldTimeoutID = null;
        let isDouble = false;
        let isShield = false;

        /* Create the sounds */
        const sounds = {
            background: new Audio("resources/background.mp3"),
            collect: new Audio("resources/collect.mp3"),
            gameover: new Audio("resources/gameover.mp3")
        };

        /* Create the game area */
        const gameArea = BoundingBox(context1, 165, 60, 420, 800);
        /* Create the sprites in the game */
        const player = Player(context1, 427, 240, gameArea); // The player
        const gem = Gem(context1, 427, 350, "green");        // The gem
        corners = gameArea.getPoints();

        let items = []
        let fires = []
        let zombies = []
        let bombs = []
        let arrows = []

        /* The main processing of the game */
        function doFrame(now) {

            if (gameStartTime == 0) gameStartTime = now;

            /* Update the time remaining */
            const gameTimeSoFar = now - gameStartTime;
            const timeRemaining = Math.ceil((totalGameTime * 1000 - gameTimeSoFar) / 1000);
            $("#time-remaining").text(timeRemaining);

            if(timeRemaining <= 0 || hp == 0) gameover = true;

            //Check Game-over
            if(gameover == true){
                sounds.collect.pause();
                sounds.background.pause();
                sounds.gameover.play();
                $("#final-gems").html(collectedGems);
                //$("#game-over").show();
                
                //Todo: ask socket send the score and opponent to server
                Socket.endGame(opponent, JSON.stringify(collectedGems));
                opponent = null;
                GameControl = null;
                return;
            }

            /* Update the sprites */
            gem.update(now);
            player.update(now);
            for(let i = 0; i < fires.length; i++)
                fires[i].update(now);

            if(gem.getAge(now) > gemMaxAge){
                gem.randomize(gameArea);
            }            

            const {x,y} = gem.getXY();
            const box = player.getBoundingBox();
            if (box.isPointInBox(x, y)) {
                sounds.collect.currentTime = 0;
                sounds.collect.play();

                if(isDouble) 
                    collectedGems += 2;
                else 
                    collectedGems++;

                gem.randomize(gameArea);
            }

            for(let i = 0; i < fires.length; i++){
                const {x, y} = fires[i].getXY();
                
                if(!isShield && box.isPointInBox(x, y)){
                    hp -= 1;
                    console.log(hp);
                    shield();
                    break;
                }
            }

            for(let i = 0; i < zombies.length; i++){
                const {x, y} = zombies[i].getXY();
                
                if(!isShield && box.isPointInBox(x, y)){
                    hp -= 1;
                    console.log(hp);
                    shield();
                    break;
                }
            }

            for(let i = 0; i < items.length; i++){
                const {x, y} = items[i].getXY();
                
                if(box.isPointInBox(x, y)){
                    onCollectItem(items[i].getType());
                    items.splice(i, 1);
                    break;
                }
            }

            /* Clear the screen */
            context1.clearRect(0, 0, cv1.width, cv1.height);
            /* Draw the sprites */
            gem.draw();
            player.draw();
            for(let i = 0; i < items.length; i++)
                items[i].draw();
            for(let i = 0; i < fires.length; i++)
                fires[i].draw();
            for(let i = 0; i < zombies.length; i++){
                zombies[i].move(player.getXY());
                zombies[i].update(now);
                zombies[i].draw();
            }

            /* Process the next frame */
            Socket.setP2Canvas(cv1.toDataURL());
            requestAnimationFrame(doFrame);
        }
        sounds.background.play();
        /* Handle the keydown of arrow keys and spacebar */
        $(document).on("keydown", function(event) {
            switch (event.keyCode) {
                case 37: player.move(1); break;
                case 38: player.move(2); break;
                case 39: player.move(3); break;
                case 40: player.move(4); break;
                case 32: double();shield(); break; //cheat key
                case 65: if(numFire > 0) {numFire -= 1; Socket.requestFire(player.getXY())}; break;
            }
        });

        /* Handle the keyup of arrow keys and spacebar */
        $(document).on("keyup", function(event) {

            switch (event.keyCode) {
                case 37: player.stop(1); break;
                case 38: player.stop(2); break;
                case 39: player.stop(3); break;
                case 40: player.stop(4); break;
            }
        });


        gem.randomize(gameArea);
        /* Start the game */
        requestAnimationFrame(doFrame);

        const addItems = function(){
            items.push(new Item(context1,0,0,"speed"));
            items[items.length-1].randomize(gameArea);

            setTimeout(addItems, 8000);
        }
        addItems();
        const onCollectItem = function(type){
            if(type == "speed"){
                speedUp();
            }else if(type == "double"){
                double();
            }else if(type == "slow"){
                Socket.requestSlowDown();
            }else if(type == "shield"){
                shield();
            }else if(type == "zombie"){
                Socket.requestZombie();
            }else if(type == "fire"){
                numFire += 3;
            }else if(type == "bomb"){
                numBomb += 1;
            }else if(type == "arrow"){
                numArrow += 1;
            }
        }
        //P2 canvas update
        const setP2Canvas = function(canvas){
            let image = new Image();
            image.onload = function() {
                context2.clearRect(0, 0, cv2.width, cv2.height);
                context2.drawImage(image,0,0);
            };
            image.src = canvas;
        }
        
        const setGameover = function(){
            gameover = true;
        }

        const getScore = function(){
            return collectedGems;
        }

        const speedUp = function(){
            player.speedUp();
        }

        const slowDown = function(){
            player.slowDown();
        }

        const double = function(){
            clearTimeout(doubleTimeoutID);
            isDouble = true;
            doubleTimeoutID = setTimeout(function() {console.log("end");isDouble=false;}, 5000);
        }

        const shield = function(){
            clearTimeout(shieldTimeoutID);
            isShield = true;
            shieldTimeoutID = setTimeout(function() {isShield=false;}, 5000);
        }

        const addZombie = function(){
            zombies.push(new Zombie(context1, 0, 0, gameArea));
            zombies[zombies.length-1].randomize(gameArea);
        }

        const addFire = function(x,y){
            fires.push(new Fire(context1, x, y));
        }

        return {setP2Canvas, setGameover, getScore,
                slowDown, addZombie, addFire, speedUp,
                double, shield};
    }

    return {initialize, startTheGame, show, hide,
            getOpponent, getGameControl};
})();