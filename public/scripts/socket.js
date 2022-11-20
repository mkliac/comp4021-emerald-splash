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
            //players = JSON.parse(players);

            GamePanel.startTheGame(players);
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

    return { getSocket, connect, disconnect, enterPairUpQueue, leavePairUpQueue};
})();
