import { lerp, clamp, hexToRgb, random } from '../utils'

function sampler(a, width, height, stride, offset){
  var f = function(x, y, value) {
      x = (x < 0 ? 0 : (x > width-1 ? width-1 : x))|0;
      y = (y < 0 ? 0 : (y > height-1 ? height-1 : y))|0;
      if(value !== undefined){
          a[(x+y*width)*stride+offset] = value;
      }
      else {
          return a[(x+y*width)*stride+offset];
      }
  };
  f.a = a;
  return f;
}

class Fluider {
  constructor(canvas, {
    step = 4.0,
    color = '#ff3000',
  } = {}) {
    this.canvas = canvas;
    this.WIDTH = canvas.width;
    this.HEIGHT = canvas.height;
    this.ctx = canvas.getContext('2d');
    
    this.step = step;
    this.color = color;

    this.animate = this.animate.bind(this);
    this.setColor = this.setColor.bind(this);
    this.startWalk = this.startWalk.bind(this);
    this.colorMapper = (p, ux, uy) => {
      
      const rate = p * 555 / 255;
      const srcColor = hexToRgb('#FFFFFF')
      const destColor = hexToRgb('#fca649')
      return {
        r: lerp(rate, srcColor.r, destColor.r),
        g: lerp(rate, srcColor.g, destColor.g),
        b: lerp(rate, srcColor.b, destColor.b),
      }
      
    }
  }

  setColor(color) {
    this.color = hexToRgb(color) || hexToRgb('#ff3000');
  }

  setColorMapper(func) {
    this.colorMapper = func;
  }

  run() {
    this.x = this.WIDTH / 2;
    this.y = this.HEIGHT / 2;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;

    this.setColor(this.color);

    this.sx = this.canvas.width/ this.canvas.clientWidth;
    this.sy = this.canvas.height/ this.canvas.clientHeight;
    this.mouseX = 0;
    this.mouseY = 0;
    const rect = this.canvas.getBoundingClientRect();
    this.left = rect.left
    this.top = rect.top;

    window.addEventListener('mousemove', (e) => {
        this.mouseX = (e.clientX - this.left)|0,
        this.mouseY = (e.clientY - this.top)|0;
        // console.log('mouse move ', this.mouseX, this.mouseY)
    }); 

    this.lastMouseX = this.mouseX;
    this.lastMouseY = this.mouseY;


    // 
    this.pointX = 100;
    this.pointY = 100;
    this.prevPointX = this.pointX;
    this.prevPointY = this.pointY;

    const WIDTH = this.WIDTH;
    const HEIGHT = this.HEIGHT;

    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    this.imageData = this.ctx.getImageData(0, 0, WIDTH, HEIGHT);

    this.velocityField0 = new Float32Array(WIDTH*HEIGHT*2);
    this.u0x = sampler(this.velocityField0, WIDTH, HEIGHT, 2, 0);
    this.u0y = sampler(this.velocityField0, WIDTH, HEIGHT, 2, 1);
    this.velocityField1 = new Float32Array(WIDTH*HEIGHT*2);
    this.u1x = sampler(this.velocityField1, WIDTH, HEIGHT, 2, 0);
    this.u1y = sampler(this.velocityField1, WIDTH, HEIGHT, 2, 1);
    this.pressureField0 = new Float32Array(WIDTH*HEIGHT);
    this.p0 = sampler(this.pressureField0, WIDTH, HEIGHT, 1, 0);
    this.pressureField1 = new Float32Array(WIDTH*HEIGHT);
    this.p1 = sampler(this.pressureField1, WIDTH, HEIGHT, 1, 0);
    this.divergenceField = new Float32Array(WIDTH*HEIGHT);
    this.div = sampler(this.divergenceField, WIDTH, HEIGHT, 1, 0);

    for(let i = 0; i < this.pressureField0.length; i++) {
      this.pressureField0[i] = 0;
      this.pressureField1[i] = this.pressureField0[i];
    }

    for(let i = 0; i < this.velocityField0.length; i++) {
      this.velocityField1[i] = this.velocityField0[i];
    }

    this.velocityBoundary();

    this.animate();
    // setInterval(() => {
    //   this.move(this.pointX - 10 + random(20), this.pointX - 10 + random(20));
    // }, 100)
  }

