console.log('hi')

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

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 400;

function drawDot(x, y, color) {

  const { r, g, b } = hexToRgb(color);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  // const color = colors[0];
  
  for (let i = x - 40; i < x + 40; i++) {
    for (let j = y - 40; j < y + 40; j++) {
      // console.log(data);
      data[(i + j * canvas.height) * 4 + 0] = r;
      data[(i + j * canvas.height) * 4 + 1] = g;
      data[(i + j * canvas.height) * 4 + 2] = b;
      data[(i + j * canvas.height) * 4 + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

const gaussianKernel = [
  [1,  4,  7,  4,  1],
  [4, 16, 26, 16,  4],
  [7, 26, 41, 26,  7],
  [4, 16, 26, 16,  4],
  [1,  4,  7,  4,  1],
]

const KERNEL_SUM = 273;

function blur() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const bluredImageData = ctx.createImageData(canvas.width, canvas.height);
  const bluredData = bluredImageData.data;

  for (let i = 0; i < canvas.width; i++) {
    for (let j = 0; j < canvas.height; j++) {
     
      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let sumA = 0;

      for (let w= -2; w < 3; w++) {
        for (let h = -2; h < 3; h++) {
          const kernerIdx = ((i + w) + (j + h) * canvas.height) * 4;
          let r, g, b;
          if (kernerIdx < 0 || kernerIdx >= data.length) {
            r = 255;
            g = 255;
            b = 255;
            a = 255;
          } else {
            r = data[kernerIdx];
            g = data[kernerIdx + 1];
            b = data[kernerIdx + 2];
            a = data[kernerIdx + 3];
          }

          sumR += r * gaussianKernel[w + 2][h + 2]
          sumG += g * gaussianKernel[w + 2][h + 2]
          sumB += b * gaussianKernel[w + 2][h + 2]
          sumA += a * gaussianKernel[w + 2][h + 2]

        }
      }

      const idx = (i + j * canvas.height) * 4;

      bluredData[idx] = Math.round(sumR / KERNEL_SUM);
      bluredData[idx + 1] = Math.round(sumG / KERNEL_SUM);
      bluredData[idx + 2] = Math.round(sumB / KERNEL_SUM);
      // bluredData[idx + 3] = (Math.round(sumA / KERNEL_SUM) - 1) > 0 ? Math.round(sumA / KERNEL_SUM) - 1 : 0;
      bluredData[idx + 3] = Math.round(sumA / KERNEL_SUM * 0.99);
      // bluredData[idx] = data[idx];
      // bluredData[idx + 1] = data[idx + 1];
      // bluredData[idx + 2] = data[idx + 2];
    }
  }

  ctx.putImageData(bluredImageData, 0, 0);
}

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

drawDot(100, 100, '#ff0000')
// setInterval(() => {
//   blur()
// }, 30)

setInterval(() => {
  const color = colors[random(colors.length)]
  drawDot(50 + random(200), 50 + random(200), color)
}, 1000)

function random(n) {
  return Math.floor(Math.random() * n)
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
}


function draw() {
  blur()

  window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);