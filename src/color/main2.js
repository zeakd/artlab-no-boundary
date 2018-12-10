import io from 'socket.io-client'
import Fluider from './fluid'
import { random, hexToRgb, lerp, fullscreen } from '../utils'

const canvas = document.getElementById('canvas')
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const fluider = new Fluider(canvas);
fluider.run();

canvas.addEventListener('click', () => {
  fullscreen(canvas);
})

let serverURL;
if (process.env.NODE_ENV === 'development') {
  serverURL = process.env.SERVER_URL;
}

const socket = io(serverURL);

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

    // this.interval = 0.001;
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
    this.vx = this.vx + this.ax * this.interval;
    this.vy = this.vy + this.ay * this.interval;

    this.x = this.x + this.vx * this.interval
    this.y = this.y + this.vy * this.interval

    cb(this.x, this.y)
  }
}

let walker = null

function randomWalk() {
  let vx = (random(WIDTH) - WIDTH / 2);
  let vy = (random(HEIGHT) - HEIGHT / 2);
  vx = vx > 0 ? vx + 30 : vx - 30;
  vy = vy > 0 ? vy + 30 : vy - 30;
  vx *= 0.7;
  vy *= 0.7;
  // const vx = 40;
  // const vy = 40;
  let ax = random(10);
  let ay = random(10);
  // ax = vx > 0 ? -a
  // const ax = 0;
  // const ay = 0;
  
  let x = vx < 0 ? WIDTH - 11 - random(Math.floor(WIDTH / 2)) : random(Math.floor(WIDTH / 2)) + 10;
  let y = vy > 0 ? HEIGHT - 11 - random(HEIGHT / 2): random(HEIGHT / 2) + 10;
  
  // console.log(x, y, vx, vy, ax, ay)
  // if (walker) {
  //   walker.stop();
  // }
  // walker = new Walker(x, y, vx, vy, ax, ay)
  // walker.walk((x, y) => {
  //   fluider.move(Math.round(x), Math.round(y));
  // })

  fluider.startWalk(x, y, vx, vy, ax, ay)
}

// setInterval(() => {
//   const color = hexToRgb(colorStatus[random(colorStatus.length)].color);

//   currentColors.push({
//     color: color,
//     originColor: color,
//     rate: 1, 
//   })

//   randomWalk();
// }, 2000)

let currentColors = []

let smallColor = {
  color: {
    r: 255,
    g: 255,
    b: 255,
  },
  originColor: {
    r: 255,
    g: 255,
    b: 255,
  },
  rate: 0,
}

function age(colors, {
  delta = 0.01
} = {}) {
  const aged = colors
  .map(({
    // color: prevColor,
    originColor,
    rate: prevRate,
  }) => {
    // let rate = prevRate - (Math.pow(2, prevRate) - 1) * 0.03;
    let rate = prevRate - delta;
    let ratio = rate < 0 ? 0 : (rate > 1 ? 1 : rate);
    let color = {
      r: lerp(ratio, 255, originColor.r),
      g: lerp(ratio, 255, originColor.g),
      b: lerp(ratio, 255, originColor.b),
    }
    
    return {
      color: originColor,
      originColor,
      rate,
    }
  })

  // console.log(aged)

  for (let i = 0; i < aged.length; ) {
    if (aged[i].rate > 0.001) {
      i++;
      continue;
    } else {
      // console.log(aged.map(a => a.rate))
      const small = aged.splice(i, 1)[0];
      // console.log(small)
      smallColor = {
        color: small.originColor,
        originColor: small.originColor,
        rate: 0,
      }
      // console.log(smallColor)
    }
  }

  // let smallColor;
  if (aged.length > 1) {
    const smallestColor = aged[0];
    

    smallColor = {
      ...smallColor,
      color: {
        r: Math.floor(lerp(smallestColor.rate, smallestColor.color.r, smallColor.originColor.r)),
        g: Math.floor(lerp(smallestColor.rate, smallestColor.color.g, smallColor.originColor.g)),
        b: Math.floor(lerp(smallestColor.rate, smallestColor.color.b, smallColor.originColor.r)),
      },
      originColor: smallColor.originColor,
      rate: 0,
    }
    console.log(smallColor.originColor, smallColor.color, smallestColor.color)
  }
  

  return aged;
}


function createColorMapper(colors) {
  // let colorRatio = 0;
  // const colors = _colors.map(color => {
  //   colorRatio += 1 / _colors.length;
  //   return ({
  //     ...color,
  //     rate: colorRatio,
  //   })
  // })
  return (p, ux, uy) => {
    const rate = p * 4000 / 255;

    return getGradientedColor(colors, rate)
  }
}


function getGradientedColor(colors, _rate) {
  const rate = _rate > 1 ? 1 : (_rate < 0 ? 0 : _rate);
  let bigColor;
  if (colors.length > 1) {
    // const biggestColor = colors.reduce((p, c) => {
    //   return p.rate <= c.rate ? c : p
    // })
    const biggestColor = colors[colors.length - 1];
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
    small: smallColor,
    big: bigColor
  })

  const bigRate = big.rate > 1 ? 1 : big.rate;
  const ratio = (rate - small.rate) / (bigRate - small.rate);

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
  // console.log(currentColors.map(c => c.rate))
  const mapper = createColorMapper(currentColors)
  fluider.setColorMapper(mapper)
}, 73)

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