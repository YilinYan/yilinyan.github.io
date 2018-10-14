function setup() {
    var canvas = createCanvas(window.innerWidth, 500);
    canvas.parent("canvas");
    background (0);
}

function draw() {
    if (mouseIsPressed) {
      fill(0);
    } else {
      fill(255);
    }
    ellipse(mouseX, mouseY, 80, 80);
}
