var pg;
var time = 0, lastX = 0, lastY = 0, deltaX = 0, deltaY = 0, rotX = 0;
//var a = 0, b = 0, c = 0, d = 0, e = 0, f = 0, g =0;
var flag = false
var lastTime = 0, rotV = 0, rotA = 0

function setup() {
    var canvas = createCanvas(window.innerWidth, 550, WEBGL);
    canvas.parent("canvas")
    background (0);
    noCursor();
    pg = createGraphics(1000, 550, WEBGL);

    var cnv = document.getElementById ("canvas")
    cnv.onmouseenter = function() {
        flag = true
        lastX = mouseX
        lastY = mouseY
    }
    cnv.onmouseleave = function() {
        flag = false
        rotA = 0
    }
}

function mouseMoved() {
    if (flag == false) return
    if (Date.now() - lastTime < 0.2) return
    rotA = mouseY - lastY
    rotV -= rotA / 500 / (Date.now() - lastTime)
    lastX = mouseX
    lastY = mouseY
    lastTime = Date.now()
}

function draw() {
    var lag = rotV * 0.05
    rotV -= lag
    rotX += rotV
    if (Math.abs(rotX) > 0.01)
        rotX -= rotX * 0.01
    time += 0.005;

    background (0);
    translate(sin(time) * 100 - 50, 0, 0);
    rotateX(PI/3 + rotX);
//    rotateY(PI/10);

    stroke(255);
    noFill();

    for(var x = -width/2, i = 0; x < width/2; ++i, x += noise(i) * 40 + 20)
    {
      strokeWeight(noise(x) / 2 + 0.2);
      beginShape();
      var len = height/2 + (noise (x, x) - 0.5) * 100;
      for(var y = -len; y < len; y+=10)
      {
          vertex(x, y, (noise(x/100.0 + time, y/100.0+10000 + time)*120.0));
      }
      endShape();
    }


    for(var y = -height/2 ; y < height/2 - 100; y += 40)
    {
      strokeWeight(noise(y) * 1.4);
      beginShape();
      var len = noise (y) * 1000;
      var a = -width/2 + sin(time + noise (y) * 1000) * 1000
                        + noise (y) * 1000;
      var b = a + len;
      for(var x = a; x < b; x += 5)
      {
//          vertex(x, y, (noise(y/100.0+10000 + time, x/100.0 + time)*120.0));
        vertex(x, y, (noise(x/100.0 + time, y/100.0+10000 + time)*220.0) + 50);
      }
      endShape();
    }

/*
    a += noise(time) - 0.5;
    b += noise(time+10000) - 0.5;
    c = noise(a/100.0 + time, b/100.0+10000 + time)*120.0;

    d += noise(time+20000) - 0.5;
    e += noise(time+30000) - 0.5;
    f = noise(d/100.0 + time, e/100.0+10000 + time)*120.0;
*/
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

}
