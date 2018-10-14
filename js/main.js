function setup() {
    var canvas = createCanvas(700, 500);
    canvas.parent("canvas");
    canvas.width = window.innerWidth;
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
