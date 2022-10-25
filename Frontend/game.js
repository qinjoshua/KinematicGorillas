const GAME_WIDTH = 200;
const GAME_HEIGHT = 100;

const GORILLA_WIDTH_RATIO = 0.05;
const GORILLA_HEIGHT_RATIO = 0.1;

let LEFT_PLAYER_OPEN_POS = [];
let RIGHT_PLAYER_OPEN_POS = [];

const MAX_BUILDING_WIDTH = 5;
const MIN_BUILDING_WIDTH = 3;
const MAX_BUILDING_HEIGHT = 4;
const MIN_BUILDING_HEIGHT = 10;

const WINDOW_SIDE_LENGTH_RATIO = 0.04;

const MAX_SHOTS = 3;

const GRAVITY = math.matrix([[0], [-9.8]]);

const COLUMN_HEIGHT_WIDTH_FRACTION = 0.04;

var canvas = document.getElementById("viewport");
var CANVAS_WIDTH = canvas.width;
var CANVAS_HEIGHT = canvas.height;

var launchAngle;
var launchSpeed;
var launch = false;

function metersToPixels(meters) {
    return meters * (CANVAS_WIDTH / GAME_WIDTH);
}

class Posn {
    /**
     * @param {Matrix} vector A 2x1 matrix containing the X and Y positions of the Posn
     */
    constructor(vector) {
        this.vector = vector;
    }

    /**
     * @returns The X component of this Posn in game coordinates (meters)
     */
    getX() { return this.vector.subset(math.index(0, 0)); }

    /**
     * @returns The Y component of this Posn in game coordinates (meters)
     */
    getY() { return this.vector.subset(math.index(1, 0)); }

    /**
     * @returns The X component of this Posn in screen pixels
     */
    getPixelX() { return metersToPixels(this.getX()); }

    /**
     * @returns The Y component of this Posn in screen pixels
     */
    getPixelY() { return CANVAS_HEIGHT - metersToPixels(this.getY()); }

    /**
     * @returns Returns the vector form of this Posn
     */
    getPosition() { return this.vector; }

    toString() { return "Posn: X = " + this.getX() + " Y = " + this.getY(); }
}

class BananaFactory {
    constructor(position, velocity) {
        this.position = position;
        this.velocity = velocity;
    }

    createBanana() {

    }
}

class Banana {
    constructor(position, velocity, gorilla) {
        this.position = position;
        this.velocity = velocity;
        this.gorilla = gorilla;
    }
}

const Orientation = {
    LEFT: 0,
    RIGHT: 1
};

class Gorilla {
    constructor(position, orientation, width, height, playerID, shots) {
        this.position = position;
        this.orientation = orientation;
        this.width = width;
        this.height = height;
        this.playerID = playerID;
        this.shotsLeft = shots;
        // state: alive, banana, shooting, etc, won
        this.alive = true;
    }

    containsPoint(pointPosn) {
        return this.position.getX() <= pointPosn.getX() &&
            this.position.getY() >= pointPosn.getY() &&
            this.position.getX() + this.width >= pointPosn.getX() &&
            this.position.getY() - this.height <= pointPosn.getY();
    }
}

class Building {
    constructor(width, height, position) {
        this.width = width;
        this.height = height;
        this.position = position;
        var windowRandom = Math.floor(Math.random() * 3);
        var windowStyle = ["window-1", "window-2", "window-3"];
        this.window = windowStyle[windowRandom];
    }

    containsPoint(pointPosn) {
        return this.position.getX() <= pointPosn.getX() &&
            this.position.getY() >= pointPosn.getY() &&
            this.position.getX() + this.width >= pointPosn.getX() &&
            this.position.getY() - this.height <= pointPosn.getY();
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
        // TODO: some logic will have to change here when opponents can launch bananas too
        this.launchBanana(this.currentPlayer);
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
        if (launch) {
            launch = false;
            if (this.gorillas[0].shotsLeft > 0) {
                this.addBanana(playerID, launchSpeed, launchAngle);
            }
        }
    }
}

