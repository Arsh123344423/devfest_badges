(function () {
  'use strict';
  var THEMES = {
    green:  { color: '#34A853', glow: 'rgba(52,168,83,0.75)',  bg: 'assets/df-story-green.png' },
    yellow: { color: '#F9AB00', glow: 'rgba(249,171,0,0.75)',  bg: 'assets/df-story-yellow.png' },
    blue:   { color: '#4285F4', glow: 'rgba(66,133,244,0.75)', bg: 'assets/df-story-blue.png' },
    red:    { color: '#EA4335', glow: 'rgba(234,67,53,0.75)',  bg: 'assets/df-story-red.png' }
  };
  var CAPTION = "I'll be at #DevFestNoida2026 on 10 October at ExpoInn, Greater Noida. One day, four tracks, a floor full of builders. See you there!";
  var SITE = 'https://devfest2k26.gdgnoida.com';
  var VENUE = '10 October 2026  \u00B7  ExpoInn, Greater Noida';
  var ATTENDING = 'I\u2019m attending DevFest Noida 2026';

  var state = { photo: null, zoom: 1, offsetX: 0, offsetY: 0, format: 'post', theme: 'green', name: '' };
  var bgs = {};
  var canvas = document.getElementById('badge-canvas');
  var ctx = canvas.getContext('2d');
  var $ = function (id) { return document.getElementById(id); };

  Object.keys(THEMES).forEach(function (k) {
    var im = new Image();
    im.onload = function () { bgs[k] = im; draw(); };
    im.src = THEMES[k].bg;
  });
  if (document.fonts) {
    Promise.all([document.fonts.load('700 60px Outfit'), document.fonts.load('600 30px Outfit'), document.fonts.load('500 30px Outfit')]).then(draw, draw);
    document.fonts.ready.then(draw);
  }

  function dims() { return { W: 1080, H: state.format === 'post' ? 1350 : 1920 }; }
  function draw() {
    var d = dims();
    if (canvas.width !== d.W) canvas.width = d.W;
    if (canvas.height !== d.H) canvas.height = d.H;
    drawBadge(ctx, d.W, d.H);
  }

  function roundRect(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function setFont(c, size, weight, ls) {
    c.font = (weight || 500) + ' ' + size + 'px Outfit, sans-serif';
    try { c.letterSpacing = (ls || 0) + 'px'; } catch (e) {}
  }
  function text(c, str, x, y, o) {
    c.save(); setFont(c, o.size, o.weight, o.ls);
    c.fillStyle = o.color; c.textAlign = o.align || 'left'; c.textBaseline = o.baseline || 'top';
    c.fillText(str, x, y); c.restore();
  }
  function measure(c, str, size, weight, ls) {
    c.save(); setFont(c, size, weight, ls); var w = c.measureText(str).width; c.restore(); return w;
  }
  // shrink a font size until the string fits inside maxW
  function fitSize(c, str, size, weight, ls, maxW) {
    while (size > 12 && measure(c, str, size, weight, ls) > maxW) size -= 1;
    return size;
  }

  function drawBadge(c, W, H) {
    var isPost = H === 1350;
    var T = THEMES[state.theme];
    try { c.letterSpacing = '0px'; } catch (e) {}
    c.fillStyle = '#050505'; c.fillRect(0, 0, W, H);
    var bg = bgs[state.theme];
    if (bg) c.drawImage(bg, 0, 0, 1080, H, 0, 0, W, H); // stories are 1080x1920; post crops the top 1350

    var L = isPost
      ? {
          card: { x: 150, y: 420, w: 780, h: 620 },
          attendY: 1066, attendSize: 30,
          nameY: 1106, nameSize: 56,
          venueY: 1176, venueSize: 26,
          solo: { attendY: 1072, attendSize: 36, venueY: 1128, venueSize: 30 },
          pillY: 1240, pillH: 64, pillFont: 26, M: 60
        }
      : {
          card: { x: 120, y: 470, w: 840, h: 880 },
          attendY: 1392, attendSize: 34,
          nameY: 1446, nameSize: 66,
          venueY: 1530, venueSize: 30,
          solo: { attendY: 1410, attendSize: 40, venueY: 1482, venueSize: 34 },
          pillY: 1760, pillH: 76, pillFont: 30, M: 70
        };

    drawPhotoCard(c, L.card, T);

    var maxTextW = W - L.M * 2;
    var nm = (state.name || '').trim();
    var attY = nm ? L.attendY : L.solo.attendY;
    var attSize = fitSize(c, ATTENDING, nm ? L.attendSize : L.solo.attendSize, 600, 0, maxTextW);
    text(c, ATTENDING, W / 2, attY, { size: attSize, weight: 600, color: T.color, align: 'center' });

    if (nm) {
      var nmSize = fitSize(c, nm, L.nameSize, 700, -1, maxTextW);
      text(c, nm, W / 2, L.nameY, { size: nmSize, weight: 700, color: '#FFFFFF', align: 'center', ls: -1 });
      text(c, VENUE, W / 2, L.venueY, { size: L.venueSize, weight: 500, color: 'rgba(255,255,255,0.75)', align: 'center' });
    } else {
      text(c, VENUE, W / 2, L.solo.venueY, { size: L.solo.venueSize, weight: 500, color: 'rgba(255,255,255,0.8)', align: 'center' });
    }
    drawPill(c, L.M, L.pillY, L.pillH, L.pillFont, '#DevFestNoida2026', null, 'left');
    drawPill(c, W - L.M, L.pillY, L.pillH, L.pillFont, 'ATTENDEE', T.color, 'right');
  }

  function drawPill(c, x, y, h, font, label, dot, anchor) {
    var padX = Math.round(h * 0.45), dotR = dot ? Math.round(h * 0.17) : 0, ls = dot ? 2 : 0;
    var tw = measure(c, label, font, 600, ls);
    var w = tw + padX * 2 + (dot ? dotR * 2 + 14 : 0);
    var px = anchor === 'right' ? x - w : x;
    c.save(); c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 16; c.shadowOffsetY = 4;
    c.fillStyle = '#FFFFFF'; roundRect(c, px, y, w, h, h / 2); c.fill(); c.restore();
    var tx = px + padX;
    if (dot) { c.fillStyle = dot; c.beginPath(); c.arc(tx + dotR, y + h / 2, dotR, 0, Math.PI * 2); c.fill(); tx += dotR * 2 + 14; }
    text(c, label, tx, y + h / 2 + 1, { size: font, weight: 600, color: '#202124', baseline: 'middle', ls: ls });
  }

  function drawPhotoCard(c, box, T) {
    var x = box.x, y = box.y, w = box.w, h = box.h, pad = 12, r = 40;
    c.save(); c.shadowColor = T.glow; c.shadowBlur = 70; c.fillStyle = 'rgba(5,5,5,0.72)'; roundRect(c, x, y, w, h, r); c.fill(); c.restore();
    c.save(); c.strokeStyle = T.color; c.lineWidth = 3; roundRect(c, x, y, w, h, r); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1; roundRect(c, x + 1.5, y + 1.5, w - 3, h - 3, r - 1.5); c.stroke(); c.restore();
    var iw = w - pad * 2, ih = h - pad * 2;
    c.save(); roundRect(c, x + pad, y + pad, iw, ih, r - pad); c.clip();
    var cx = x + pad + iw / 2, cy = y + pad + ih / 2, p = state.photo;
    if (p && p.naturalWidth) {
      var s = Math.max(iw / p.naturalWidth, ih / p.naturalHeight) * state.zoom;
      var dw = p.naturalWidth * s, dh = p.naturalHeight * s;
      c.drawImage(p, cx - dw / 2 + state.offsetX, cy - dh / 2 + state.offsetY, dw, dh);
    } else {
      c.fillStyle = '#0B0B0C'; c.fillRect(x + pad, y + pad, iw, ih);
      c.strokeStyle = 'rgba(255,255,255,0.06)'; c.lineWidth = 2;
      for (var k = 0; k < iw + ih; k += 26) { c.beginPath(); c.moveTo(x + pad + k, y + pad); c.lineTo(x + pad + k - ih, y + pad + ih); c.stroke(); }
      text(c, 'drop your photo here', cx, cy - 10, { size: 34, weight: 600, color: '#FFFFFF', align: 'center', baseline: 'middle' });
      text(c, 'the badge updates as you tweak', cx, cy + 30, { size: 20, weight: 400, color: 'rgba(255,255,255,0.55)', align: 'center', baseline: 'middle' });
    }
    c.restore();
  }

  // ---- UI ----
  function syncUI() {
    var has = !!state.photo;
    $('overlay').classList.toggle('hidden', has);
    $('hint').classList.toggle('hidden', !has);
    $('drop-empty').classList.toggle('hidden', has);
    $('drop-loaded').classList.toggle('hidden', !has);
    $('zoom').value = state.zoom;
    $('zoom-label').textContent = state.zoom.toFixed(2) + '\u00D7';
    $('frame').classList.toggle('story', state.format === 'story');
    $('fmt-label').textContent = state.format === 'post' ? '4:5 \u00B7 post \u00B7 1080\u00D71350' : '9:16 \u00B7 story \u00B7 1080\u00D71920';
    document.querySelectorAll('#formats .opt').forEach(function (b) { b.classList.toggle('on', b.dataset.format === state.format); });
    document.querySelectorAll('#themes .opt').forEach(function (b) { b.classList.toggle('on', b.dataset.theme === state.theme); });
    draw();
  }

  function loadFile(file) {
    if (!file || !/image\/(jpe?g|png)/i.test(file.type)) return;
    var img = new Image();
    img.onload = function () { state.photo = img; state.zoom = 1; state.offsetX = 0; state.offsetY = 0; syncUI(); };
    img.src = URL.createObjectURL(file);
  }
  document.querySelectorAll('.file-input').forEach(function (inp) {
    inp.addEventListener('change', function (e) { loadFile(e.target.files && e.target.files[0]); e.target.value = ''; });
  });
  ['drop', 'overlay'].forEach(function (id) {
    var el = $(id);
    el.addEventListener('dragover', function (e) { e.preventDefault(); });
    el.addEventListener('drop', function (e) { e.preventDefault(); loadFile(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]); });
  });

  // drag / pinch / wheel
  var drag = null, pointers = {}, pinch = null;
  canvas.addEventListener('pointerdown', function (e) {
    if (!state.photo) return;
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(pointers);
    if (ids.length === 2) {
      var a = pointers[ids[0]], b = pointers[ids[1]];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: state.zoom }; drag = null;
    } else {
      var rect = canvas.getBoundingClientRect();
      drag = { x: e.clientX, y: e.clientY, ox: state.offsetX, oy: state.offsetY, scale: canvas.width / rect.width };
    }
    canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing';
  });
  canvas.addEventListener('pointermove', function (e) {
    if (pointers[e.pointerId]) pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (pinch) {
      var ids = Object.keys(pointers); if (ids.length < 2) return;
      var a = pointers[ids[0]], b = pointers[ids[1]];
      state.zoom = Math.max(1, Math.min(3, pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d)); syncUI(); return;
    }
    if (!drag) return;
    state.offsetX = drag.ox + (e.clientX - drag.x) * drag.scale;
    state.offsetY = drag.oy + (e.clientY - drag.y) * drag.scale;
    draw();
  });
  function up(e) { delete pointers[e.pointerId]; if (Object.keys(pointers).length < 2) pinch = null; drag = null; canvas.style.cursor = 'grab'; }
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('wheel', function (e) {
    if (!state.photo) return; e.preventDefault();
    state.zoom = Math.max(1, Math.min(3, state.zoom - e.deltaY * 0.002)); syncUI();
  }, { passive: false });

  $('zoom').addEventListener('input', function (e) { state.zoom = +e.target.value; syncUI(); });
  $('name').addEventListener('input', function (e) { state.name = e.target.value; draw(); });
  $('formats').addEventListener('click', function (e) { var b = e.target.closest('[data-format]'); if (!b) return; state.format = b.dataset.format; state.offsetX = 0; state.offsetY = 0; syncUI(); });
  $('themes').addEventListener('click', function (e) { var b = e.target.closest('[data-theme]'); if (!b) return; state.theme = b.dataset.theme; syncUI(); });
  $('reset').addEventListener('click', function () { state.photo = null; state.zoom = 1; state.offsetX = 0; state.offsetY = 0; state.name = ''; $('name').value = ''; syncUI(); });

  $('download').addEventListener('click', function () {
    var d = dims(), c = document.createElement('canvas'); c.width = d.W; c.height = d.H;
    drawBadge(c.getContext('2d'), d.W, d.H);
    c.toBlob(function (blob) {
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'devfest-noida-2026-' + state.theme + '-' + state.format + '.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    }, 'image/png');
  });
  var copyT;
  $('copy').addEventListener('click', function () {
    var b = $('copy');
    (navigator.clipboard ? navigator.clipboard.writeText(CAPTION) : Promise.reject()).catch(function () {}).then(function () {
      b.textContent = '\u2713 Copied'; clearTimeout(copyT); copyT = setTimeout(function () { b.textContent = 'Copy caption'; }, 1800);
    });
  });
  $('share-x').addEventListener('click', function () { window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(CAPTION + ' ' + SITE), '_blank', 'noopener'); });
  $('share-li').addEventListener('click', function () { window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(SITE + '/'), '_blank', 'noopener'); });

  syncUI();
})();