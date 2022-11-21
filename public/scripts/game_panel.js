const GamePanel = (function() {
    
    const totalGameTime = 240;
    const gemMaxAge = 3000;
    let opponent = null;
    let collectedGems = 0;
    
    let numfire = 0;
    let numBomb = 0;
    let numArrow = 0;

    const initialize = function(){
        hide();
    };

    const startTheGame = function(players){
        currentUser = Authentication.getUser();

        if(currentUser.username != players.player1 && currentUser.username != players.player2)
            return;
   
        if(currentUser.username == players.player1) opponent = players.player2;
        else opponent = players.player1;

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
        
    }

    return {initialize, startTheGame, show, hide};
})();