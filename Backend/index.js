import {Lobby} from './game.js';
import {KinematicGorillaModel} from './game.js';

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

var lobby;
var game;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
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

http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});