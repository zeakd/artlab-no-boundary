export function random(n) {
  return Math.floor(Math.random() * n)
}

export function lerp(c, a, b){
  c = c < 0 ? 0 : (c > 1 ? 1 : c);

  return a * (1 - c) + b * c;
}

export function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
  } : null;
}

export function clamp(a, min, max){
  return Math.max(Math.min(a, max), min);
}

export function fullscreen(el){
  if(el.webkitRequestFullScreen) {
      el.webkitRequestFullScreen();
  }
 else {
    el.mozRequestFullScreen();
 }            
}