  simulate() {
    this.velocityBoundary();
    this.advect(this.u0x, this.u1x);
    this.advect(this.u0y, this.u1y);
    // this.addMouseForce();
    // this.move(this.pointX - 1 + random(3), this.pointY - 1 + random(3))
    this.addPoint();
    this.computeDivergence();
    this.fastjacobi(this.p0, this.p1, this.div, -1, 0.25, 10);
    this.subtractPressureGradient();

    let aux = this.p0;
    this.p0 = this.p1;
    this.p1 = aux;
  
    aux = this.u0x;
    this.u0x = this.u1x;
    this.u1x = aux;
  
    aux = this.u0y;
    this.u0y = this.u1y;
    this.u1y = aux;
  }

  move(x, y) {
    // this.pointX = x > this.WIDTH - 11 ? this.WIDTH - 11 : (x < 10 ? 10 : x);
    // this.pointY = y > this.HEIGHT - 11 ? this.HEIGHT - 11 : (y < 10 ? 10 : y);
    this.pointX = x;
    this.pointY = y;
  }

  addPoint() {
    if (
      this.pointX < 10 ||
      this.pointX > this.WIDTH - 11 ||
      this.pointY < 10 ||
      this.pointY > this.HEIGHT - 11
    ) {
      return;
    }
    const ux = this.u1x;
    const uy = this.u1y;

    const x = clamp(this.pointX, 10, this.WIDTH - 11);
    const y = clamp(this.pointY, 10, this.HEIGHT - 11);

    const dx = this.pointX - this.prevPointX;
    const dy = this.pointY - this.prevPointY;
    // console.log(this.pointX, this.pointY, this.prevPointX, this.prevPointY)

    this.prevPointX = this.pointX;
    this.prevPointY = this.pointY;

    ux(x, y, ux(x, y)-dx);
    uy(x, y, uy(x, y)-dy);
  }

  addMouseForce() {
    const ux = this.u1x;
    const uy = this.u1y;

    const x = clamp(this.mouseX * this.sx, 1, this.WIDTH - 2);
    const y = clamp(this.mouseY * this.sy, 1, this.HEIGHT - 2);

    // console.log(this.mouseX, this.mouseY, this.lastMouseX, this.lastMouseY)
    // console.log(x, y);
    const dx = this.mouseX - this.lastMouseX;
    const dy = this.mouseY - this.lastMouseY;

    // console.log(dx, dy);
    this.lastMouseX = this.mouseX;
    this.lastMouseY = this.mouseY;
    
    
    ux(x, y, ux(x, y)-dx);
    uy(x, y, uy(x, y)-dy);
  }

  velocityBoundary() {
    const WIDTH = this.WIDTH;
    const HEIGHT = this.HEIGHT;

    const ux = this.u0x;
    const uy = this.u0y;

    for(let x = 0; x < WIDTH; x++) {
      ux(x, 0, -ux(x, 1));
      uy(x, 0, -uy(x, 1));

      ux(x, HEIGHT-1, -ux(x, HEIGHT-2));
      uy(x, HEIGHT-1, -uy(x, HEIGHT-2));
    }

    for(let y = 0; y < HEIGHT; y++) {
      ux(0, y, -ux(1, y));
      uy(0, y, -uy(1, y));

      ux(WIDTH-1, y, -ux(WIDTH-2, y));
      uy(WIDTH-1, y, -uy(WIDTH-2, y));
    }
  }

  advect(src, dest) {
    const WIDTH = this.WIDTH;
    const HEIGHT = this.HEIGHT;
    const ux = this.u0x;
    const uy = this.u0y;
    const step = this.step;

    for(let y = 1; y < HEIGHT-1; y++) {
      for(let x = 1; x < WIDTH-1; x++) {
        const vx = ux(x, y)*step;
        const vy = uy(x, y)*step;
  
        dest(x, y, this.bilerp(src, x+vx, y+vy));
      }
    }
  }

