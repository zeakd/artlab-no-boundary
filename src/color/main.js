import io from 'socket.io-client'
import Fluider from '../fluid'
import { random, hexToRgb, lerp } from '../utils'

const fluider = new Fluider(document.getElementById('canvas'));
fluider.run();

const socket = io(process.env.SERVER_URL);

socket.on('connect', () => {
  console.log('connect!')
});

socket.on('imageData', (values)=> {
  updateCanvas(values)
  // console.log(values);
})


const colorStatus = [
  { 
    color: '#ff3000',
    in: false,
  },
  { 
    color: '#e2234c',
    in: false,
  },
  { 
    color: '#fca649',
    in: false,
  },
  { 
    color: '#fcd532',
    in: false,
  },
  { 
    color: '#c1ff4a',
    in: false,
  },
  { 
    color: '#03e574',
    in: false,
  },
  { 
    color: '#82f975',
    in: false,
  },
  { 
    color: '#f7883c',
    in: false,
  },
  { 
    color: '#f95023',
    in: false,
  },
  { 
    color: '#22cefc',
    in: false,
  },
  { 
    color: '#06eaea',
    in: false,
  },
  { 
    color: '#35d2fc',
    in: false,
  },
  { 
    color: '#b688ff',
    in: false,
  },
  { 
    color: '#f97dc1',
    in: false,
  },
  { 
    color: '#fcb1e1',
    in: false,
  },
  { 
    color: '#fcc0d0',
    in: false,
  },
  // '#efb7f7',
]


class Walker {
  constructor(x, y, vx, vy, ax, ay, duration = 2) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.ax = ax;
    this.ay = ay;

    this.interval = 0.05;
    this.duration = duration
    this.sum = 0;

    this.walk = this.walk.bind(this);
  }

  walk(cb) {

    this.intervalId = setInterval(() => {
      if (this.duration < this.sum) {
        clearInterval(this.intervalId)
      }

      this._walk(cb)
      this.sum += this.interval;
    }, this.interval * 1000)
  }

  stop() {
    clearInterval(this.intervalId);
  }

  _walk(cb) {
    // this.vx = this.vx + this.ax * this.interval;
    // this.vy = this.vy + this.ay * this.interval;

    this.x = this.x + this.vx * this.interval
    this.y = this.y + this.vy * this.interval

    cb(this.x, this.y)
  }
}

let walker = null

function randomWalk() {
  const vx = random(50) - 25;
  const vy = random(50) - 25;
  const ax = random(50) - 25;
  const ay = random(50) - 25;
  
  
  const width = 128;
  const height = 128;
  let x = vx < 0 ? width + random(width / 50): random(width / 50);
  let y = vy > 0 ? height + random(height / 50): random(height / 50);
  
  // console.log(x, y, vx, vy, ax, ay)
  if (walker) {
    walker.stop();
  }
  walker = new Walker(x, y, vx, vy, ax, ay)
  walker.walk((x, y) => {
    fluider.move(Math.round(x), Math.round(y));
  })
}

let currentColors = []


function age(colors, {
  delta = 0.01
} = {}) {
  const aged = colors
  .map(({
    // color: prevColor,
    originColor,
    rate: prevRate,
  }) => {
    let rate = prevRate - delta;
    rate = rate < 0 ? 0 : (rate > 1 ? 1 : rate);
    let color = {
      r: lerp(rate, 255, originColor.r),
      g: lerp(rate, 255, originColor.g),
      b: lerp(rate, 255, originColor.b),
    }
    
    return {
      color,
      originColor,
      rate,
    }
  })
  .filter(({ rate }) => rate > 0)

  return aged;
}


function createColorMapper(colors) {
  return (p, ux, uy) => {
    const rate = p * 555 / 255;

    return getGradientedColor(colors, rate)
  }
}


function getGradientedColor(colors, _rate) {
  const rate = _rate > 1 ? 1 : (_rate < 0 ? 0 : _rate);
  let bigColor;
  if (colors.length > 1) {
    const biggestColor = colors.reduce((p, c) => {
      return p.rate <= c.rate ? c : p
    })
    bigColor = {
      color: biggestColor.originColor,
      rate: 1,
    }
  } else {
    bigColor = {
      color: {
        r: 255,
        g: 255,
        b: 255,
      },
      rate: 1,
    }
  }

  const { 
    small,
    big,
  } = colors.reduce((p, c) => {
    if (p.small.rate <= c.rate && c.rate < rate) {
      return {
        small: c,
        big: p.big,
      }
    } 

    if (p.big.rate >= c.rate && c.rate >= rate) {
      return {
        small: p.small,
        big: c,
      }
    }

    return p
  }, {
    small: {
      color: {
        r: 255,
        g: 255,
        b: 255,
      },
      rate: 0,
    },
    big: bigColor
  })

  const ratio = (rate - small.rate) / (big.rate - small.rate);

  const color = {
    r: lerp(ratio, small.color.r, big.color.r),
    g: lerp(ratio, small.color.g, big.color.g),
    b: lerp(ratio, small.color.b, big.color.b),
  }

  if (isNaN(color.r)) {
    console.log(color, small, big, rate)
    throw new Error('NaN')
  }

  return color;
}

/**
 * aging
 */
setInterval(() => {
  currentColors = age(currentColors)
  // console.log(currentColors)
  const mapper = createColorMapper(currentColors)
  fluider.setColorMapper(mapper)
}, 100)

function updateCanvas(values) {
  values.forEach((value, index) => {
    // let volume = value / 100000 + 0.3;
    // volume = volume > 1 ? 1 : volume;

    if (value < 5000) {
      colorStatus[index].in = false;
    } else {
      if (!colorStatus[index].in) {
        colorStatus[index].in = true;
        const color = hexToRgb(colorStatus[index].color);

        currentColors.push({
          color: color,
          originColor: color,
          rate: 1, 
        })

        randomWalk();
      } else {
        // audioStates[index].audio.volume = volume;
      }
    }
  })
}