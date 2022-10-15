var gameWidth;
var gameHeight;

var pixelsInPosn;
 
class Posn{
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    getX() {
        return this.x * pixelsInPosn;
    }

    getY() {
        return gameHeight - (this.y * pixelsInPosn);
    }
}
s
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
}
class KinematicGorillaModel {
    constructor() {
        this.buildings = [];
        this.gorillas = [];
        this.bananas = [];
    }
}


class RenderView {        
    constructor(context) {
        this.context = context
        this.bananaThrow = 1;
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
        this.context.fillStyle = "#FFFF00";
        this.context.fillRect(x, y, 10, 10);
    }

    renderGorilla(x, y) {
        this.context.fillStyle = "#000000";
        this.context.fillRect(x, y, 40, 60);
    }

    renderGorillaWithBanana(x, y) {

        this.context.fillStyle = "#000000";
        this.context.font = "24px Verdana";
        this.context.fillText("Speed: " + this.bananaThrow, 100, 50);
        this.bananaThrow = this.bananaThrow + 1;
        console.log(this.bananaThrow)
        if (x % 2 === 0) {
            this.context.fillStyle = "#000000";
            this.context.fillRect(x, y, 40, 60);
        }
        else {
            this.context.fillStyle = "#ffffff";
            this.context.fillRect(x, y, 40, 60);
        }
    
    }
}


window.onload = function() {
    // Get the canvas and context
    var canvas = document.getElementById("viewport"); 
    var context = canvas.getContext("2d");

    function resize() {
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight;
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
        context.fillRect(1, 1, canvas.width-2, canvas.height-2);
        
        // Display fps
        context.fillStyle = "#ffffff";
        context.font = "12px Verdana";
        context.fillText("Fps: " + fps, 13, 70);

       // var view = new RenderView()
       // view.renderGorillaWithBanana(99,99)
       // view.renderBanana(99,99)
       
    }
    
    // Call init to start the game
    init();
};