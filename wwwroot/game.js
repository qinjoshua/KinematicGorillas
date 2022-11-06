export class Lobby {
    constructor(gameCode) {
        this.playerIDs = [];
        this.gameCode = gameCode;
    }

    addPlayer(playerID) {
        this.playerIDs.push(playerID);
        return this.playerIDs.length > 2
    }
}

class KinematicGorillaModel {
    /**
     * 
     * @param {string[]} playerIDs The list of player IDs
     * @param {int} currentPlayerIndex The index in the previous list of the current active player
     */
    constructor(playerIDs, currentPlayerIndex) {
        this.buildings = this.createSkyline();
        // TODO: Turn array into Map of playerID->Gorilla
        this.gorillas = this.addGorillas(playerIDs);
        this.bananas = [];
        this.currentPlayer = playerIDs[currentPlayerIndex];
    }

    /**
     * Method to be called on every tick
     * @param {integer} dt Length of a single tick
     */
    updateOnTick(dt) {
        this.updateBanana(dt);
    }

    /**
     * Randomly generates a skyline of buildings of different heights and widths
     * @returns 
     */
    createSkyline() {
        const windowSideLength = GAME_WIDTH * WINDOW_SIDE_LENGTH_RATIO;
        var widthCovered = 0;
        var buildings = [];

        LEFT_PLAYER_OPEN_POS = [];
        RIGHT_PLAYER_OPEN_POS = [];

        while (widthCovered < GAME_WIDTH) {
            var x = getRndInteger(3, 5);
            var width = x * windowSideLength;

            var y = getRndInteger(4, 10);
            var height = y * windowSideLength;

            let buildingOrigin = new Posn(math.matrix([[widthCovered], [height]]));

            var leftThreshold = widthCovered < (GAME_WIDTH / 2 * 0.85);
            var rightThreshold = widthCovered > (GAME_WIDTH / 2 + (GAME_WIDTH / 2 * 0.15));

            if (leftThreshold) {
                LEFT_PLAYER_OPEN_POS.push(buildingOrigin);
            } else if (rightThreshold && (widthCovered + width <= GAME_WIDTH)) {
                RIGHT_PLAYER_OPEN_POS.push(new Posn(math.matrix([[buildingOrigin.getX() + width], [buildingOrigin.getY()]])));
            }

            var building = new Building(width, height, buildingOrigin);
            buildings.push(building);

            widthCovered += width;
        }

        return buildings;
    }

    // Adds Gorillas representing players to the game
    addGorillas(playerIDs) {
        var gorillas = [];

        for (var ii = 0; ii < playerIDs.length; ii++) {
            var position;
            var orientation;
            var width = GAME_WIDTH * GORILLA_WIDTH_RATIO;
            var height = GAME_HEIGHT * GORILLA_HEIGHT_RATIO;

            switch (ii % 2) {
                case 0:
                    var randomIdx = getRndInteger(0, LEFT_PLAYER_OPEN_POS.length - 1);
                    position = new Posn(math.matrix([[LEFT_PLAYER_OPEN_POS[randomIdx].getX() + width], [LEFT_PLAYER_OPEN_POS[randomIdx].getY() + height]]));
                    LEFT_PLAYER_OPEN_POS.splice(randomIdx, 1);
                    orientation = Orientation.LEFT;
                    break;
                case 1:
                    var randomIdx = getRndInteger(0, RIGHT_PLAYER_OPEN_POS.length - 1);
                    position = new Posn(math.matrix([[RIGHT_PLAYER_OPEN_POS[randomIdx].getX() - width], [RIGHT_PLAYER_OPEN_POS[randomIdx].getY() + height]]));
                    RIGHT_PLAYER_OPEN_POS.splice(randomIdx, 1);
                    orientation = Orientation.RIGHT;
                    break;
                default:
                    break;
            }

            var gorilla = new Gorilla(position, orientation, width, height, playerIDs[ii], MAX_SHOTS);
            gorillas.push(gorilla);
        }

        return gorillas;
    }

    addBanana(playerID, speed, angle) {
        for (var ii = 0; ii < this.gorillas.length; ii++) {
            if (this.gorillas[ii].playerID === playerID) {
                var gorilla = this.gorillas[ii]

                var bananaOrigin;

                switch (gorilla.orientation) {
                    case Orientation.LEFT:
                        bananaOrigin = gorilla.position;
                        break;
                    case Orientation.RIGHT:
                        bananaOrigin = new Posn(math.matrix([[gorilla.position.getX() + gorilla.width], [gorilla.position.getY()]]));
                }

                var banana = new Banana(bananaOrigin, math.matrix([[speed * Math.cos(angle * Math.PI / 180)], [speed * Math.sin(angle * Math.PI / 180)]]), gorilla);

                this.bananas.push(banana);

                return;
            }
        }
    }

    // Updates the positions of all the bananas in the model
    updateBanana(dt) {
        for (var bi = 0; bi < this.bananas.length; bi++) {
            let banana = this.bananas[bi];

            banana.velocity = math.add(banana.velocity, math.multiply(GRAVITY, dt));
            banana.position = new Posn(math.add(banana.position.getPosition(), math.multiply(banana.velocity, dt)));

            // Check for collisions
            var collided = false;

            this.buildings.forEach(building => {
                if (building.containsPoint(banana.position)) {
                    collided = true;
                }
            });

            this.gorillas.forEach(gorilla => {
                if (gorilla.containsPoint(banana.position)) {
                    console.log("collided with gorilla " + gorilla.position.getX() + " " + gorilla.position.getY());
                    gorilla.alive = false;
                    this.roundOver = true;
                    collided = true;
                }
            });

            if (banana.position.getX() > GAME_WIDTH || banana.position.getX() > GAME_WIDTH < 0) {
                collided = true;
            }

            if (collided) {
                // Trigger explosion at the position the banana was located formerly
                this.bananas[bi].gorilla.shotsLeft -= 1;
                this.bananas.splice(bi, 1);
            }
        }
    }

    // Launches a banana, if a launch has been initiated by the player
    launchBanana(playerID) {
        if (this.gorillas[0].shotsLeft > 0) {
            this.addBanana(playerID, launchSpeed, launchAngle);
            return true;
        }
        else
        {
            return false;
        }
    }
}