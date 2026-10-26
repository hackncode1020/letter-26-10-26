// 💌 Open this letter — made by @hack.n.code
(() => {
  const $ = s => document.querySelector(s);
  const P = new URLSearchParams(location.search);
  const CAPTURE = P.get('capture') === '1';
  const clean = (s, n) => (s || '').replace(/[<>]/g, '').trim().slice(0, n);
  const NAME = clean(P.get('name'), 30);
  const DEFAULT_MSG = "From the very first hello,\nyou became my favourite code.\nEvery late night, every tiny bug,\nI think of you. 💭\nYou are my forever loop. ♾️\nFor your love 💖";
  const MSG = clean(P.get('msg'), 320) || DEFAULT_MSG;
  const DEAR = `Dear ${NAME || 'you'},`;
  $('.mini-dear').textContent = DEAR;
  if (NAME) document.title = `A letter for ${NAME} 💌 · @hack.n.code`;

  // ---------- helpers ----------
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lin = (t, a, b) => clamp((t - a) / (b - a));
  const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const eout = x => 1 - Math.pow(1 - x, 3);
  const eback = x => { const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // ---------- typing schedule ----------
  const T_TYPE = 2.75, CPS = 27;
  const chars = []; // [char, time, part]
  let tt = T_TYPE;
  for (const c of Array.from(DEAR)) { chars.push([c, tt, 0]); tt += 1 / CPS; }
  tt += .35;
  for (const c of Array.from(MSG)) { chars.push([c, tt, 1]); tt += c === '\n' ? .2 : (c === ',' || c === '.') ? .1 : 1 / CPS; }
  const T_END = tt;

  // ---------- canvases ----------
  const bg = $('#bg'), fx = $('#fx'), bx = bg.getContext('2d'), fc = fx.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    for (const c of [bg, fx]) { c.width = W * DPR; c.height = H * DPR; }
    bx.setTransform(DPR, 0, 0, DPR, 0, 0); fc.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize(); addEventListener('resize', resize);
  function heart(ctx, x, y, s, rot, color, a) {
    if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s / 20, s / 20); ctx.globalAlpha = a; ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(0, 7);
    ctx.bezierCurveTo(-13, -2, -10, -14, 0, -7); ctx.bezierCurveTo(10, -14, 13, -2, 0, 7); ctx.fill(); ctx.restore();
  }
  function petal(ctx, x, y, s, rot, color, a) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = a; ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(0, 0, s * .5, s * .28, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  const r1 = rng(7), DRIFT = Array.from({ length: 34 }, () => ({ x: r1(), y: r1(), s: 8 + r1() * 16, v: 18 + r1() * 34, f: .4 + r1() * .9, ph: r1() * 6.28, kind: r1() < .55 ? 'h' : 'p', c: ['#ff6b96', '#ff94b4', '#ffc1d3', '#e8456f'][Math.floor(r1() * 4)], a: .25 + r1() * .45 }));
  const r2 = rng(21), PUFF = Array.from({ length: 22 }, (_, i) => ({ bt: .55 + i * .065, dx: (r2() - .5), v: 70 + r2() * 110, s: 8 + r2() * 12, sw: r2() * 6.28, c: ['#ff4d84', '#ff86a8', '#ffd0dc', '#ff2a68'][Math.floor(r2() * 4)] }));
  const r3 = rng(99), BURST = Array.from({ length: 80 }, () => ({ ang: r3() * Math.PI * 2, sp: 140 + r3() * 380, s: 9 + r3() * 18, life: 1.5 + r3() * 1.1, rot: (r3() - .5) * 2, c: ['#ff4d84', '#ff86a8', '#ffd0dc', '#ff1f5a', '#ffb3c8'][Math.floor(r3() * 5)], d: r3() * .25 }));

  // ---------- elements ----------
  const env = $('#env'), envWrap = $('#envWrap'), flap = $('#flap'), seal = $('#seal'), mini = $('#mini'), hint = $('#hint');
  const L = seal.querySelector('.half.l'), R = seal.querySelector('.half.r');
  const mouth = $('#mouth'), aura = $('#aura');
  const paper = $('#paper'), dearEl = $('#dear'), msgEl = $('#msg'), sigtext = $('#sigtext'), sigpath = $('#sigpath'), glow = $('#glow'), fold = $('#foldline');
  let burstOrigin = null;

  function render(gt, T) {
    // background drift
    bx.clearRect(0, 0, W, H);
    for (const d of DRIFT) {
      const y = ((d.y * (H + 80) + d.v * gt) % (H + 80)) - 40;
      const x = d.x * W + Math.sin(gt * d.f + d.ph) * 26;
      if (d.kind === 'h') heart(bx, x, y, d.s, Math.sin(gt * d.f + d.ph) * .5, d.c, d.a);
      else petal(bx, x, y, d.s, gt * d.f + d.ph, d.c, d.a * .8);
    }
    const opened = T >= 0;
    // seal idle pulse + crack
    const pulse = 1 + .045 * Math.sin(gt * 4.2);
    if (!opened) {
      seal.style.transform = `translate(-50%,-50%) scale(${pulse})`;
      seal.style.filter = `drop-shadow(0 0 ${10 + 8 * Math.sin(gt * 4.2)}px rgba(255,40,80,.95))`;
      L.style.transform = R.style.transform = ''; L.style.opacity = R.style.opacity = 1;
    } else {
      const k = lin(T, 0, .9);
      seal.style.transform = `translate(-50%,-50%) scale(${1 + .12 * Math.sin(Math.min(1, T / .12) * Math.PI)})`;
      seal.style.filter = `drop-shadow(0 0 ${14 * (1 - k)}px rgba(255,40,80,.95))`;
      const g = 260 * k * k;
      L.style.transform = `translate(${-40 * eout(k)}px,${g}px) rotate(${-38 * k}deg)`;
      R.style.transform = `translate(${40 * eout(k)}px,${g}px) rotate(${38 * k}deg)`;
      L.style.opacity = R.style.opacity = 1 - lin(T, .35, .8);
    }
    hint.style.opacity = opened ? 1 - lin(T, 0, .3) : .65 + .35 * Math.sin(gt * 3);
    // flap
    const fa = opened ? 178 * eio(lin(T, .25, 1.05)) : 0;
    flap.style.transform = `perspective(700px) rotateX(${fa}deg)`;
    flap.style.zIndex = fa > 90 ? 1 : 4;
    flap.style.background = fa > 90 ? 'linear-gradient(0deg,#e07a93,#c75b76)' : '';
    // mini letter rise
    const eh = env.offsetHeight;
    const rise = opened ? eout(lin(T, .95, 1.9)) * eh * .82 : 0;
    mini.style.transform = `translateY(${-rise}px)`;
    // glow
    mouth.style.opacity = opened ? lin(T, .5, 1.2) * (1 - .3 * lin(T, 1.6, 2.2)) : 0;
    aura.style.opacity = .55 + .2 * Math.sin(gt * 3) + (opened ? .45 * lin(T, .6, 1.4) : 0);
    glow.style.opacity = .55 + .1 * Math.sin(gt * 2) + (opened ? .45 * lin(T, .8, 1.8) : 0);
    // envelope leaves, paper unfolds
    const out = opened ? eio(lin(T, 1.95, 2.5)) : 0;
    envWrap.style.transform = `translate(-50%,-50%) translateY(${out * 46}vh) scale(${1 - .15 * out})`;
    envWrap.style.opacity = 1 - lin(T, 1.95, 2.35);
    const pin = opened ? lin(T, 1.95, 2.3) : 0;
    const unf = opened ? eout(lin(T, 2.0, 2.75)) : 0;
    paper.style.visibility = pin > 0 ? 'visible' : 'hidden';
    paper.style.opacity = pin;
    paper.style.transform = `translate(-50%,-50%) translateY(${(1 - eout(lin(T, 1.95, 2.6))) * -60}px) scale(${.78 + .22 * eout(lin(T, 1.95, 2.6))}) perspective(900px) rotateX(${(1 - unf) * 26}deg)`;
    paper.style.clipPath = `inset(0 0 ${(1 - unf) * 64}% 0 round 10px)`;
    fold.style.top = `${(1 - (1 - unf) * .64) * 100 - 1}%`; fold.style.opacity = unf < 1 ? 1 : .55;
    // typing
    let dh = '', mh = '', n = 0;
    if (opened) for (const [c, t, part] of chars) { if (t > T) break; n++; if (part === 0) dh += c; else mh += c; }
    const typing = opened && T >= T_TYPE && T < T_END + .4;
    const blink = Math.floor(gt * 2.5) % 2 === 0 || (n < chars.length && opened && T >= T_TYPE);
    const caret = typing && blink ? '<span class="caret"></span>' : '';
    const inDear = n <= Array.from(DEAR).length && n < chars.length;
    dearEl.innerHTML = esc(dh) + (inDear ? caret : '');
    msgEl.innerHTML = esc(mh) + (!inDear ? caret : '');
    // signature + burst
    const sa = opened ? lin(T, T_END + .1, T_END + .5) : 0;
    sigtext.style.opacity = sa;
    sigpath.style.strokeDashoffset = 320 * (1 - (opened ? eio(lin(T, T_END + .3, T_END + 1.15)) : 0));
    sigpath.style.fill = `rgba(255,40,90,${opened ? lin(T, T_END + 1.0, T_END + 1.4) : 0})`;
    // fx canvas
    fc.clearRect(0, 0, W, H);
    if (opened) {
      const er = env.getBoundingClientRect();
      const mx = er.left + er.width / 2, my = er.top + er.height * .12;
      for (const p of PUFF) {
        const a = T - p.bt; if (a < 0 || a > 2.2) continue;
        const al = Math.min(1, a / .2) * (1 - a / 2.2) * (1 - out * .5);
        heart(fc, mx + p.dx * er.width * .6 + Math.sin(a * 3 + p.sw) * 14, my - p.v * a - 20 * a * a, p.s * (1 + a * .3), Math.sin(a * 2 + p.sw) * .4, p.c, al);
      }
      const bt = T - (T_END + 1.0);
      if (bt >= 0 && bt < 3.6) {
        if (!burstOrigin || bt < .02) { const r = $('.sigheart').getBoundingClientRect(); const pr = paper.getBoundingClientRect(); burstOrigin = [(r.left + r.width / 2 + pr.left + pr.width / 2) / 2, (r.top + r.height / 2 + pr.top + pr.height * .55) / 2]; }
        for (const p of BURST) {
          const a = bt - p.d; if (a < 0 || a > p.life) continue;
          const dist = p.sp * (1 - Math.exp(-a * 2.2)) / 2.2;
          const x = burstOrigin[0] + Math.cos(p.ang) * dist, y = burstOrigin[1] + Math.sin(p.ang) * dist - 34 * a * a;
          const al = Math.min(1, a / .12) * (1 - a / p.life);
          heart(fc, x, y, p.s * (.6 + .4 * Math.min(1, a / .3)), p.rot * a, p.c, al);
        }
      } else if (bt < 0) burstOrigin = null;
    }
    return T >= T_END + 1.6;
  }

  // ---------- live mode ----------
  let t0 = performance.now(), tap = null, doneShown = false;
  function open() { if (tap === null) { tap = (performance.now() - t0) / 1000; navigator.vibrate && navigator.vibrate(20); } }
  seal.addEventListener('click', open); env.addEventListener('click', open);
  $('#again').addEventListener('click', () => { tap = null; doneShown = false; document.body.classList.remove('done'); scrollTo({ top: 0, behavior: 'smooth' }); });
  function loop() {
    const gt = (performance.now() - t0) / 1000;
    const done = render(gt, tap === null ? -1 : gt - tap);
    if (done && !doneShown) { doneShown = true; document.body.classList.add('done'); }
    requestAnimationFrame(loop);
  }

  // ---------- share + maker ----------
  const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 1800); };
  async function shareUrl(url, text) {
    try { if (navigator.share) { await navigator.share({ title: 'A letter for you 💌', text, url }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(url); toast('Link copied 💖'); } catch (e) { prompt('Copy this link:', url); }
  }
  $('#share').addEventListener('click', () => shareUrl(location.href, "You've got a letter 💌 Tap the seal…"));
  const base = location.origin + location.pathname;
  $('#mkBtn').addEventListener('click', () => {
    const q = new URLSearchParams(); const n = clean($('#mkName').value, 30), m = clean($('#mkMsg').value, 320);
    if (n) q.set('name', n); if (m) q.set('msg', m);
    const url = base + (q.toString() ? '?' + q.toString() : '');
    $('#mkLink').value = url; $('#mkOpen').href = url; $('#mkOut').hidden = false;
  });
  $('#mkCopy').addEventListener('click', async () => { try { await navigator.clipboard.writeText($('#mkLink').value); toast('Link copied 💖'); } catch (e) { $('#mkLink').select(); } });
  $('#mkShare').addEventListener('click', () => shareUrl($('#mkLink').value, "You've got a letter 💌 Tap the seal…"));

  // ---------- capture mode ----------
  if (CAPTURE) {
    document.body.classList.add('capture');
    $('#share').style.display = 'none';
    const finger = document.createElement('div'); finger.id = 'finger'; finger.textContent = '👆'; document.body.appendChild(finger);
    const rip = document.createElement('div'); rip.id = 'ripple'; document.body.appendChild(rip);
    const TAP = 1.7;
    window.__render = t => {
      const T = t >= TAP ? t - TAP : -1;
      render(t, T);
      const r = seal.getBoundingClientRect(); const sx = r.left + r.width / 2, sy = r.top + r.height / 2;
      const a = eout(lin(t, .45, 1.5)), back = eio(lin(t, 1.95, 2.45));
      const fx_ = sx - 26 + (1 - a) * 150 + back * 120, fy = sy - 8 + (1 - a) * 330 + back * 300;
      const press = t > 1.55 && t < 1.85 ? .86 : 1;
      finger.style.opacity = Math.min(lin(t, .4, .7), 1 - back);
      finger.style.transform = `translate(${fx_}px,${fy}px) scale(${press})`;
      const rk = lin(t, TAP, TAP + .6);
      rip.style.opacity = rk > 0 && rk < 1 ? 1 - rk : 0;
      rip.style.transform = `translate(${sx - 10}px,${sy - 10}px) scale(${1 + rk * 7})`;
      return { T_END, TAP };
    };
    window.__T_END = T_END;
    document.fonts.ready.then(() => setTimeout(() => { window.__render(0); window.__ready = true; }, 200));
  } else {
    requestAnimationFrame(loop);
  }
})();
