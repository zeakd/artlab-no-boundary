import Fluider from './fluid'
import { random, hexToRgb, lerp } from './utils'


const colors = [
  '#ff3000',
  '#e2234c',
  '#fca649',
  '#fcd532',
  '#c1ff4a',
  '#03e574',
  '#82f975',
  '#f7883c',
  '#f95023',
  '#22cefc',
  '#06eaea',
  '#35d2fc',
  '#b688ff',
  '#f97dc1',
  '#fcb1e1',
  '#efb7f7',
  '#fcc0d0',
]



const fluider = new Fluider(document.getElementById('canvas'));
fluider.run();

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

setInterval(() => {
  currentColors = age(currentColors)
  // console.log(currentColors)
  const mapper = createColorMapper(currentColors)
  fluider.setColorMapper(mapper)
}, 100)

setInterval(() => {
  const color = hexToRgb(colors.pop())
  currentColors.push({
    color: color,
    originColor: color,
    rate: 1, 
  })
}, 2000)

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


