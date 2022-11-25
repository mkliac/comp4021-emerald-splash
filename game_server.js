const express = require("express");

const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const chatSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});
app.use(chatSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

// Handle the /register endpoint
app.post("/register", (req, res) => {

    const { username, name, password } = req.body;

    const users = JSON.parse(fs.readFileSync("data/users.json"));

    if(!username || !name || !password){
        res.json({status: "error", error: "Username/name/password cannot be empty."});
        return;
    }

    if(!containWordCharsOnly(username)){
        res.json({status: "error", error: "Username can only contain underscores, letters or numbers."});
        return;
    } 
    
    if(username in users){
        res.json({status: "error", error: "Username has already been used."});
        return;
    }

    const hash = bcrypt.hashSync(password, 10);
    users[username] = {name, password: hash};

    fs.writeFileSync("data/users.json", JSON.stringify(users, null, " "));

    res.json({status: "success"});

});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {

    const { username, password } = req.body;

    const users = JSON.parse(fs.readFileSync("data/users.json"));

    if(!(username in users)){
        res.json({status: "error", error: "This username is not existed."});
        return;
    }

    if(!bcrypt.compareSync(password, users[username].password)){
        res.json({status: "error", error: "Wrong password."});
        return;
    }

    const name = users[username].name;
    const user = {username,name};
    req.session.user = user;
    res.json({status: "success", user: user});

});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {

    if(!req.session.user){
        res.json({status: "error", error: "You have not signed in."});
        return;   
    }

    res.json({status: "success", user: req.session.user});
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {

    delete req.session.user;

    res.json({status: "success"});
});


//
// ***** Please insert your Lab 6 code here *****
//
const {createServer} = require("http");
const {Server} = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer);

const onlineUsers = {}
var pairUpQueue = []
const results = {}
io.use((socket, next) => {
    chatSession(socket.request, {}, next);
});

io.on("connection", (socket) => {
    if(socket.request.session.user) {
        const {username, name} = socket.request.session.user;
        onlineUsers[username] = {name};

        io.emit("add user", JSON.stringify(socket.request.session.user));
    }

    socket.on("disconnect", () => {
        if(socket.request.session.user){
            const {username} = socket.request.session.user;
            if(onlineUsers[username]) delete onlineUsers[username];

            pairUpQueue.splice(pairUpQueue.indexOf(username), 1);
            // io.emit("remove user", JSON.stringify(socket.request.session.user));
        }
    })

    socket.on("enter pair-up queue", () => {
        const {username} = socket.request.session.user;
        pairUpQueue.push(username);

        if(pairUpQueue.length >= 2){
            const players = {
                player1: pairUpQueue[0],
                player2: pairUpQueue[1]
            };

            pairUpQueue = pairUpQueue.slice(2); //remove first 2 players in the queue
            io.emit("enter the game", players);
        }
    });

    socket.on("leave pair-up queue", () => {
        const {username} = socket.request.session.user;
        pairUpQueue.splice(pairUpQueue.indexOf(username), 1);
    });

    socket.on("set canvas", (canvas) => {
        const {username} = socket.request.session.user;

        io.emit("set p2 canvas", username, canvas);
    });

    socket.on("request slow down", () => {
        const {username} = socket.request.session.user;

        io.emit("slow down", username);
    });

    socket.on("request zombie", () => {
        const {username} = socket.request.session.user;

        io.emit("add zombie", username);
    });

    socket.on("request fire", (x, y) => {
        const {username} = socket.request.session.user;

        io.emit("add fire", username, x, y);
    });

    socket.on("request bomb", (x, y) => {
        const {username} = socket.request.session.user;
        console.debug("add a bomb")

        io.emit("add bomb", username, x, y);
    });

    socket.on("end game", (opponentUsername, score) => {
        const {username} = socket.request.session.user;
        score = JSON.parse(score);

        if(!(opponentUsername in results)){
            results[username] = score;
            return;
        }
        if(results[opponentUsername] > score){
            //Todo save win & lose to record
            io.emit("win message", opponentUsername);
            io.emit("lose message", username);
        }else if(results[opponentUsername] == score){
            //Todo save win & lose to record
            io.emit("fair message", opponentUsername);
            io.emit("fair message", username);
        }else{
            //Todo save win & lose to record
            io.emit("lose message", opponentUsername);
            io.emit("win message", username);
        }

        delete results[opponentUsername];

        //Todo: update clients leaderboard
    })

});

// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("The chat server has started...");
});
