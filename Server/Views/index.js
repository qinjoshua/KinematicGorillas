/**
 * Adds the playerID to the local storage for future use.
 */
function storePlayerID() {
    console.log("This function is called");
    var nameInput = document.getElementById("name");
    if (nameInput !== null) {
        const playerID = nameInput.value;
        console.log("PlayerID: " + playerID);
        localStorage.setItem('playerID', playerID);
    } else {
        console.log("Input is null");
    }
}

document.getElementById("launch-game").addEventListener("click", storePlayerID);