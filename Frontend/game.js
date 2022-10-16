let GAME_WIDTH = 200;
let GAME_HEIGHT = 100;

let GORILLA_WIDTH_FACTOR = 0.025;
let GORILLA_HEIGHT_FACTOR = 0.1;

let LEFT_PLAYER_OPEN_POS = [];
let RIGHT_PLAYER_OPEN_POS = [];

let MAX_SHOTS = 3;

var PIXEL_TO_POSN;

var GRAVITY = math.matrix([[0], [-9.8]]);

var gameWidth;
var gameHeight;

var launchAngle;
var launchSpeed;
var launch = false;

function metersToPixels(meters) {
    return meters * (gameWidth / GAME_WIDTH);
}

function metersToPixels(meters) {
    return meters * (gameWidth / GAME_WIDTH);
}

class Posn {
    constructor(vector) {
        this.vector = vector;
    }

    getX() { return this.vector.subset(math.index(0, 0)); }

    getY() { return this.vector.subset(math.index(1, 0)); }

    getPixelX() { return metersToPixels(this.getX()); }

    getPixelY() { return metersToPixels(GAME_HEIGHT - this.getY()); }

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
        this.alive = true;
    }

    containsPoint(pointPosn) {
        return this.position.getX() >= pointPosn.getX() &&
            this.position.getY() >= pointPosn.getY() &&
            this.position.getX() <= pointPosn.getX() + this.width &&
            this.position.getY() <= pointPosn.getY() - this.height;
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
        return this.position.getX() >= pointPosn.getX() &&
            this.position.getY() >= pointPosn.getY() &&
            this.position.getX() <= pointPosn.getX() + this.width &&
            this.position.getY() <= pointPosn.getY() - this.height;
    }
}

class KinematicGorillaModel {
    constructor(playerIDs) {
        this.buildings = this.createSkyline();
        // TODO: Turn array into Map of playerID->Gorilla
        this.gorillas = this.addGorillas(playerIDs);
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

            let buildingOrigin = new Posn(math.matrix([[widthCovered], [y * GAME_HEIGHT]]));

            var leftThreshold = widthCovered < (GAME_WIDTH / 2 * 0.85);
            var rightThreshold = widthCovered > (GAME_WIDTH / 2 + (GAME_WIDTH / 2 * 0.15));

            // Creating reference points on the building for the gorillas to be placed on
            if (leftThreshold) {
                LEFT_PLAYER_OPEN_POS.push(buildingOrigin);
            }
            else if (rightThreshold && (widthCovered + x * GAME_WIDTH <= GAME_WIDTH)) {
                RIGHT_PLAYER_OPEN_POS.push(new Posn(math.matrix([[buildingOrigin.getX() + x * GAME_WIDTH], [buildingOrigin.getY()]])));
            }

            var building = new Building(x * GAME_WIDTH, y * GAME_HEIGHT, buildingOrigin);
            buildings.push(building);

            widthCovered = widthCovered + (x * GAME_WIDTH);
        }

