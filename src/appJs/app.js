let size = [window.innerWidth, window.innerHeight];
let circleArr = [];
let sizes = [10, 100];
let numCircles = 30;
let t = Date.now();

class circ {
  constructor() {
    this.radius = Math.floor(Math.random() * sizes[1]) + sizes[0];
    this.vector = p5.Vector.random2D();
    this.velocity = p5.Vector.random2D()
    this.position = createVector(((Math.random() - 0.5) * size[0]) + size[0] / 2, (
      (Math.random() -
        0.5) * size[1]) + size[1] / 2);
  }
}

function drawLines(lastDraw) {

  circleArr.forEach((el, index) => {


    //el.velocity.add(p5.Vector.random2D().mult(0.01));
    el.velocity.limit(0.1);
    if (el.position.x <= 0 || el.position.x >= size[0]) el.velocity.x *= -1;
    if (el.position.y <= 0 || el.position.y >= size[1]) el.velocity.y *= -1;
    el.position.add(el.velocity);
    stroke("rgba(100,255,100,0.03)");
    strokeWeight(20);
    point(el.position.x, el.position.y);
    //check distances between points
    circleArr.forEach((el2, index2) => {

      //console.log(el2);
      if (el.position.dist(el2.position) <size[0]*0.15 && index !== index2) {
        //if its a short distance, draw a line
          stroke("rgba(100,255,100,0.008)");
          strokeWeight(5);




        //el.color.b * (1 / 50)
        line(el.position.x, el.position.y, el2.position.x, el2.position
          .y);

      }
    });
  })
}

function setup() {
  frameRate(60);
  let canvas = createCanvas(size[0], size[1]);
  canvas.parent(document.getElementsByClassName("canvas")[0]);
  //draw background color
  fill(color("#2D221A"));
  stroke(color("#2D221A"));
  rect(0, 0, size[0], size[1]);
  for (let i = 0; i < numCircles; i++) {
    circleArr.push(new circ);
  }

}

function draw() {
  //draw background
  rect(0,0,size[0],size[1]);



  drawLines();

}
