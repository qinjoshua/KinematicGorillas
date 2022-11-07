const ClientType = {
    ADMINISTRATOR: 0,
    PLAYER: 1
}

let playerType = ClientType.ADMINISTRATOR;
let gameCode = "poqpjwendx";
let playerList = ["Adam", "Joshua"];

document.getElementById('code').innerHTML = gameCode;

var gameButton = document.getElementById('lobby-button');
if (playerType) {
    gameButton.textContent = "LEAVE GAME";
} else {
    gameButton.textContent = "START GAME";
}
gameButton.addEventListener('click', function () {
    if (playerType) {
        window.location.href="index.html";
    } else {
        window.location.href="game.html";
    }
    
})

function addPlayersList(playersList) {
    var playersList = document.getElementById('foo');
    if (playerList.length > 0) {
        playersList.innerHTML = "";
        for (ii = 0; ii < playerList.length; ii++) {
            playersList.innerHTML += playerList[ii] + "\n\n";
        }
    }   
}

addPlayersList(playerList);