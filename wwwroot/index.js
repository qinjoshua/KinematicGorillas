import {Lobby} from './game.js';
import {KinematicGorillaModel} from './game.js';

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

const GAME_CODE_LENGTH = 5;
var lobbies = [];
var games = [];

/*******************
 * Game init
 *******************/

function init() {

};

function genCode() {
    var arr = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var ans = '';
    for (var i = GAME_CODE_LENGTH; i > 0; i--) {
        ans += arr[Math.floor(Math.random() * arr.length)];
    }
    return ans;
}

/*******************
 * HTTP endpoints / API
 *******************/

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/lobby', (req, res) => {
    let codeAccepted = false;
    let code;

    while (codeAccepted === false) {
        code = genCode;
        let isNewCode = true;

        lobbies.forEach(lobby => {
            isNewCode = isNewCode && lobby.gameCode !== code;
        });
        
        codeAccepted = isNewCode;
    }

    lobbies.push(new Lobby(code));
    res.redirect('./' + code);
});

// Routing input for the lobby
app.get('/lobby/:gameCode', (req, res) => {
    res.sendFile(__dirname + '/game.html');
});

app.get('/game', (req, res) => {
    res.sendFile(__dirname + '/game.html');
});

app.post('/enterLobby', (req, res) => {
    if (lobby === undefined) {
        lobby = new Lobby();
    }
    
    // Once the lobby is full, the game will automatically start
    if (lobby.addPlayer(req.name)) {
        game = new KinematicGorillaModel(lobby.playerIDs);
        lobby = undefined;
        res.send(true);
    }
    else
    {
        res.send(false);               
    }
});

app.get('/gameState', (req, res) => {
    res.sendJSON(game);
});

http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});

/*******************
 * Event handlers
 *******************/

// Socket event handlers
 io.on('connection', (socket) => {
    socket.on('chat message', msg => {
        io.emit('chat message', msg);
    });

    // Starts the game
    socket.on('game start', () => {
        io.emit('game start');
    });

    socket.on('launch', launch => {
        io.emit('launch', launch);
    });

    socket.on('lost', loser => {
        io.emit('lost', loser);
    });
});

function onNewPlayer(data) {
    
};

function onBananaLaunched(data) {

};

function onWin(data) {

};