
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

    // renderBuildings(Array of Building)
    // loop through the buildings and call renderBuilding

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
