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
})({"fluid-test-2.js":[function(require,module,exports) {
(function () {
  var canvas = document.getElementById('c'),
      WIDTH = canvas.width,
      HEIGHT = canvas.height,
      sx = canvas.width / canvas.clientWidth,
      sy = canvas.height / canvas.clientHeight,
      ctx = canvas.getContext('2d');
  var mouseX = 0,
      mouseY = 0;

  (function () {
    var rect = canvas.getBoundingClientRect(),
        left = rect.left,
        top = rect.top;
    canvas.addEventListener('mousemove', function (e) {
      mouseX = e.clientX - left | 0, mouseY = e.clientY - top | 0;
    });
  })(); //   setInterval(() => {
  //     mouseX = 50 + Math.floor(Math.random() * 200)
  //     mouseY = 50 + Math.floor(Math.random() * 200)
  //   }, 100)


  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  var imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  velocityField0 = new Float32Array(WIDTH * HEIGHT * 2), u0x = sampler(velocityField0, WIDTH, HEIGHT, 2, 0), u0y = sampler(velocityField0, WIDTH, HEIGHT, 2, 1), velocityField1 = new Float32Array(WIDTH * HEIGHT * 2), u1x = sampler(velocityField1, WIDTH, HEIGHT, 2, 0), u1y = sampler(velocityField1, WIDTH, HEIGHT, 2, 1), pressureField0 = new Float32Array(WIDTH * HEIGHT), p0 = sampler(pressureField0, WIDTH, HEIGHT, 1, 0), pressureField1 = new Float32Array(WIDTH * HEIGHT), p1 = sampler(pressureField1, WIDTH, HEIGHT, 1, 0), divergenceField = new Float32Array(WIDTH * HEIGHT), div = sampler(divergenceField, WIDTH, HEIGHT, 1, 0), step = 4.0;

  for (var i = 0; i < pressureField0.length; i++) {
    pressureField0[i] = 0;
    pressureField1[i] = pressureField0[i];
  }

  for (i = 0; i < velocityField0.length; i++) {
    //velocityField0[i] = (Math.random()-0.5)*10.0;
    velocityField1[i] = velocityField0[i];
  }

  velocityboundary(u0x, u0y);

  function simulate() {
    velocityboundary(u0x, u0y);
    advect(u0x, u0y, u0x, u1x, step);
    advect(u0x, u0y, u0y, u1y, step);
    addMouseForce(u1x, u1y);
    computeDivergence(u1x, u1y, div); // needs an even number of iterations

    fastjacobi(p0, p1, div, -1, 0.25, 20); //advect(u1x, u1y, p0, p1);
    //velocityField0 = diffuse(velocityField1, pressureField);
    //pressureField = recomputePressure(velocityField0);

    subtractPressureGradient(u1x, u1y, p0);
    var aux = p0;
    p0 = p1;
    p1 = aux;
    aux = u0x;
    u0x = u1x;
    u1x = aux;
    aux = u0y;
    u0y = u1y;
    u1y = aux;
  }

  var lastMouseX = mouseX,
      lastMouseY = mouseY;

  function addMouseForce(ux, uy) {
    var x = clamp(mouseX * sx, 1, WIDTH - 2),
        y = clamp(mouseY * sy, 1, HEIGHT - 2),
        dx = mouseX - lastMouseX,
        dy = mouseY - lastMouseY;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    ux(x, y, ux(x, y) - dx * 2);
    uy(x, y, uy(x, y) - dy * 2);
  }

  function pressureboundary(p) {
    for (var x = 0; x < WIDTH; x++) {
      p(x, 0, p(x, 1));
      p(x, HEIGHT - 1, p(x, HEIGHT - 2));
    }

    for (var y = 0; y < HEIGHT; y++) {
      p(0, y, p(1, y));
      p(WIDTH - 1, y, p(WIDTH - 2, y));
    }
  }

  function velocityboundary(ux, uy) {
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

  function clamp(a, min, max) {
    return Math.max(Math.min(a, max), min);
  }

  function lerp(a, b, c) {
    c = c < 0 ? 0 : c > 1 ? 1 : c; //c = clamp(c, 0, 1);

    return a * (1 - c) + b * c;
  }

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

  function bilerp(sample, x, y) {
    var x0 = ~~x,
        y0 = ~~y,
        x1 = x0 + 1,
        y1 = y0 + 1,
        p00 = sample(x0, y0),
        p01 = sample(x0, y1),
        p10 = sample(x1, y0),
        p11 = sample(x1, y1);
    return lerp(lerp(p00, p10, x - x0), lerp(p01, p11, x - x0), y - y0);
  }

  function advect(ux, uy, src, dest, t) {
    for (var y = 1; y < HEIGHT - 1; y++) {
      for (var x = 1; x < WIDTH - 1; x++) {
        var vx = ux(x, y) * t,
            vy = uy(x, y) * t;
        dest(x, y, bilerp(src, x + vx, y + vy));
      }
    }
  }

  function computeDivergence(ux, uy, div) {
    for (var y = 1; y < HEIGHT - 1; y++) {
      for (var x = 1; x < WIDTH - 1; x++) {
        // compute divergence using central difference
        var x0 = ux(x - 1, y),
            x1 = ux(x + 1, y),
            y0 = uy(x, y - 1),
            y1 = uy(x, y + 1);
        div(x, y, (x1 - x0 + y1 - y0) * 0.5);
      }
    }
  } // x = p
  // b = div


  function jacobi(p0, p1, b, alpha, beta, iterations) {
    for (var i = 0; i < pressureField0.length; i++) {
      pressureField0[i] = 0.5;
      pressureField1[i] = pressureField0[i];
    }

    for (i = 0; i < iterations; i++) {
      for (var y = 1; y < HEIGHT - 1; y++) {
        for (var x = 1; x < WIDTH - 1; x++) {
          var x0 = p0(x - 1, y),
              x1 = p0(x + 1, y),
              y0 = p0(x, y - 1),
              y1 = p0(x, y + 1);
          p1(x, y, (x0 + x1 + y0 + y1 + alpha * b(x, y)) * beta);
        }
      }

      var aux = p0;
      p0 = p1;
      p1 = aux;
      pressureboundary(p0);
    }
  }

  function fastjacobi(p0, p1, b, alpha, beta, iterations) {
    p0 = p0.a;
    p1 = p1.a;
    b = b.a; //for(var i = 0; i < pressureField0.length; i++) {
    //pressureField0[i] = 0.5;
    //pressureField1[i] = pressureField0[i];
    //}

    for (i = 0; i < iterations; i++) {
      for (var y = 1; y < HEIGHT - 1; y++) {
        for (var x = 1; x < WIDTH - 1; x++) {
          var pi = x + y * WIDTH,
              x0 = p0[pi - 1],
              x1 = p0[pi + 1],
              y0 = p0[pi - WIDTH],
              y1 = p0[pi + WIDTH];
          p1[pi] = (x0 + x1 + y0 + y1 + alpha * b[pi]) * beta;
        }
      }

      var aux = p0;
      p0 = p1;
      p1 = aux; //pressureboundary(p0);
    }
  }

  function subtractPressureGradient(ux, uy, p) {
    for (var y = 1; y < HEIGHT - 1; y++) {
      for (var x = 1; x < WIDTH - 1; x++) {
        var x0 = p(x - 1, y),
            x1 = p(x + 1, y),
            y0 = p(x, y - 1),
            y1 = p(x, y + 1),
            dx = (x1 - x0) / 2,
            dy = (y1 - y0) / 2;
        ux(x, y, ux(x, y) - dx);
        uy(x, y, uy(x, y) - dy);
      }
    }
  }

  function draw(ux, uy, p) {
    var d = imageData.data,
        di,
        pi,
        ui;

    for (var y = 0; y < HEIGHT; y++) {
      for (var x = 0; x < WIDTH; x++) {
        pi = y * WIDTH + x;
        ui = pi * 2;
        di = pi * 4;
        d[di + 0] = p(x, y) * 555;
        d[di + 1] = ux(x, y) * 128 + 128;
        d[di + 2] = uy(x, y) * 128 + 128;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  var requestAnimationFrame = window.requestAnimationFrame;

  (function animate() {
    simulate();
    draw(u0x, u0y, p0);
    requestAnimationFrame(animate);
  })();
})();
},{}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "63466" + '/');

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
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","fluid-test-2.js"], null)
//# sourceMappingURL=/fluid-test-2.4143aa5e.map