  bilerp(sample, x, y) {
    const x0 = ~~x;
    const y0 = ~~y;
    const x1 = x0+1;
    const y1 = y0+1;
    const p00 = sample(x0, y0);
    const p01 = sample(x0, y1);
    const p10 = sample(x1, y0);
    const p11 = sample(x1, y1);

    return lerp(y-y0, lerp(x-x0, p00, p10), lerp(x-x0, p01, p11));
  }

  computeDivergence() {
    const WIDTH = this.WIDTH;
    const HEIGHT = this.HEIGHT;
    const ux = this.u1x;
    const uy = this.u1y;
    const div = this.div;

    for(let y = 1; y < HEIGHT-1; y++) {
      for(let x = 1; x < WIDTH-1; x++) {
        // compute divergence using central difference
        const x0 = ux(x-1, y);
        const x1 = ux(x+1, y);
        const y0 = uy(x, y-1);
        const y1 = uy(x, y+1);
        div(x, y, (x1 - x0 + y1 - y0) * 0.5);
      }
    }
  }

  fastjacobi(p0, p1, b, alpha, beta, iterations){
    const WIDTH = this.WIDTH;
    const HEIGHT = this.HEIGHT;
    p0 = p0.a;
    p1 = p1.a;
    b = b.a;
    //for(var i = 0; i < pressureField0.length; i++) {
        //pressureField0[i] = 0.5;
        //pressureField1[i] = pressureField0[i];
    //}

    for(let i = 0; i < iterations; i++) {
      for(let y = 1; y < HEIGHT-1; y++) {
        for(let x = 1; x < WIDTH-1; x++) {
          let pi = x+y*WIDTH;
          let x0 = p0[pi-1];
          let x1 = p0[pi+1];
          let y0 = p0[pi-WIDTH];
          let y1 = p0[pi+WIDTH];

          p1[pi] = (x0 + x1 + y0 + y1 + alpha * b[pi]) * beta;
        }
      }
      var aux = p0;
      p0 = p1;
      p1 = aux;
      //pressureboundary(p0);
    }
  }

  subtractPressureGradient() {
    const ux = this.u1x;
    const uy = this.u1y;
    const p = this.p0;
    const WIDTH = this.WIDTH;
    const HEIGHT = this.HEIGHT;

    for(var y = 1; y < HEIGHT-1; y++) {
      for(var x = 1; x < WIDTH-1; x++) {
        let x0 = p(x-1, y);
        let x1 = p(x+1, y);
        let y0 = p(x, y-1);
        let y1 = p(x, y+1);
        let dx = (x1-x0)/2;
        let dy = (y1-y0)/2;

        ux(x, y, ux(x, y)-dx);
        uy(x, y, uy(x, y)-dy);
      }
    }
  }

  draw() {
    const WIDTH = this.WIDTH;
    const HEIGHT = this.HEIGHT;
    const data = this.imageData.data;
    const p = this.p0;
    const ux = this.u0x;
    const uy = this.u0y;
    const colorMapper = this.colorMapper;

    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const offset = (y * WIDTH + x) * 4;

        const { r, g, b } = colorMapper(p(x, y), ux(x, y), uy(x, y))
        data[offset + 0] = Math.floor(r);
        data[offset + 1] = Math.floor(g);
        data[offset + 2] = Math.floor(b);
        // data[offset + 3] = 255;
      }
    }

    this.ctx.putImageData(this.imageData, 0, 0);
  }

  startWalk(x, y, vx, vy, ax, ay, duration = 1) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.ax = ax;
    this.ay = ay;

    this.duration = duration
    this.sum = 0;
  }

  walk() {
    this.vx = this.vx + this.ax * 0.1;
    this.vy = this.vy + this.ay * 0.1;

    this.x = this.x + this.vx * 0.1;
    this.y = this.y + this.vy * 0.1;
  }

  animate() {
    this.simulate();
    this.walk();
    this.move(this.x, this.y)
    this.draw();
    

    window.requestAnimationFrame(this.animate);
  }
}

export default Fluider