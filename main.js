(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // theme toggle
  var btn = document.getElementById('theme-toggle');
  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // count-up for the headline numbers
  document.querySelectorAll('[data-count]').forEach(function (el) {
    if (reduce) return;
    var target = +el.dataset.count, suffix = el.dataset.suffix || '', t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / 1100, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0' + suffix;
    requestAnimationFrame(step);
  });

  // lightweight node-network background (plain canvas, no libraries)
  var canvas = document.getElementById('bg');
  if (!canvas || reduce) return;
  var ctx = canvas.getContext('2d'), w, h, dpr, nodes = [], mouse = { x: -999, y: -999 };

  function color(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr; h = canvas.height = innerHeight * dpr;
    var n = Math.min(70, Math.floor(innerWidth / 18));
    nodes = [];
    for (var i = 0; i < n; i++) nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .25 * dpr, vy: (Math.random() - .5) * .25 * dpr });
  }
  addEventListener('resize', resize);
  addEventListener('mousemove', function (e) { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });

  var running = true;
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden; if (running) draw();
  });

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    var a = color('--accent'), max = 150 * dpr;
    ctx.fillStyle = a;
    for (var i = 0; i < nodes.length; i++) {
      var p = nodes[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.globalAlpha = .8;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.6 * dpr, 0, 6.283); ctx.fill();
      for (var j = i + 1; j < nodes.length; j++) {
        var q = nodes[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < max) {
          ctx.globalAlpha = (1 - d / max) * .3;
          ctx.strokeStyle = a; ctx.lineWidth = dpr * .8;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      var dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dm < max * 1.3) {
        ctx.globalAlpha = (1 - dm / (max * 1.3)) * .45;
        ctx.strokeStyle = color('--accent-2');
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  }
  resize(); draw();
})();

// scroll progress, card spotlight, typed roles
(function () {
  var bar = document.getElementById('progress');
  function onScroll() {
    var max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  document.querySelectorAll('.card,.case,.mini').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  var el = document.getElementById('typed');
  var words = ['REST APIs in Node.js and FastAPI', 'RAG pipelines on vector search', 'LLM agents with real tools', 'data models that scale'];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = words[0]; return; }
  var w = 0, i = 0, del = false;
  (function tick() {
    var word = words[w];
    el.textContent = word.slice(0, i);
    if (!del && i === word.length) { del = true; return setTimeout(tick, 1600); }
    if (del && i === 0) { del = false; w = (w + 1) % words.length; }
    i += del ? -1 : 1;
    setTimeout(tick, del ? 28 : 55);
  })();
})();
