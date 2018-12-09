// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"utils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.random = random;
exports.lerp = lerp;
exports.hexToRgb = hexToRgb;
exports.clamp = clamp;

function random(n) {
  return Math.floor(Math.random() * n);
}

function lerp(c, a, b) {
  c = c < 0 ? 0 : c > 1 ? 1 : c;
  return a * (1 - c) + b * c;
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function clamp(a, min, max) {
  return Math.max(Math.min(a, max), min);
}
},{}],"fluid.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utils = require("./utils");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function sampler(a, width, height, stride, offset) {
  var f = function f(x, y, value) {
    x = (x < 0 ? 0 : x > width - 1 ? width - 1 : x) | 0;
    y = (y < 0 ? 0 : y > height - 1 ? height - 1 : y) | 0;

    if (value !== undefined) {
      a[(x + y * width) * stride + offset] = value;
    } else {
      return a[(x + y * width) * stride + offset];
    }
  };

  f.a = a;
  return f;
}

var Fluider =
/*#__PURE__*/
function () {
  function Fluider(canvas) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$step = _ref.step,
        step = _ref$step === void 0 ? 4.0 : _ref$step,
        _ref$color = _ref.color,
        color = _ref$color === void 0 ? '#ff3000' : _ref$color;

    _classCallCheck(this, Fluider);

    this.canvas = canvas;
    this.WIDTH = canvas.width;
    this.HEIGHT = canvas.height;
    this.ctx = canvas.getContext('2d');
    this.step = step;
    this.color = color;
    this.animate = this.animate.bind(this);
    this.setColor = this.setColor.bind(this);

    this.colorMapper = function (p, ux, uy) {
      var rate = p * 555 / 255;
      var srcColor = (0, _utils.hexToRgb)('#FFFFFF');
      var destColor = (0, _utils.hexToRgb)('#fca649');
      return {
        r: (0, _utils.lerp)(rate, srcColor.r, destColor.r),
        g: (0, _utils.lerp)(rate, srcColor.g, destColor.g),
        b: (0, _utils.lerp)(rate, srcColor.b, destColor.b)
      };
    };
  }

  _createClass(Fluider, [{
    key: "setColor",
    value: function setColor(color) {
      this.color = (0, _utils.hexToRgb)(color) || (0, _utils.hexToRgb)('#ff3000');
    }
  }, {
    key: "setColorMapper",
    value: function setColorMapper(func) {
      this.colorMapper = func;
    }
  }, {
    key: "run",
    value: function run() {
      var _this = this;

      this.setColor(this.color);
      this.sx = this.canvas.width / this.canvas.clientWidth;
      this.sy = this.canvas.height / this.canvas.clientHeight;
      this.mouseX = 0;
      this.mouseY = 0;
      var rect = this.canvas.getBoundingClientRect();
      this.left = rect.left;
      this.top = rect.top;
      window.addEventListener('mousemove', function (e) {
        _this.mouseX = e.clientX - _this.left | 0, _this.mouseY = e.clientY - _this.top | 0;
      });
      this.lastMouseX = this.mouseX;
      this.lastMouseY = this.mouseY; // 

      this.pointX = 100;
      this.pointY = 100;
      this.prevPointX = this.pointX;
      this.prevPointY = this.pointY;
      var WIDTH = this.WIDTH;
      var HEIGHT = this.HEIGHT;
      this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
      this.imageData = this.ctx.getImageData(0, 0, WIDTH, HEIGHT);
      this.velocityField0 = new Float32Array(WIDTH * HEIGHT * 2);
      this.u0x = sampler(this.velocityField0, WIDTH, HEIGHT, 2, 0);
      this.u0y = sampler(this.velocityField0, WIDTH, HEIGHT, 2, 1);
      this.velocityField1 = new Float32Array(WIDTH * HEIGHT * 2);
      this.u1x = sampler(this.velocityField1, WIDTH, HEIGHT, 2, 0);
      this.u1y = sampler(this.velocityField1, WIDTH, HEIGHT, 2, 1);
      this.pressureField0 = new Float32Array(WIDTH * HEIGHT);
      this.p0 = sampler(this.pressureField0, WIDTH, HEIGHT, 1, 0);
      this.pressureField1 = new Float32Array(WIDTH * HEIGHT);
      this.p1 = sampler(this.pressureField1, WIDTH, HEIGHT, 1, 0);
      this.divergenceField = new Float32Array(WIDTH * HEIGHT);
      this.div = sampler(this.divergenceField, WIDTH, HEIGHT, 1, 0);

      for (var i = 0; i < this.pressureField0.length; i++) {
        this.pressureField0[i] = 0;
        this.pressureField1[i] = this.pressureField0[i];
      }

      for (var _i = 0; _i < this.velocityField0.length; _i++) {
        this.velocityField1[_i] = this.velocityField0[_i];
      }

      this.velocityBoundary();
      this.animate(); // setInterval(() => {
      //   this.move(this.pointX - 10 + random(20), this.pointX - 10 + random(20));
      // }, 100)
    }
  }, {
    key: "simulate",
    value: function simulate() {
      this.velocityBoundary();
      this.advect(this.u0x, this.u1x);
      this.advect(this.u0y, this.u1y);
      this.addMouseForce(); // this.move(this.pointX - 1 + random(3), this.pointY - 1 + random(3))
      // this.addPoint();

      this.computeDivergence();
      this.fastjacobi(this.p0, this.p1, this.div, -1, 0.25, 10);
      this.subtractPressureGradient();
      var aux = this.p0;
      this.p0 = this.p1;
      this.p1 = aux;
      aux = this.u0x;
      this.u0x = this.u1x;
      this.u1x = aux;
      aux = this.u0y;
      this.u0y = this.u1y;
      this.u1y = aux;
    }
  }, {
    key: "move",
    value: function move(x, y) {
      this.pointX = x;
      this.pointY = y;
    }
  }, {
    key: "addPoint",
    value: function addPoint() {
      var ux = this.u1x;
      var uy = this.u1y;
      var x = (0, _utils.clamp)(this.pointX, 10, this.WIDTH - 11);
      var y = (0, _utils.clamp)(this.pointY, 10, this.HEIGHT - 11);
      var dx = this.pointX - this.prevPointX;
      var dy = this.pointY - this.prevPointY;
      this.prevPointX = this.pointX;
      this.prevPointY = this.pointX;
      ux(x, y, ux(x, y) - dx);
      uy(x, y, uy(x, y) - dy);
    }
  }, {
    key: "addMouseForce",
    value: function addMouseForce() {
      var ux = this.u1x;
      var uy = this.u1y;
      var x = (0, _utils.clamp)(this.mouseX * this.sx, 1, this.WIDTH - 2);
      var y = (0, _utils.clamp)(this.mouseY * this.sy, 1, this.HEIGHT - 2); // console.log(x, y);

      var dx = this.mouseX - this.lastMouseX;
      var dy = this.mouseY - this.lastMouseY; // console.log(dx, dy);

      this.lastMouseX = this.mouseX;
      this.lastMouseY = this.mouseY;
      ux(x, y, ux(x, y) - dx);
      uy(x, y, uy(x, y) - dy);
    }
  }, {
    key: "velocityBoundary",
    value: function velocityBoundary() {
      var WIDTH = this.WIDTH;
      var HEIGHT = this.HEIGHT;
      var ux = this.u0x;
      var uy = this.u0y;

      for (var x = 0; x < WIDTH; x++) {
        ux(x, 0, -ux(x, 1));
        uy(x, 0, -uy(x, 1));
        ux(x, HEIGHT - 1, -ux(x, HEIGHT - 2));
        uy(x, HEIGHT - 1, -uy(x, HEIGHT - 2));
      }

      for (var y = 0; y < HEIGHT; y++) {
        ux(0, y, -ux(1, y));
        uy(0, y, -uy(1, y));
        ux(WIDTH - 1, y, -ux(WIDTH - 2, y));
        uy(WIDTH - 1, y, -uy(WIDTH - 2, y));
      }
    }
  }, {
    key: "advect",
    value: function advect(src, dest) {
      var WIDTH = this.WIDTH;
      var HEIGHT = this.HEIGHT;
      var ux = this.u0x;
      var uy = this.u0y;
      var step = this.step;

      for (var y = 1; y < HEIGHT - 1; y++) {
        for (var x = 1; x < WIDTH - 1; x++) {
          var vx = ux(x, y) * step;
          var vy = uy(x, y) * step;
          dest(x, y, this.bilerp(src, x + vx, y + vy));
        }
      }
    }
  }, {
    key: "bilerp",
    value: function bilerp(sample, x, y) {
      var x0 = ~~x;
      var y0 = ~~y;
      var x1 = x0 + 1;
      var y1 = y0 + 1;
      var p00 = sample(x0, y0);
      var p01 = sample(x0, y1);
      var p10 = sample(x1, y0);
      var p11 = sample(x1, y1);
      return (0, _utils.lerp)(y - y0, (0, _utils.lerp)(x - x0, p00, p10), (0, _utils.lerp)(x - x0, p01, p11));
    }
  }, {
    key: "computeDivergence",
    value: function computeDivergence() {
      var WIDTH = this.WIDTH;
      var HEIGHT = this.HEIGHT;
      var ux = this.u1x;
      var uy = this.u1y;
      var div = this.div;

      for (var y = 1; y < HEIGHT - 1; y++) {
        for (var x = 1; x < WIDTH - 1; x++) {
          // compute divergence using central difference
          var x0 = ux(x - 1, y);
          var x1 = ux(x + 1, y);
          var y0 = uy(x, y - 1);
          var y1 = uy(x, y + 1);
          div(x, y, (x1 - x0 + y1 - y0) * 0.5);
        }
      }
    }
  }, {
    key: "fastjacobi",
    value: function fastjacobi(p0, p1, b, alpha, beta, iterations) {
      var WIDTH = this.WIDTH;
      var HEIGHT = this.HEIGHT;
      p0 = p0.a;
      p1 = p1.a;
      b = b.a; //for(var i = 0; i < pressureField0.length; i++) {
      //pressureField0[i] = 0.5;
      //pressureField1[i] = pressureField0[i];
      //}

      for (var i = 0; i < iterations; i++) {
        for (var y = 1; y < HEIGHT - 1; y++) {
          for (var x = 1; x < WIDTH - 1; x++) {
            var pi = x + y * WIDTH;
            var x0 = p0[pi - 1];
            var x1 = p0[pi + 1];
            var y0 = p0[pi - WIDTH];
            var y1 = p0[pi + WIDTH];
            p1[pi] = (x0 + x1 + y0 + y1 + alpha * b[pi]) * beta;
          }
        }

        var aux = p0;
        p0 = p1;
        p1 = aux; //pressureboundary(p0);
      }
    }
  }, {
    key: "subtractPressureGradient",
    value: function subtractPressureGradient() {
      var ux = this.u1x;
      var uy = this.u1y;
      var p = this.p0;
      var WIDTH = this.WIDTH;
      var HEIGHT = this.HEIGHT;

      for (var y = 1; y < HEIGHT - 1; y++) {
        for (var x = 1; x < WIDTH - 1; x++) {
          var x0 = p(x - 1, y);
          var x1 = p(x + 1, y);
          var y0 = p(x, y - 1);
          var y1 = p(x, y + 1);
          var dx = (x1 - x0) / 2;
          var dy = (y1 - y0) / 2;
          ux(x, y, ux(x, y) - dx);
          uy(x, y, uy(x, y) - dy);
        }
      }
    }
  }, {
    key: "draw",
    value: function draw() {
      var WIDTH = this.WIDTH;
      var HEIGHT = this.HEIGHT;
      var data = this.imageData.data;
      var p = this.p0;
      var ux = this.u0x;
      var uy = this.u0y;
      var colorMapper = this.colorMapper;

      for (var y = 0; y < HEIGHT; y++) {
        for (var x = 0; x < WIDTH; x++) {
          var offset = (y * WIDTH + x) * 4;

          var _colorMapper = colorMapper(p(x, y), ux(x, y), uy(x, y)),
              r = _colorMapper.r,
              g = _colorMapper.g,
              b = _colorMapper.b;

          data[offset + 0] = Math.floor(r);
          data[offset + 1] = Math.floor(g);
          data[offset + 2] = Math.floor(b); // data[offset + 3] = 255;
        }
      }

      this.ctx.putImageData(this.imageData, 0, 0);
    }
  }, {
    key: "animate",
    value: function animate() {
      this.simulate();
      this.draw();
      window.requestAnimationFrame(this.animate);
    }
  }]);

  return Fluider;
}();

