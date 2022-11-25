const GamePanel = (function() {
    
    const totalGameTime = 100;
    const gemMaxAge = 3000;
    const arrowMaxAge = 2500;
    const bombMaxAge = 1500;
    const bombExplosionAge = 900;
    const fps = 60;

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

    /* Get the canvas and 2D context */
    const cv1 = $("canvas").get(0);
    const context1 = cv1.getContext("2d");
    const context1Bg = cv1.cloneNode().getContext("2d");
    const cv2 = $("canvas").get(1);
    const context2 = cv2.getContext("2d");
    /* Create the sounds */
    const sounds = {
        arrow: new Audio("resources/arrow.mp3"),
        background: new Audio("resources/game_music.mp3"),
        bomb: new Audio("resources/bomb.mp3"),
        collect: new Audio("resources/collect.mp3"),
        gameover: new Audio("resources/gameover.mp3"),
        item: new Audio("resources/collect_item.wav"),
        fire: new Audio("resources/fire.wav"),
        double: new Audio("resources/double.wav"),
        speed: new Audio("resources/speed.wav"),
        slow: new Audio("resources/slow.wav"),
        zombie: new Audio("resources/zombie.mp3"),
        shield: new Audio("resources/shield.mp3"),
        damage: new Audio("resources/damage.wav")
    };

    const objectSheet = new Image();
    objectSheet.src = "resources/object_sprites.png";

    objectSheet.onload = function(){
        context1Bg.fillStyle = "black";
        context1Bg.fillRect(0,0,600,120);
        context1Bg.strokeStyle = "gray";
        context1Bg.moveTo(0,120); context1.lineTo(600,120);
        context1Bg.lineWidth = 1;
        context1Bg.stroke();
        context1Bg.lineWidth = 5;
        context1Bg.strokeRect(100,25,75,75);
        context1Bg.strokeRect(175,25,75,75);
        context1Bg.strokeRect(250,25,75,75);

        context1Bg.drawImage(objectSheet,80,160,16,16,105,30,60,60);
        context1Bg.drawImage(objectSheet,128,48,16,16,175,30,60,60);
        context1Bg.drawImage(objectSheet,0,48,16,16,245,30,60,60);
        context1Bg.drawImage(objectSheet,192,0,16,16,20,25,60,60);
        //hp shield double
        context1Bg.drawImage(objectSheet,0,16,16,16,350,25,60,60);
        context1Bg.drawImage(objectSheet,16,0,16,16,420,25,60,60);
        context1Bg.drawImage(objectSheet,192,64,16,16,490,25,60,60);

        context1Bg.lineWidth = 1;
        context1Bg.font = '20px sans-serif';
        context1Bg.strokeText("A", 156,92);
        context1Bg.strokeText("S", 231,92);
        context1Bg.strokeText("D", 306,92);

        context1.fillStyle = "black";
        context1.strokeStyle = "gray";
        context1.lineWidth = 1;
        context1.font = '20px sans-serif';
    }

    const gameflow = function(){

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

        /* Create the game area */
        const gameArea = BoundingBox(context1, 150, 40, 560, 560);
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
                for(let sound in sounds){
                    sounds[sound].currentTime = 0;
                    sounds[sound].pause();
                }

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
            for(let i = 0; i < bombs.length; i++){
                bombs[i].update(now);
                if(bombs[i].getAge(now) > bombMaxAge){
                    bombs.splice(i, 1);
                }
            }
            for(let i = 0; i < arrows.length; i++){
                arrows[i].update(now);
                if(arrows[i].getAge(now) > arrowMaxAge){
                    arrows.splice(i, 1);
                }
            }

            if(gem.getAge(now) > gemMaxAge){
                gem.randomize(gameArea);
            } 

            /* Collect gem */
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

            /* Handle hostile item damages*/
            for(let i = 0; i < fires.length; i++){
                const {x, y} = fires[i].getXY();
                
                if(!isShield && box.isPointInBox(x, y)){
                    sounds.damage.currentTime = 0;
                    sounds.damage.play();
                    hp -= 1;
                    console.log(hp);
                    shield();
                    break;
                }
            }

            for(let i = 0; i < bombs.length; i++){
                const {x, y} = bombs[i].getXY();
                
                if(!isShield && bombs[i].getAge(now) > bombExplosionAge && box.isPointInBox(x, y)){
                    sounds.damage.currentTime = 0;
                    sounds.damage.play();
                    hp -= 1;
                    console.log(hp);
                    shield();
                    break;
                }
            }

            for(let i = 0; i < arrows.length; i++){
                const {x, y} = arrows[i].getXY();
                
                if(!isShield && box.isPointInBox(x, y)){
                    sounds.damage.currentTime = 0;
                    sounds.damage.play();
                    hp -= 1;
                    console.log(hp);
                    shield();
                    break;
                }
            }

            for(let i = 0; i < zombies.length; i++){
                const {x, y} = zombies[i].getXY();
                
                if(!isShield && box.isPointInBox(x, y)){
                    sounds.damage.currentTime = 0;
                    sounds.damage.play();
                    hp -= 1;
                    console.log(hp);
                    shield();
                    break;
                }
            }

            /* Collect item */
            for(let i = 0; i < items.length; i++){
                const {x, y} = items[i].getXY();
                
                if(box.isPointInBox(x, y)){
                    sounds.item.currentTime = 0;
                    sounds.item.play();
                    onCollectItem(items[i].getType());
                    items.splice(i, 1);
                    //clear away the taken object
                    context1Bg.clearRect(x - 12, y - 16, x + 12, y + 12);
                    break;
                }
            }

            /* Clear the screen */
            context1.clearRect(0, 0, cv1.width, cv1.height);
            context1.drawImage(context1Bg.canvas, 0,0);
            updateStatus();

            /* Draw the sprites */
            gem.draw();
            player.draw();
            for(let i = 0; i < fires.length; i++)
                fires[i].draw();
            for(let i = 0; i < bombs.length; i++)
                bombs[i].draw();
            for(let i = 0; i < arrows.length; i++)
                arrows[i].draw();
            for(let i = 0; i < zombies.length; i++){
                zombies[i].move(player.getXY());
                zombies[i].update(now);
                zombies[i].draw();
            }

            /* Process the next frame */
            Socket.setP2Canvas(cv1.toDataURL());
            setTimeout(() => {requestAnimationFrame(doFrame)}, 1000/fps);
        }
        sounds.background.volume = 0.5;
        sounds.background.play();
        /* Handle the keydown of arrow keys and spacebar */
        $(document).on("keydown", function(event) {
            switch (event.keyCode) {
                case 37: player.move(1); break;
                case 38: player.move(2); break;
                case 39: player.move(3); break;
                case 40: player.move(4); break;
                case 32: double();shield(); break; //cheat key
                case 65: 
                    if(numFire > 0) {
                        sounds.fire.currentTime = 0;
                        sounds.fire.play();
                        numFire -= 1; Socket.requestFire(player.getXY());
                    }; 
                    break;
                case 83:
                    if(numBomb > 0) {
                        sounds.bomb.currentTime = 0;
                        sounds.bomb.play();
                        numBomb -= 1; Socket.requestBomb(player.getXY());
                    };
                    break;
                case 68:
                    if(numArrow > 0) {
                        sounds.arrow.currentTime = 0;
                        sounds.arrow.play();
                        numArrow -= 1; Socket.requestArrow();
                    };
                    break;
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

        const updateStatus = function(){
            context1.fillRect(155, 28, 17, 18);
            context1.strokeText(numFire, 156,43);
            context1.fillRect(230, 28, 17, 18);
            context1.strokeText(numBomb, 231,43);
            context1.fillRect(305, 28, 17, 18);
            context1.strokeText(numArrow, 306,43);
            context1.fillRect(39,83,51,18);
            context1.strokeText(collectedGems, 40,100);
            context1.fillRect(369,83,51,18);
            context1.strokeText(hp, 370,100);
            context1.fillRect(429,83,51,18);
            if(isShield) context1.strokeText("ON", 430,100);
            else context1.strokeText("OFF", 430,100);
            context1.fillRect(499,83,51,18);
            if(isDouble) context1.strokeText("ON", 500,100);
            else context1.strokeText("OFF", 500,100);
        };
        const addItems = function(){
            if(items.length < 3){
                items.push(new Item(context1Bg,0,0,"speed"));
                items[items.length-1].randomize(gameArea);
                items[items.length-1].draw();
            }
            setTimeout(addItems, 5000);
        }
        addItems();

        const onCollectItem = function(type){
            if(type == "speed"){
                sounds.speed.currentTime = 0;
                sounds.speed.play();
                speedUp();
            }else if(type == "double"){
                sounds.double.currentTime = 0;
                sounds.double.play();
                double();
            }else if(type == "slow"){
                sounds.slow.currentTime = 0;
                sounds.slow.play();
                Socket.requestSlowDown();
            }else if(type == "shield"){
                sounds.shield.currentTime = 0;
                sounds.shield.play();
                shield();
            }else if(type == "zombie"){
                sounds.zombie.currentTime = 0;
                sounds.zombie.play();
                Socket.requestZombie();
            }else if(type == "fire"){
                numFire = Math.min(numFire+2,9);
            }else if(type == "bomb"){
                numBomb = Math.min(numBomb+1,9);
            }else if(type == "arrow"){
                numArrow = Math.min(numArrow+1,9);
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

        const addBomb = function(x,y){
            bombs.push(new Bomb(context1, x, y));
        }

        const addArrow = function(){
            let {x, y} = player.getXY()
            console.log(x)
            arrows.push(new Arrow(context1, x, 600, "up"));
            arrows.push(new Arrow(context1, 0, y, "right"));
            arrows.push(new Arrow(context1, x, 125, "down"));
            arrows.push(new Arrow(context1, 600, y, "left"));
        }

        return {setP2Canvas, setGameover, getScore,
                slowDown, addZombie, addFire, addBomb, addArrow, speedUp,
                double, shield};
    }

    return {initialize, startTheGame, show, hide,
            getOpponent, getGameControl};
})();