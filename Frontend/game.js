let GAME_WIDTH = 200;
let GAME_HEIGHT = 100;

let GORILLA_WIDTH_FACTOR = 0.1;
let GORILLA_HEIGHT_FACTOR = 0.025;

let LEFT_PLAYER_OPEN_POS = [];
let RIGHT_PLAYER_OPEN_POS = [];

let MAX_SHOTS = 3;

var PIXEL_TO_POSN;

var GRAVITY = math.matrix([[0], [9.8]]);

class Posn {
    constructor(vector) {
        this.vector = vector;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    toString() {
        return "X: " + this.x + ", Y: " + this.y;
    }
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
        this.alive = true;
    }
}

class Building {
    constructor(width, height, position) {
        this.width = width;
        this.height = height;
        this.position = position;
    }

    containsPoint(pointPosn) {
        return this.position.getX() > pointPosn.getX() &&
            this.position.getY() > pointPosn.getY() &&
            this.position.getX() < pointPosn.getX() + this.width &&
            this.position.getY() < pointPosn.getY() - this.height;
    }
}

class KinematicGorillaModel {
    constructor(playerIds) {
        this.buildings = this.createSkyline();
        // TODO: Turn array into Map of PlayerID->Gorilla
        this.gorillas = this.addGorillas(playerIds);
        this.bananas = [];
    }

    // Randomly generates a skyline of buildings of different heights and widths
    createSkyline() {
        LEFT_PLAYER_OPEN_POS = [];
        RIGHT_PLAYER_OPEN_POS = [];
        var widthCovered = 0;
        var buildings = [];

        while (widthCovered < GAME_WIDTH) {
            var x = getRndInteger(2, 4) * 0.05;
            var y = getRndInteger(3, 8) * 0.1;

            let buildingOrigin = new Posn(widthCovered, y * GAME_HEIGHT);

            var leftThreshold = widthCovered < (GAME_WIDTH / 2 * 0.85);
            var rightThreshold = widthCovered > (GAME_WIDTH / 2 + (GAME_WIDTH / 2 * 0.15));

            // Creating reference points on the building for the gorillas to be placed on
            if (leftThreshold) {
                LEFT_PLAYER_OPEN_POS.push(buildingOrigin);
            }
            else if (rightThreshold && (widthCovered + x * GAME_WIDTH <= GAME_WIDTH)) {
                RIGHT_PLAYER_OPEN_POS.push(new Posn(buildingOrigin.x + x * GAME_WIDTH, buildingOrigin.y));
            }

            var building = new Building(x * GAME_WIDTH, y * GAME_HEIGHT, buildingOrigin);
            buildings.push(building);

            widthCovered = widthCovered + (x * GAME_HEIGHT);
        }

        return buildings;
    }

    // Adds Gorillas representing players to the game
    addGorillas(playerIds) {
        var gorillas = [];

        console.log(playerIds)
        for (var ii = 0; ii < playerIds.length; ii++) {
            var position;
            var orientation;
            var width = GAME_WIDTH * GORILLA_WIDTH_FACTOR;
            var height = GAME_HEIGHT * GORILLA_HEIGHT_FACTOR;

            switch (ii % 2) {
                case 0:
                    var randomIdx = getRndInteger(0, LEFT_PLAYER_OPEN_POS.length - 1);
                    position = new Posn(LEFT_PLAYER_OPEN_POS[randomIdx].x - width, LEFT_PLAYER_OPEN_POS[randomIdx].y + height);
                    LEFT_PLAYER_OPEN_POS.splice(randomIdx, 1);
                    orientation = Orientation.LEFT;
                    break;
                case 1:
                    var randomIdx = getRndInteger(0, RIGHT_PLAYER_OPEN_POS.length - 1);
                    //console.log("Length of the Right Positions " + RIGHT_PLAYER_OPEN_POS.length);
                    //console.log("This is the index " + randomIdx);
                    //console.log(RIGHT_PLAYER_OPEN_POS[randomIdx]);
                    position = new Posn(RIGHT_PLAYER_OPEN_POS[randomIdx].x, RIGHT_PLAYER_OPEN_POS[randomIdx].y + height);
                    RIGHT_PLAYER_OPEN_POS.splice(randomIdx, 1);
                    orientation = Orientation.RIGHT;
                    break;
                default:
                    break;
            }

            var gorilla = new Gorilla(position, orientation, width, height, playerIds[ii], MAX_SHOTS);
            gorillas.push(gorilla);
        }

        return gorillas;
    }

    addBanana(playerId) {
        for (var ii = 0; ii < this.gorillas.length; ii++) {
            if (this.gorillas[ii].playerId === playerId) {
                var gorilla = this.gorillas[ii]

                var bananaOrigin;

                switch (gorilla.orientation) {
                    case Orientation.LEFT:
                        bananaOrigin = gorilla.position;
                        break;
                    case Orientation.RIGHT:
                        bananaOrigin = new Posn(gorilla.position.x + gorilla.width, gorilla.position.y);
                }

                var banana = new Banana(bananaOrigin, null, gorilla);

                this.bananas.push(banana);

                return;
            }
        }
    }
}

class RenderView {
    constructor(context) {
        this.context = context
        this.tick = 1;
        this.breatheUp = true;
    }

    getRandomColor() {
        const letters = '0123456789abcdef'.split('');
        let color = '#';

        for (let i = 0; i < 6; i++) {
            color += letters[Math.round(Math.random() * 15)];
        }

        return color;
    }

    renderBuilding(x, y, width, height) {
        var randColor = this.getRandomColor();
        this.context.fillStyle = randColor;
        this.context.fillRect(x, y, width, height);
    }