class RenderView {
    constructor(context) {
        this.context = context
        this.tick = 1;
        this.breatheUp = true;
        this.roundOver = false;
    }

    updateTick() {
        if (this.tick % 30 === 0) {
            this.breatheUp = !this.breatheUp;
        }

        this.tick = this.tick + 1;
    }

    renderBuilding(building) {

        let x = building.position.getPixelX();
        let y = building.position.getPixelY();
        let width = metersToPixels(building.width, CANVAS_WIDTH);
        let height = metersToPixels(building.height);
        let window = building.window;

        var imgWindow = document.getElementById(window);

        const sideRatio = WINDOW_SIDE_LENGTH_RATIO;

        this.context.drawImage(imgWindow, x, y, sideRatio * CANVAS_WIDTH, sideRatio * CANVAS_WIDTH);

        var columns = Math.ceil(width / (sideRatio * CANVAS_WIDTH));
        var rows = Math.ceil(height / (sideRatio * CANVAS_WIDTH));

        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                this.context.drawImage(imgWindow, x + column * sideRatio * CANVAS_WIDTH, y + row * sideRatio * CANVAS_WIDTH, sideRatio * CANVAS_WIDTH, sideRatio * CANVAS_WIDTH);
            }
        }
    }

    renderBanana(banana) {
        let x = banana.position.getPixelX();
        let y = banana.position.getPixelY();

        if (this.tick % 48 >= 0 && this.tick % 48 < 8) {
            var banana = document.getElementById("banana1-img");
            this.context.drawImage(banana, x, y, 0.02 * CANVAS_WIDTH, 0.05 * CANVAS_HEIGHT);
        }
        else if (this.tick % 48 >= 8 && this.tick % 48 < 16) {
            var banana = document.getElementById("banana2-img");
            this.context.drawImage(banana, x, y, 0.02 * CANVAS_WIDTH, 0.05 * CANVAS_HEIGHT);

        }
        else if (this.tick % 48 >= 16 && this.tick % 48 < 24) {
            var banana = document.getElementById("banana3-img");
            this.context.drawImage(banana, x, y, 0.02 * CANVAS_WIDTH, 0.05 * CANVAS_HEIGHT);

        }
        else if (this.tick % 48 >= 24 && this.tick % 48 < 32) {
            var banana = document.getElementById("banana4-img");
            this.context.drawImage(banana, x, y, 0.02 * CANVAS_WIDTH, 0.05 * CANVAS_HEIGHT);

        }
        else if (this.tick % 48 >= 32 && this.tick % 48 < 40) {
            var banana = document.getElementById("banana5-img");
            this.context.drawImage(banana, x, y, 0.02 * CANVAS_WIDTH, 0.05 * CANVAS_HEIGHT);

        }
        else {
            var banana = document.getElementById("banana6-img");
            this.context.drawImage(banana, x, y, 0.02 * CANVAS_WIDTH, 0.05 * CANVAS_HEIGHT);

        }
    }

    renderGorilla(gorilla, roundOver) {
        let id = gorilla.playerID;
        let x = gorilla.position.getPixelX();
        let y = gorilla.position.getPixelY();
        let orientation = gorilla.orientation;
        let width = metersToPixels(gorilla.width);
        let height = metersToPixels(gorilla.height);

        // Gorilla states
        if (roundOver) {
            if (gorilla.alive) {
                this.renderGorillaWin(x, y, orientation, width, height, id);
            } else {
                this.renderExplosion(x, y);
            }
        } else {
            this.renderGorillaBreathing(x, y, orientation, width, height, id);
        }

        // consider banana

        // if (banana) {
        //     // with certain number of ticks
        //     this.renderGorillaBanana(x, y, true, orientation, width, height);
        //     // with certain number of ticks
        //     this.renderGorillaBanana(x, y, false, orientation, width, height);
        // }
        // else {
        //     this.renderGorillaBreathing(x, y, orientation, width, height);
        // }
    }

    renderGorillaImage(x, y, orientation, width, height, upLeft, downLeft, upRight, downRight, id) {
        switch (orientation) {
            case Orientation.LEFT:
                if (this.breatheUp) {
                    this.context.drawImage(upLeft, x, y, width, height);
                }
                else {
                    this.context.drawImage(downLeft, x, y, width, height);
                }
                break;
            case Orientation.RIGHT:
                if (this.breatheUp) {
                    this.context.drawImage(upRight, x, y, width, height);
                }
                else {
                    this.context.drawImage(downRight, x, y, width, height);
                }
                break;
        }

        this.context.fillStyle = "#000000";
        this.context.font = "12px Verdana";
        this.context.fillText(id, x + CANVAS_WIDTH * 0.01, y);
    }

    renderGorillaBreathing(x, y, orientation, width, height, id) {
        var imgBreatheUpGorilla = document.getElementById("bu-img");
        var imgBreatheDownGorilla = document.getElementById("bd-img");
        var imgBreatheUpGorillaLeft = document.getElementById("bu-img-l");
        var imgBreatheDownGorillaLeft = document.getElementById("bd-img-l");

        this.renderGorillaImage(x, y, orientation, width, height, imgBreatheUpGorillaLeft, imgBreatheDownGorillaLeft, imgBreatheUpGorilla, imgBreatheDownGorilla, id);
    }

    renderGorillaWin(x, y, orientation, width, height, id) {
        var imgWinUpGorilla = document.getElementById("win1-img");
        var imgWinDownGorilla = document.getElementById("win2-img");
        var imgWinUpGorillaLeft = document.getElementById("win1-img-l");
        var imgWinDownGorillaLeft = document.getElementById("win2-img-l");

        this.renderGorillaImage(x, y, orientation, width, height, imgWinUpGorillaLeft, imgWinDownGorillaLeft, imgWinUpGorilla, imgWinDownGorilla, id);
    }

    renderGorillaBanana(x, y, withBanana, orientation, width, height) {
        var imgWithBanana = document.getElementById("wb-img");
        var imgWithoutBanana = document.getElementById("win1-img");
        var imgWithBananaLeft = document.getElementById("wb-img-l");
        var imgWithoutBananaLeft = document.getElementById("win1-img-l");

        switch (orientation) {
            case Orientation.LEFT:
                // just the image according to the boolean given
                if (withBanana) {
                    // image of gorilla holding banana
                    this.context.drawImage(imgWithBananaLeft, x, y, width, height);

                }
                else {
                    // same pos: image of gorilla without banana
                    this.context.drawImage(imgWithoutBananaLeft, x, y, width, height);
                }
                break;
            case Orientation.RIGHT:
                // just the image according to the boolean given
                if (withBanana) {
                    // image of gorilla holding banana
                    this.context.drawImage(imgWithBanana, x, y, width, height);

                }
                else {
                    // same pos: image of gorilla without banana
                    this.context.drawImage(imgWithoutBanana, x, y, width, height);
                }
                break;
        }
    }

    renderExplosion(x, y) {
        if (this.tick % 80 >= 0 && this.tick % 80 < 16) {
            var explode = document.getElementById("explosion1-img");
            this.context.drawImage(explode, x, y, 0.075 * CANVAS_WIDTH, 0.15 * CANVAS_HEIGHT);
        }
        else if (this.tick % 16 >= 8 && this.tick % 80 < 32) {
            var explode = document.getElementById("explosion2-img");
            this.context.drawImage(explode, x, y, 0.075 * CANVAS_WIDTH, 0.15 * CANVAS_HEIGHT);

        }
        else if (this.tick % 80 >= 32 && this.tick % 80 < 48) {
            var explode = document.getElementById("explosion3-img");
            this.context.drawImage(explode, x, y, 0.075 * CANVAS_WIDTH, 0.15 * CANVAS_HEIGHT);

        }
        else if (this.tick % 80 >= 48 && this.tick % 80 < 64) {
            var explode = document.getElementById("explosion4-img");
            this.context.drawImage(explode, x, y, 0.075 * CANVAS_WIDTH, 0.15 * CANVAS_HEIGHT);

        }
        else {
            var explode = document.getElementById("explosion5-img");
            this.context.drawImage(explode, x, y, 0.075 * CANVAS_WIDTH, 0.15 * CANVAS_HEIGHT);

        }

    }

    renderMeasuringRuler(startPos, endPos) {
        this.context.lineWidth = 2;
        this.context.moveTo(startPos.getX(), startPos.getY());
        this.context.lineTo(endPos.getX(), endPos.getY());
        this.context.strokeStyle = "red";
        this.context.stroke();
    }

    renderCoordinates(startPos, endPos, width) {
        this.context.font = "bold 30px Georgia";
        this.context.fillStyle = "black";
        this.context.fillText("(" + Math.round(startPos.getX() * GAME_WIDTH / width) + ", " + Math.round(startPos.getY() * GAME_WIDTH / width) + ")", startPos.getX() - 50, startPos.getY(), 50);
        this.context.fillText("(" + Math.round(endPos.getX() * GAME_WIDTH / width) + ", " + Math.round(endPos.getY() * GAME_WIDTH / width) + ")", endPos.getX(), endPos.getY(), 50);
    }

    renderPlayerID(canvasWidth, canvasHeight) {
        this.context.font = "bold 20px Georgia";
        this.context.fillStyle = "red";
        this.context.fillText("Player: GorillaMatics", 50, 50, 150);
    }

    renderBananaAttempts(shotsLeft) {
        if (shotsLeft >= 1) {
            this.context.drawImage(document.getElementById("banana1-img"), 60, 60, 0.02 * CANVAS_WIDTH, 0.05 * CANVAS_HEIGHT);
        }
        if (shotsLeft >= 2) {
            this.context.drawImage(document.getElementById("banana1-img"), 80, 60, 0.02 * CANVAS_WIDTH, 0.05 * CANVAS_HEIGHT);
        }
        if (shotsLeft === 3) {
            this.context.drawImage(document.getElementById("banana1-img"), 100, 60, 0.02 * CANVAS_WIDTH, 0.05 * CANVAS_HEIGHT);
        }
    }
}