        return buildings;
    }

    // Adds Gorillas representing players to the game
    addGorillas(playerIDs) {
        var gorillas = [];

        for (var ii = 0; ii < playerIDs.length; ii++) {
            var position;
            var orientation;
            var width = GAME_WIDTH * GORILLA_WIDTH_FACTOR;
            var height = GAME_HEIGHT * GORILLA_HEIGHT_FACTOR;

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

    // id of window should be used
    renderBuilding(x, y, width, height, window) {
        //put window function here
        var canvas = document.getElementById("viewport");
        var imgWindow = document.getElementById(window);
        this.context.drawImage(imgWindow, x, y, 0.04 * canvas.width, 0.1 * canvas.height);

        var columns = Math.round(width / (0.04 * canvas.width));
        var rows = Math.round(height / (0.1 * canvas.height));

        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                this.context.drawImage(imgWindow, x + column * 0.04 * canvas.width, y + row * 0.1 * canvas.height, 0.04 * canvas.width, 0.1 * canvas.height);
            }
        }
        // this.context.fillStyle = "#000000";
        // this.context.fillRect(x, y, width, height);
    }

    renderBuildings(buildings) {
        for (let i = 0; i < buildings.size(); i++) {
            let building = buildings[i];
            this.renderBuilding(building.position.getX(), building.position.getY(), building.width, building.height, building.window);
        }
    }


    renderBanana(x, y) {
        var canvas = document.getElementById("viewport");

        if (this.tick % 48 >= 0 && this.tick % 48 < 8) {
            var banana = document.getElementById("banana1-img");
            this.context.drawImage(banana, x, y, 0.02 * canvas.width, 0.05 * canvas.height);
        }
        else if (this.tick % 48 >= 8 && this.tick % 48 < 16) {
            var banana = document.getElementById("banana2-img");
            this.context.drawImage(banana, x, y, 0.02 * canvas.width, 0.05 * canvas.height);

        }
        else if (this.tick % 48 >= 16 && this.tick % 48 < 24) {
            var banana = document.getElementById("banana3-img");
            this.context.drawImage(banana, x, y, 0.02 * canvas.width, 0.05 * canvas.height);

        }
        else if (this.tick % 48 >= 24 && this.tick % 48 < 32) {
            var banana = document.getElementById("banana4-img");
            this.context.drawImage(banana, x, y, 0.02 * canvas.width, 0.05 * canvas.height);

        }
        else if (this.tick % 48 >= 32 && this.tick % 48 < 40) {
            var banana = document.getElementById("banana5-img");
            this.context.drawImage(banana, x, y, 0.02 * canvas.width, 0.05 * canvas.height);

        }
        else {
            var banana = document.getElementById("banana6-img");
            this.context.drawImage(banana, x, y, 0.02 * canvas.width, 0.05 * canvas.height);

        }
    }

    renderGorilla(x, y, banana, orientation) {
        if (banana) {
            // with certain number of ticks
            this.renderGorillaBanana(x, y, true, orientation);
            // with certain number of ticks
            this.renderGorillaBanana(x, y, false, orientation);
        }
        else {
            this.renderGorillaBreathing(x, y, orientation)
        }
    }


    flipHorizontally(img, x, y, width, height) {
        // move to x + img's width
        this.context.translate(x, y);

        // scaleX by -1; this "trick" flips horizontally
        this.context.scale(-1, 1);

        // draw the img
        // no need for x,y since we've already translated
        this.context.drawImage(img, 0, 0, width, height);

        // always clean up -- reset transformations to default
        this.context.setTransform(1, 0, 0, 1, 0, 0);
    }

    renderGorillaBreathing(x, y, orientation) {
        var imgBreatheUpGorilla = document.getElementById("bu-img");
        var imgBreatheDownGorilla = document.getElementById("bd-img");
        var imgBreatheUpGorillaLeft = document.getElementById("bu-img-l");
        var imgBreatheDownGorillaLeft = document.getElementById("bd-img-l");
        var canvas = document.getElementById("viewport");

        if (this.tick % 30 === 0) {
            this.breatheUp = !this.breatheUp;
        }

        switch (orientation) {
            case Orientation.LEFT:
                if (this.breatheUp) {
                    this.context.drawImage(imgBreatheUpGorillaLeft, x, y, 0.04 * canvas.width, 0.1 * canvas.height);
                }
                else {
                    this.context.drawImage(imgBreatheDownGorillaLeft, x, y, 0.04 * canvas.width, 0.1 * canvas.height);
                }
                break;
            case Orientation.RIGHT:
                if (this.breatheUp) {
                    this.context.drawImage(imgBreatheUpGorilla, x, y, 0.04 * canvas.width, 0.1 * canvas.height);
                }
                else {
                    this.context.drawImage(imgBreatheDownGorilla, x, y, 0.04 * canvas.width, 0.1 * canvas.height);
                }
                break;
        }
        this.tick = this.tick + 1;
    }


    renderGorillaWin(x, y, orientation) {
        var imgWinUpGorilla = document.getElementById("win1-img");
        var imgWinDownGorilla = document.getElementById("win2-img");
        var imgWinUpGorillaLeft = document.getElementById("win1-img-l");
        var imgWinDownGorillaLeft = document.getElementById("win2-img-l");
        var canvas = document.getElementById("viewport");

        if (this.tick % 30 === 0) {
            this.breatheUp = !this.breatheUp;
        }

        switch (orientation) {
            case Orientation.LEFT:
                if (this.breatheUp) {
                    this.context.drawImage(imgWinUpGorillaLeft, x, y, 0.04 * canvas.width, 0.1 * canvas.height);
                }
                else {
                    this.context.drawImage(imgWinDownGorillaLeft, x, y, 0.04 * canvas.width, 0.1 * canvas.height);
                }
                break;
            case Orientation.RIGHT:
                if (this.breatheUp) {
                    this.context.drawImage(imgWinUpGorilla, x, y, 0.04 * canvas.width, 0.1 * canvas.height);
                }
                else {
                    this.context.drawImage(imgWinDownGorilla, x, y, 0.04 * canvas.width, 0.1 * canvas.height);
                }
                break;
        }
        this.tick = this.tick + 1;
    }

    renderGorillaBanana(x, y, withBanana, orientation) {
        var imgWithBanana = document.getElementById("wb-img");
        var imgWithoutBanana = document.getElementById("win1-img");
        var imgWithBananaLeft = document.getElementById("wb-img-l");
        var imgWithoutBananaLeft = document.getElementById("win1-img-l");
        var canvas = document.getElementById("viewport");

        switch (orientation) {
            case Orientation.LEFT:
                // just the image according to the boolean given
                if (withBanana) {
                    // image of gorilla holding banana
                    this.context.drawImage(imgWithBananaLeft, x, y, 0.04 * canvas.width, 0.1 * canvas.height);

                }
                else {
                    // same pos: image of gorilla without banana
                    this.context.drawImage(imgWithoutBananaLeft, x, y, 0.04 * canvas.width, 0.1 * canvas.height);
                }
                break;
            case Orientation.RIGHT:
                // just the image according to the boolean given
                if (withBanana) {
                    // image of gorilla holding banana
                    this.context.drawImage(imgWithBanana, x, y, 0.04 * canvas.width, 0.1 * canvas.height);

                }
                else {
                    // same pos: image of gorilla without banana
                    this.context.drawImage(imgWithoutBanana, x, y, 0.04 * canvas.width, 0.1 * canvas.height);
                }
                break;
        }
    }

    renderExplosion(x, y) {
        var canvas = document.getElementById("viewport");

        if (this.tick % 80 >= 0 && this.tick % 80 < 16) {
            var explode = document.getElementById("explosion1-img");
            this.context.drawImage(explode, x, y, 0.075 * canvas.width, 0.15 * canvas.height);
        }
        else if (this.tick % 16 >= 8 && this.tick % 80 < 32) {
            var explode = document.getElementById("explosion2-img");
            this.context.drawImage(explode, x, y, 0.075 * canvas.width, 0.15 * canvas.height);

        }
        else if (this.tick % 80 >= 32 && this.tick % 80 < 48) {
            var explode = document.getElementById("explosion3-img");
            this.context.drawImage(explode, x, y, 0.075 * canvas.width, 0.15 * canvas.height);

        }
        else if (this.tick % 80 >= 48 && this.tick % 80 < 64) {
            var explode = document.getElementById("explosion4-img");
            this.context.drawImage(explode, x, y, 0.075 * canvas.width, 0.15 * canvas.height);

        }
        else {
            var explode = document.getElementById("explosion5-img");
            this.context.drawImage(explode, x, y, 0.075 * canvas.width, 0.15 * canvas.height);

        }

    }

}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var worldGame = new KinematicGorillaModel(["Adam", "Joshua"]);
console.log(worldGame.gorillas[0].position.toString());
console.log(worldGame.gorillas[1].position.toString());

