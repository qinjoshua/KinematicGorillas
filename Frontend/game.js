var gameWidth;
var gameHeight;

var pixelsInPosn;

var GRAVITY = math.matrix([[0], [9.8]]);

class Posn{
    constructor(vector) {
        this.vector = vector;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
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

class Gorilla {
    constructor(position, orientation, width, height, name, playerID, shots) {
        this.position = position;
        this.orientation = orientation;
        this.width = width;
        this.height = height;
        this.name = name;
        this.playerID = playerID;
        this.shotsLeft = shots;
        this.alive = true;
    }
}

class Building {
    constructor(height, width, color, position) {
        this.height = height;
        this.width = width;
        this.color = color;
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
    constructor() {
        this.buildings = [];
        this.gorillas = [];
        this.bananas = [];
    }
}
 
window.onload = function() {
    // Get the canvas and context
    var canvas = document.getElementById("viewport"); 
    var context = canvas.getContext("2d");
    var model = new KinematicGorillaModel();

    function resize() {
        var container = document.getElementById("viewport-container");
        gameWidth = container.clientWidth;
        gameHeight = container.clientHeight;
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
    
    // Initialize the game
    function init() {
        // Add mouse events
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mouseup", onMouseUp);
        canvas.addEventListener("mouseout", onMouseOut);
    
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
    
    // Draw a frame with a border
    function drawFrame() {
        // Draw background and a border
        context.fillStyle = "#d0d0d0";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#e8eaec";
        context.fillRect(1, 1, canvas.width-2, canvas.height-2);
        
        // Draw header
        context.fillStyle = "#303030";
        context.fillRect(0, 0, canvas.width, 65);
        
        // Draw title
        context.fillStyle = "#ffffff";
        context.font = "24px Verdana";
        context.fillText("HTML5 Canvas Basic Framework - Rembound.com", 10, 30);
        
        // Display fps
        context.fillStyle = "#ffffff";
        context.font = "12px Verdana";
        context.fillText("Fps: " + fps, 13, 50);
    }
    
    // Mouse event handlers
    function onMouseMove(e) {}
    function onMouseDown(e) {}
    function onMouseUp(e) {}
    function onMouseOut(e) {}
    
    // Get the mouse position
    function getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left)/(rect.right - rect.left)*canvas.width),
            y: Math.round((e.clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
        };
    }
    
    // Call init to start the game
    init();
};

var form = document.getElementById("launchForm");
function handleForm(event) { event.preventDefault(); } 
form.addEventListener('submit', handleForm);