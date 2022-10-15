# KinematicGorillas
Team members: Hadeel, Nivashini, Joshua, and Adam
function drawBuildingsFrame() {
        let sum = 0;
        //let buildings = []

        while (sum < canvas.width) {
            // let building = new Object()
            var x = Math.round(Math.random() * (4 - 2) + 2) * 0.05;
            var y = Math.round(Math.random() * (8 - 3) + 3) * 0.1;
            // windowStyle = "oval";
            var randomColor = getRandomColor();

            // buildings.push(building)
            context.fillStyle = randomColor;
            context.fillRect(sum, y * canvas.height, x * canvas.width, (canvas.height - y * canvas.height));

            sum = sum + (x * canvas.width);
        }

        //for (let i = 0; i < buildings.length; i++) {
        //    let building = buildings[i]
        //    context.fillStyle = building.buildColor
        //    context.fillRect(0, canvas.height, building.x * canvas.width, building.y * canvas.height)
        //}

    }