    renderBanana(x, y) {
        var banana = document.getElementById("banana-img");
        var canvas = document.getElementById("viewport");

        // this.context.fillStyle = "#FFFF00";
        // this.context.fillRect(x, y, 10, 10);
        this.context.drawImage(banana, x, y, 0.01 * canvas.width, 0.025 * canvas.height);

    }

    renderGorilla(x, y, banana) {
        if (banana) {
            this.renderGorillaBanana(x, y)
        }
        else {
            this.renderGorillaBreathing(x, y)
        }
    }

    renderGorillaBreathing(x, y) {
        var imgBreatheUpGorilla = document.getElementById("bu-img");
        var imgBreatheDownGorilla = document.getElementById("bd-img");
        var canvas = document.getElementById("viewport");

        // this.context.fillStyle = "#000000";
        // this.context.font = "24px Verdana";
        // this.context.fillText("Throws: " + this.tick, 100, 50);
        if (this.tick % 30 === 0) {
            this.breatheUp = !this.breatheUp;
        }

        if (this.breatheUp) {
            // this.context.fillStyle = "#000000";
            // this.context.fillRect(x, y, 40, 60);
            this.context.drawImage(imgBreatheUpGorilla, x, y, 0.04 * canvas.width, 0.1 * canvas.height);
        }
        else {
            // this.context.fillStyle = "#ffffff";
            // this.context.fillRect(x, y, 40, 60);
            this.context.drawImage(imgBreatheDownGorilla, x, y, 0.04 * canvas.width, 0.1 * canvas.height);
        }
        this.tick = this.tick + 1;
    }

    renderGorillaWin(x, y) {
        var imgWinUpGorilla = document.getElementById("win1-img");
        var imgWinDownGorilla = document.getElementById("win2-img");
        var canvas = document.getElementById("viewport");

        // this.context.fillStyle = "#000000";
        // this.context.font = "24px Verdana";
        // this.context.fillText("Throws: " + this.tick, 100, 50);
        if (this.tick % 30 === 0) {
            this.breatheUp = !this.breatheUp;
        }

        if (this.breatheUp) {
            // this.context.fillStyle = "#000000";
            // this.context.fillRect(x, y, 40, 60);
            this.context.drawImage(imgWinUpGorilla, x, y, 0.04 * canvas.width, 0.1 * canvas.height);
        }
        else {
            // this.context.fillStyle = "#ffffff";
            // this.context.fillRect(x, y, 40, 60);
            this.context.drawImage(imgWinDownGorilla, x, y, 0.04 * canvas.width, 0.1 * canvas.height);
        }
        this.tick = this.tick + 1;
    }

    renderGorillaBanana(x, y, withBanana) {
        var imgWithBanana = document.getElementById("wb-img");
        var imgWithoutBanana = document.getElementById("win1-img");
        var canvas = document.getElementById("viewport");

        // just the image according to the boolean given
        if (withBanana) {
            // image of gorilla holding banana
            // this.context.fillStyle = "#000000";
            // this.context.fillRect(x, y, 40, 60);
            this.context.drawImage(imgWithBanana, x, y, 0.04 * canvas.width, 0.1 * canvas.height);

        }
        else {
            // same pos: image of gorilla without banana
            // this.context.fillStyle = "#ffffff";
            // this.context.fillRect(x, y, 40, 60);
            this.context.drawImage(imgWithoutBanana, x, y, 0.04 * canvas.width, 0.1 * canvas.height);
        }
    }

}
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var worldGame = new KinematicGorillaModel(["Adam", "Joshua"]);
console.log(worldGame.gorillas[0].position);
console.log(worldGame.gorillas[1].position);

window.onload = function () {
    // Get the canvas and context
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");
    var model = new KinematicGorillaModel(["Adam", "Joshua"]);

    function resize() {
        var container = document.getElementById("viewport-container");
        var launchForm = document.getElementById("launch-form");
        gameWidth = window.innerWidth;
        gameHeight = document.documentElement.clientHeight - launchForm.clientHeight;
        console.log(document.documentElement.clientHeight + " " + launchForm.clientHeight + " " + gameHeight);
        canvas.width = gameWidth;
        canvas.height = gameHeight;
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

        // Update the fps counter
        updateFps(dt);
    }

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

        // Update bannana positions, check for collision
        model.bananas.forEach(banana => {
            banana.velocity = math.add(banana.velocity, banana.GRAVITY);
            banana.position = new Posn(math.add(banana.position.getPosition(), banana.velocity));

            // Check for collisions
            var collided = false;

            model.buildings.forEach(building => {
                if (building.containsPoint()) {
                    collided = true;
                }
            });

            model.gorillas.forEach(gorilla => {
                if (gorilla.containsPoint()) {
                    gorilla.alive = false;
                    collided = true;
                }
            });

            if (collided) {
                model.bananas.removeChild(banana);
            }
        });
    }

    // Render the game
    function render() {
        // Draw the frame
        drawFrame();
    }


    function drawFrame() {

        // Draw background and a border
        context.fillStyle = "#d0d0d0";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#0ce6ff";
        context.fillRect(1, 1, canvas.width - 2, canvas.height - 2);

        // Display fps
        context.fillStyle = "#ffffff";
        context.font = "12px Verdana";
        context.fillText("Fps: " + fps, 13, 70);

        // var view = new RenderView()
        view.renderGorillaBreathing(99, 99);
        view.renderBanana(framecount, 99);

    }

    // Call init to start the game
    init();
};

var form = document.getElementById("launch-form");
function handleForm(event) { event.preventDefault(); }
form.addEventListener('submit', handleForm);
