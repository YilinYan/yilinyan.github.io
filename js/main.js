var pg;
var time = 0;
var a = 0, b = 0, c = 0, d = 0, e = 0, f = 0;

function setup() {
<<<<<<< HEAD
    var canvas = createCanvas(1000, 550, WEBGL);
    canvas.parent("canvas");
    background (0);
    pg = createGraphics(1000, 550, WEBGL);
}

function draw() {
    background (0);
//    pg.background(0);
//    pg.beginDraw();
//    translate(width/2-50, height/2, -50);
    rotateX(PI/3);
//    rotateY(PI/3);
//    rotateZ(PI/6);
    stroke(255);
    noFill();
    time += 0.005;
    for(var x = -width/2, i = 0; x < width/2; ++i, x += noise(i) * 30)
    {
      beginShape();
      var len = height/2 + (noise (x, x) - 0.5) * 100;
      for(var y = -len; y < len; y+=10)
      {
        vertex(x, y, (noise(x/100.0 + time, y/100.0+10000 + time)*120.0));
      }
      endShape();
    }


    for(var y = -height/2 ; y < height/2 - 100; y += 30)
    {
      beginShape();
      var len = noise (y) * 1000;
      var a = -width/2 + sin(time + noise (y) * 1000) * 1000
                        + noise (y) * 1000;
      var b = a + len;
      for(var x = a; x < b; x += 5)
      {
//          vertex(x, y, (noise(y/100.0+10000 + time, x/100.0 + time)*120.0));
        vertex(x, y, (noise(x/100.0 + time, y/100.0+10000 + time)*220.0));
      }
      endShape();
    }


    a += noise(time) - 0.5;
    b += noise(time+10000) - 0.5;
    c = noise(a/100.0 + time, b/100.0+10000 + time)*120.0;

    d += noise(time+20000) - 0.5;
    e += noise(time+30000) - 0.5;
    f = noise(d/100.0 + time, e/100.0+10000 + time)*120.0;

/*
    stroke(255, 10, 10);
//    lights();
    translate(a, b, c);
    sphere(10);

    translate(-a, -b, -c);

    stroke(10, 10, 150);
//    lights();
    translate(d, e, f);
    sphere(10);
*/

//    pg.endDraw();
//    image(pg, 640, 360);

=======
/*
    var canvas = createCanvas(700, 500);
    canvas.parent("canvas");
    background (0);
    */
}

function draw() {
    /*
    if (mouseIsPressed) {
      fill(0);
    } else {
      fill(255);
    }
    ellipse(mouseX, mouseY, 80, 80);
    */
>>>>>>> 991ae39ccecfa07bb8f4f5d9a7e5ef0cc8e9ecd5
}
