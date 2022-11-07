class Lobby {
    constructor(gameCode) {
        this.playerIDs = [];
        this.gameCode = gameCode;
    }

    addPlayer(playerID) {
        this.playerIDs.push(playerID);
        return this.playerIDs.length > 2
    }
}

module.exports = Lobby;