window.onload = function () {
    // Get the canvas and context
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");
    var model = new KinematicGorillaModel(["Adam", "Joshua"]);
    console.log(model.gorillas[0].position);

    function resize() {
        var launchForm = document.getElementById("launch-form");
        gameWidth = window.innerWidth;
        gameHeight = document.documentElement.clientHeight - launchForm.clientHeight;
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

    // TODO: we've got to be able to set playerID somehow
    var playerID = "Adam";

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

        for (var bi = 0; bi < model.bananas.length; bi++) {
            let banana = model.bananas[bi];

            banana.velocity = math.add(banana.velocity, math.multiply(GRAVITY, dt));
            banana.position = new Posn(math.add(banana.position.getPosition(), math.multiply(banana.velocity, dt)));

            // Check for collisions
            var collided = false;

            model.buildings.forEach(building => {
                if (building.containsPoint(banana.position)) {
                    collided = true;
                }
            });

            model.gorillas.forEach(gorilla => {
                if (gorilla.containsPoint(banana.position)) {
                    gorilla.alive = false;
                    collided = true;
                }
            });

            if (banana.position.getX() > GAME_WIDTH || banana.position.getX() > GAME_WIDTH < 0) {
                collided = true;
            }

            if (collided) {
                // Trigger explosion at the position the banana was located formerly
                model.bananas.splice(bi);
            }
        }

        // Launch a banana
        if (launch) {
            launch = false;
            model.addBanana(playerID, launchSpeed, launchAngle);
        }
    }

    // Render the game
    function render() {
        // Draw the frame
        drawFrame();
    }

    function drawFrame() {

        var imgBackground = document.getElementById("background");

        // Draw background and a border
        context.fillStyle = "#d0d0d0";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#0ce6ff";
        context.fillRect(1, 1, canvas.width - 2, canvas.height - 2);
        context.drawImage(imgBackground, 0, 0, canvas.width, canvas.height);

        // Display fps
        context.fillStyle = "#ffffff";
        context.font = "12px Verdana";
        context.fillText("Fps: " + fps, 13, 70);

        for (var ii = 0; ii < model.gorillas.length; ii++) {
            // Different states of Gorilla
            view.renderGorillaBreathing(model.gorillas[ii].position.getPixelX() - 20, model.gorillas[ii].position.getPixelY() + 10, model.gorillas[ii].orientation);
        }

        for (var ii = 0; ii < model.buildings.length; ii++) {
            view.renderBuilding(model.buildings[ii].position.getPixelX(), model.buildings[ii].position.getPixelY(),
                metersToPixels(model.buildings[ii].width), metersToPixels(model.buildings[ii].height), model.buildings[ii].window)
        }

        for (var ii = 0; ii < model.bananas.length; ii++) {
            view.renderBanana(model.bananas[ii].position.getPixelX(), model.bananas[ii].position.getPixelY());
        }
        // view.renderBanana(framecount, 99);
    }

    var buttonDownTest = false;
    var startX;
    var endX;
    var startY;
    var endY;

    canvas.onmousedown = function (e) {
        startX = e.x;
        startY = e.y;
        buttonDownTest = true;
    }

    canvas.onmouseup = function (e) {
        endX = e.x;
        endY = e.y;
        buttonDownTest = false;
        var totalX = Math.abs(endX - startX);
        var totalY = Math.abs(endY - startY);
        console.log("X = " + totalX + " Y = " + totalY);
    }

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