var _default = Fluider;
exports.default = _default;
},{"./utils":"utils.js"}],"main.js":[function(require,module,exports) {
"use strict";

var _fluid = _interopRequireDefault(require("./fluid"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var colors = ['#ff3000', '#e2234c', '#fca649', '#fcd532', '#c1ff4a', '#03e574', '#82f975', '#f7883c', '#f95023', '#22cefc', '#06eaea', '#35d2fc', '#b688ff', '#f97dc1', '#fcb1e1', '#efb7f7', '#fcc0d0'];
var fluider = new _fluid.default(document.getElementById('canvas'));
fluider.run();
var currentColors = [];

function age(colors) {
  var aged = colors.map(function (_ref) {
    var originColor = _ref.originColor,
        prevRate = _ref.rate;
    var rate = prevRate - 0.01;
    rate = rate < 0 ? 0 : rate > 1 ? 1 : rate;
    var color = {
      r: (0, _utils.lerp)(rate, 255, originColor.r),
      g: (0, _utils.lerp)(rate, 255, originColor.g),
      b: (0, _utils.lerp)(rate, 255, originColor.b)
    };
    return {
      color: color,
      originColor: originColor,
      rate: rate
    };
  }).filter(function (_ref2) {
    var rate = _ref2.rate;
    return rate > 0;
  });
  return aged;
}

setInterval(function () {
  currentColors = age(currentColors); // console.log(currentColors)

  var mapper = createColorMapper(currentColors);
  fluider.setColorMapper(mapper);
}, 100);
setInterval(function () {
  var color = (0, _utils.hexToRgb)(colors.pop());
  currentColors.push({
    color: color,
    originColor: color,
    rate: 1
  });
}, 2000);

function createColorMapper(colors) {
  return function (p, ux, uy) {
    var rate = p * 555 / 255;
    return getGradientedColor(colors, rate);
  };
}

function getGradientedColor(colors, _rate) {
  var rate = _rate > 1 ? 1 : _rate < 0 ? 0 : _rate;
  var bigColor;

  if (colors.length > 1) {
    var biggestColor = colors.reduce(function (p, c) {
      return p.rate <= c.rate ? c : p;
    });
    bigColor = {
      color: biggestColor.originColor,
      rate: 1
    };
  } else {
    bigColor = {
      color: {
        r: 255,
        g: 255,
        b: 255
      },
      rate: 1
    };
  }

  var _colors$reduce = colors.reduce(function (p, c) {
    if (p.small.rate <= c.rate && c.rate < rate) {
      return {
        small: c,
        big: p.big
      };
    }

    if (p.big.rate >= c.rate && c.rate >= rate) {
      return {
        small: p.small,
        big: c
      };
    }

    return p;
  }, {
    small: {
      color: {
        r: 255,
        g: 255,
        b: 255
      },
      rate: 0
    },
    big: bigColor
  }),
      small = _colors$reduce.small,
      big = _colors$reduce.big;

  var ratio = (rate - small.rate) / (big.rate - small.rate);
  var color = {
    r: (0, _utils.lerp)(ratio, small.color.r, big.color.r),
    g: (0, _utils.lerp)(ratio, small.color.g, big.color.g),
    b: (0, _utils.lerp)(ratio, small.color.b, big.color.b)
  };

  if (isNaN(color.r)) {
    console.log(color, small, big, rate);
    throw new Error('NaN');
  }

  return color;
}
},{"./fluid":"fluid.js","./utils":"utils.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "60158" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","main.js"], null)
//# sourceMappingURL=/main.1f19ae8e.map