const ArrowEdge = {
    TOP_RIGHT: 0,
    BOTTOM_RIGHT: 1,
    BOTTOM_LEFT: 2,
    TOP_LEFT: 3
}

class MeasuringRuler {
    constructor() {
        this.startPos = null;
        this.endPos = null;
        this.drawRuler = false;
    }

    getHorizontalDistance(width) {
        if (this.drawRuler) {
            return Math.round(Math.abs(this.startPos.getX() - this.endPos.getX()) * GAME_WIDTH / width);
        }
    }
}

/**
 * Generates a random integer between min and max (included)
 * @param {Number} min 
 * @param {Number} max 
 * @returns Random integer
 */
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function distanceBetweenTwoPoints(pos1, pos2) {
    let x = pos2.getX() - pos1.getX();
    let y = pos2.getY() - pos1.getY();

    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

window.onload = function () {
    // Get the canvas and context
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");
    var model = new KinematicGorillaModel([localStorage.getItem("playerID"), "CPU"], 0);
    var measuringRuler = new MeasuringRuler();

    function resize() {
        var launchForm = document.getElementById("launch-form");
        CANVAS_WIDTH = window.innerWidth;
        CANVAS_HEIGHT = document.documentElement.clientHeight - launchForm.clientHeight;
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
    }

    resize();
    window.onresize = resize;

    // Timing and frames per second
    var lastframe = 0;
    var fpstime = 0;
    var framecount = 0;
    var fps = 0;
    // render view
    var view = new RenderView(context);

    // Initialize the game
    function init() {
        // render initial background here (gorillas and buildings)


        // Enter main loop
        main(0);
    }

    // Main loop
    function main(tframe) {
        // Request animation frames
        window.requestAnimationFrame(main);

        // Update and render the game
        update(tframe);
        render();
    }

    // Update the game state
    function update(tframe) {
        var dt = (tframe - lastframe) / 1000;
        lastframe = tframe;

        // Update the Kinematic Gorillas model on tick
        model.updateOnTick(dt);

        // Update the fps counter
        updateFps(dt);
    }

    // Used exclusively to update the fps counter
    function updateFps(dt) {
        if (fpstime > 0.25) {
            // Calculate fps
            fps = Math.round(framecount / fpstime);

            // Reset time and framecount
            fpstime = 0;
            framecount = 0;
        }

        // Increase time and framecount
        fpstime += dt;
        framecount++;
    }

    // Render the game
    function render() {
        // Draw the frame
        drawFrame();
    }

    function drawFrame() {

        var imgBackground = document.getElementById("background");

        // Draw background and a border
        context.fillStyle = "#67d8da";
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        context.fillStyle = "#67d8da";
        context.fillRect(1, 1, CANVAS_WIDTH - 2, CANVAS_HEIGHT - 2);
        context.drawImage(imgBackground, 0, CANVAS_HEIGHT - (CANVAS_WIDTH * (imgBackground.height / imgBackground.width)), CANVAS_WIDTH, CANVAS_WIDTH * (imgBackground.height / imgBackground.width));

        // Display fps - for debugging purposes
        // context.fillStyle = "#ffffff";
        // context.font = "12px Verdana";
        //context.fillText("Fps: " + fps, 13, 70);

        for (var ii = 0; ii < model.gorillas.length; ii++) {
            view.renderGorilla(model.gorillas[ii], model.roundOver);
        }
        view.updateTick();

        for (var ii = 0; ii < model.buildings.length; ii++) {
            view.renderBuilding(model.buildings[ii]);
        }

        for (var ii = 0; ii < model.bananas.length; ii++) {
            view.renderBanana(model.bananas[ii]);
        }

        if (measuringRuler.drawRuler) {
            console.log(measuringRuler.startPos.toString());
            view.renderMeasuringRuler(measuringRuler.startPos, measuringRuler.endPos);
            view.renderCoordinates(measuringRuler.startPos, measuringRuler.endPos, CANVAS_WIDTH);
        }

        view.renderPlayerID(CANVAS_WIDTH, CANVAS_HEIGHT);
        view.renderBananaAttempts(model.gorillas[0].shotsLeft);
    }

    canvas.onmousedown = function (e) {
        measuringRuler.drawRuler = false;
        measuringRuler.startPos = new Posn(math.matrix([[e.x], [e.y]]));
        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    };

    canvas.onmouseup = function (e) {
        measuringRuler.endPos = new Posn(math.matrix([[e.x], [e.y]]));
        //if (measuringRuler.startPos !== null && measuringRuler.endPos !== null) {
        measuringRuler.drawRuler = true;
        //}
        //var totalY = Math.abs(endY - startY);
        document.getElementById("distance_block").innerHTML = "Distance calculated: " + measuringRuler.getHorizontalDistance(CANVAS_WIDTH) + "m.";
        //context.stroke();
        //console.log("X = " + totalX + " Y = " + totalY);
        context.beginPath();
    };

    document.onkeydown = function (e) {
        if (e.key === 'c' && measuringRuler.drawRuler) {
            console.log('Measuring Tape is cleared');
            measuringRuler.drawRuler = false;
            context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
    };

    // Call init to start the game
    init();
};

var form = document.getElementById("launch-form");
function handleForm(event) {
    event.preventDefault();
    if (document.getElementById("angle").value !== "" && document.getElementById("velocity").value !== "") {

        launchSpeed = document.getElementById("velocity").value;
        launchAngle = document.getElementById("angle").value;

        launch = true;
    }
    else {
        alert("Please enter an angle and and initial velocity");
    }
}
form.addEventListener('submit', handleForm);
