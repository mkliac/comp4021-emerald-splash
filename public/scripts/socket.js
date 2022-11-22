const Socket = (function() {
    // This stores the current Socket.IO socket
    let socket = null;

    // This function gets the socket from the module
    const getSocket = function() {
        return socket;
    };

    // This function connects the server and initializes the socket
    const connect = function() {
        socket = io();

        // Wait for the socket to connect successfully
        socket.on("connect", () => {
            console.log(1);
        });

        socket.on("enter the game", (players) => {

            GamePanel.startTheGame(players);
        });

        socket.on("set p2 canvas", (username, canvas) => {
            if(username == GamePanel.getOpponent())
                GamePanel.getGameControl().setP2Canvas(canvas);
        });

        socket.on("slow down", (username) => {
            if(username == GamePanel.getOpponent())
                GamePanel.getGameControl().slowDown();
        });

        socket.on("add zombie", (username) => {
            if(username == GamePanel.getOpponent())
                GamePanel.getGameControl().addZombie();
        });

        socket.on("add fire", (username, x, y) => {
            if(username == GamePanel.getOpponent())
                GamePanel.getGameControl().addFire(x,y);
        });

        socket.on("win message", (username) => {
            if(Authentication.getUser().username == username)
                WinPanel.show();
        });

        socket.on("fair message", (username) => {
            if(Authentication.getUser().username == username)
                FairPanel.show();
        });

        socket.on("lose message", (username) => {
            if(Authentication.getUser().username == username)
                LosePanel.show();
        });

    };

    // This function disconnects the socket from the server
    const disconnect = function() {
        socket.disconnect();
        socket = null;
    };

    const enterPairUpQueue = function() {
        if(socket && socket.connected) {
            socket.emit("enter pair-up queue");
        }
    }

    const leavePairUpQueue = function() {
        if(socket && socket.connected) {
            socket.emit("leave pair-up queue");
        }
    }

    const setP2Canvas = function(canvas){
        if(socket && socket.connected){
            socket.emit("set canvas", canvas);
        }
    }

    const requestSlowDown = function(){
        if(socket && socket.connected){
            socket.emit("request slow down");
        }
    }

    const requestZombie = function(){
        if(socket && socket.connected){
            socket.emit("request zombie");
        }
    }

    const requestFire = function(XY){
        const {x, y} = XY;
        
        if(socket && socket.connected){
            socket.emit("request fire", x, y);
        }
    }

    const endGame = function(opponent, score){
        if(socket && socket.connected){
            socket.emit("end game", opponent, score);
        }
    }
    return { getSocket, connect, disconnect, enterPairUpQueue, leavePairUpQueue,
            setP2Canvas, requestSlowDown, requestZombie, requestFire, endGame};
})();
