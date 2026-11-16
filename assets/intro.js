/* Opening sequence: charge up, power up, fire, reveal the page.
   Plays once per browser session. Skipped for reduced-motion. Replay with window.playIntro(). */
(() => {
  const root = document.documentElement;
  const base = (document.currentScript && document.currentScript.dataset.assets) || 'assets/intro/';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const forced = new URLSearchParams(location.search).has('intro');
  let seen = false;
  try { seen = sessionStorage.getItem('introSeen') === '1'; } catch (_) {}
  const release = () => root.classList.remove('intro-pending');

  window.playIntro = () => { if (!document.getElementById('intro')) play(); };
  if (reduced || (seen && !forced)) { release(); return; }
  play();

  function play() {
    try { sessionStorage.setItem('introSeen', '1'); } catch (_) {}
    const el = document.createElement('div');
    el.id = 'intro';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Opening animation');
    el.innerHTML = `
      <canvas class="intro-back"></canvas>
      <div class="intro-figure"><img class="f-base" alt="" src="${base}hero-base.webp"><img class="f-power" alt="" src="${base}hero-powered.webp"></div>
      <canvas class="intro-front"></canvas>
      <div class="intro-cutin"><img alt="" src="${base}eyes-toon.webp"><span>Time to build.</span></div>
      <div class="intro-episode"><small>Episode 01</small><strong>The Builder Awakens</strong></div>
      <div class="intro-power"><small>Power level</small><b>0</b><i></i></div>
      <div class="intro-shout" aria-hidden="true"></div>
      <div class="intro-flash"></div>
      <button class="intro-skip" type="button">Skip intro ▸</button>`;
    document.body.appendChild(el);
    root.classList.add('intro-playing');

    const back = el.querySelector('.intro-back'), front = el.querySelector('.intro-front');
    const bctx = back.getContext('2d'), fctx = front.getContext('2d');
    const figure = el.querySelector('.intro-figure'), powered = el.querySelector('.f-power'), baseImg = el.querySelector('.f-base');
    const cutin = el.querySelector('.intro-cutin'), episode = el.querySelector('.intro-episode');
    const power = el.querySelector('.intro-power'), powerNum = power.querySelector('b'), powerBar = power.querySelector('i');
    const shout = el.querySelector('.intro-shout'), flash = el.querySelector('.intro-flash');
    let W = 0, H = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      W = innerWidth; H = innerHeight;
      [back, front].forEach(c => { c.width = W * dpr; c.height = H * dpr; });
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0); fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener('resize', resize);

    // Soft glow sprites, drawn once and stamped many times.
    const sprite = (r, g, b) => {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const x = c.getContext('2d'), grad = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, `rgba(255,255,255,1)`); grad.addColorStop(.25, `rgba(${r},${g},${b},.85)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      x.fillStyle = grad; x.fillRect(0, 0, 64, 64); return c;
    };
    const GOLD = sprite(255, 190, 40), BLUE = sprite(70, 170, 255);

    const T = { cut: 1.0, charge: 2.0, burst: 3.7, orb: 4.1, fire: 5.3, white: 5.95, end: 6.9 };
    const stars = Array.from({ length: 260 }, () => ({ a: Math.random() * 6.283, d: Math.random(), s: .3 + Math.random() * 1.4 }));
    const aura = [], motes = [], rocks = [];
    let bolts = [], start = 0, skipped = false, finished = false, lastShout = '';
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const phase = (t, a, b) => clamp((t - a) / (b - a));

    const say = (text, cls) => {
      if (text === lastShout) return; lastShout = text;
      shout.className = 'intro-shout ' + (cls || ''); shout.textContent = text;
      void shout.offsetWidth; shout.classList.add('on');
    };
    const bolt = (x0, y0, x1, y1) => {
      const pts = [[x0, y0]], n = 9;
      for (let i = 1; i < n; i++) {
        const k = i / n, j = (1 - Math.abs(k - .5) * 2) * 46;
        pts.push([x0 + (x1 - x0) * k + (Math.random() - .5) * j, y0 + (y1 - y0) * k + (Math.random() - .5) * j]);
      }
      pts.push([x1, y1]); return { pts, life: 3 };
    };

    const frame = now => {
      if (finished) return;
      if (!start) start = now;
      let t = (now - start) / 1000;
      if (skipped && t < T.white) { start = now - T.white * 1000; t = T.white; }
      const box = figure.getBoundingClientRect();
      const cx = box.left + box.width / 2, feet = box.bottom, top = box.top + box.height * .1;
      const charge = phase(t, T.charge, T.burst), burst = t >= T.burst, orbP = phase(t, T.orb, T.fire), fireP = phase(t, T.fire, T.white);
      const ox = box.left + box.width * .48, oy = box.top + box.height * .41;

      // --- back: space, warp stars, aura
      bctx.globalCompositeOperation = 'source-over';
      bctx.fillStyle = '#03040c'; bctx.fillRect(0, 0, W, H);
      let neb = bctx.createRadialGradient(W * .2, H * .25, 0, W * .2, H * .25, Math.max(W, H) * .6);
      neb.addColorStop(0, 'rgba(70,40,150,.38)'); neb.addColorStop(1, 'rgba(70,40,150,0)');
      bctx.fillStyle = neb; bctx.fillRect(0, 0, W, H);
      neb = bctx.createRadialGradient(W * .85, H * .7, 0, W * .85, H * .7, Math.max(W, H) * .55);
      neb.addColorStop(0, 'rgba(20,90,170,.34)'); neb.addColorStop(1, 'rgba(20,90,170,0)');
      bctx.fillStyle = neb; bctx.fillRect(0, 0, W, H);
      const warp = .0016 + charge * .012 + (burst ? .02 : 0) + fireP * .08;
      const reach = Math.hypot(W, H) * .62;
      bctx.lineCap = 'round';
      for (const s of stars) {
        const d0 = s.d; s.d += warp * (.4 + s.d) * s.s; if (s.d > 1) { s.d = .02 + Math.random() * .05; s.a = Math.random() * 6.283; continue; }
        const x0 = W / 2 + Math.cos(s.a) * d0 * reach, y0 = H * .45 + Math.sin(s.a) * d0 * reach;
        const x1 = W / 2 + Math.cos(s.a) * s.d * reach, y1 = H * .45 + Math.sin(s.a) * s.d * reach;
        bctx.strokeStyle = `rgba(${burst ? '255,236,180' : '210,225,255'},${.25 + s.d * .75})`;
        bctx.lineWidth = s.s * (.6 + s.d);
        bctx.beginPath(); bctx.moveTo(x0, y0); bctx.lineTo(x1 + .5, y1 + .5); bctx.stroke();
      }
      bctx.globalCompositeOperation = 'lighter';
      if (charge > 0) {
        const pulse = 1 + Math.sin(t * 34) * .05, R = box.height * (.34 + charge * .2 + (burst ? .3 : 0)) * pulse;
        const g = bctx.createRadialGradient(cx, feet - box.height * .45, 0, cx, feet - box.height * .45, R);
        g.addColorStop(0, `rgba(255,230,120,${.25 + charge * .35})`); g.addColorStop(.55, `rgba(255,170,30,${.12 + charge * .2})`); g.addColorStop(1, 'rgba(255,150,0,0)');
        bctx.fillStyle = g; bctx.save(); bctx.translate(cx, feet - box.height * .45); bctx.scale(.62, 1.15); bctx.translate(-cx, -(feet - box.height * .45));
        bctx.fillRect(cx - R, feet - box.height * .45 - R, R * 2, R * 2); bctx.restore();
        const rate = Math.floor(2 + charge * 7 + (burst ? 10 : 0));
        for (let i = 0; i < rate; i++) aura.push({ x: cx + (Math.random() - .5) * box.width * (.55 + (burst ? .35 : 0)), y: feet - Math.random() * box.height * .25, vx: (Math.random() - .5) * 1.4, vy: -(3 + Math.random() * 7 + (burst ? 6 : 0)), r: 14 + Math.random() * 30 + (burst ? 18 : 0), life: 1 });
        if (Math.random() < .25 + charge * .4) rocks.push({ x: cx + (Math.random() - .5) * box.width * 1.6, y: feet + 10, vy: -(1 + Math.random() * 3), s: 2 + Math.random() * 5, life: 1 });
      }
      for (let i = aura.length - 1; i >= 0; i--) {
        const p = aura[i]; p.x += p.vx; p.y += p.vy; p.life -= .022; p.r *= .985;
        if (p.life <= 0 || p.y < top - 200) { aura.splice(i, 1); continue; }
        bctx.globalAlpha = p.life * .7; bctx.drawImage(GOLD, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      bctx.globalAlpha = 1; bctx.globalCompositeOperation = 'source-over';
      for (let i = rocks.length - 1; i >= 0; i--) {
        const p = rocks[i]; p.y += p.vy; p.life -= .012; if (p.life <= 0) { rocks.splice(i, 1); continue; }
        bctx.fillStyle = `rgba(150,160,200,${p.life * .8})`; bctx.fillRect(p.x, p.y, p.s, p.s * .8);
      }

      // --- front: lightning, orb, beam
      fctx.clearRect(0, 0, W, H);
      fctx.globalCompositeOperation = 'lighter';
      if (charge > .1 && t < T.white && Math.random() < .12 + charge * .3) {
        const side = Math.random() < .5 ? -1 : 1, yA = top + Math.random() * box.height * .7;
        bolts.push(bolt(cx + side * box.width * (.2 + Math.random() * .25), yA, cx + side * box.width * (.5 + Math.random() * .5), yA + (Math.random() - .5) * 260));
        if (burst) bolts.push(bolt(cx, top, cx + (Math.random() - .5) * W * .7, 0));
      }
      bolts = bolts.filter(b => b.life-- > 0);
      fctx.shadowColor = burst ? '#ffe680' : '#8fd0ff'; fctx.shadowBlur = 16; fctx.lineJoin = 'round';
      for (const b of bolts) {
        fctx.strokeStyle = `rgba(255,255,255,${.5 + b.life * .16})`; fctx.lineWidth = 1.5 + b.life * .8;
        fctx.beginPath(); b.pts.forEach((p, i) => i ? fctx.lineTo(p[0], p[1]) : fctx.moveTo(p[0], p[1])); fctx.stroke();
      }
      fctx.shadowBlur = 0;
      if (orbP > 0 && t < T.white) {
        const unit = Math.min(W, H);
        if (!fireP) for (let i = 0; i < 4; i++) { const a = Math.random() * 6.283, d = unit * (.22 + Math.random() * .25); motes.push({ a, d, r: 6 + Math.random() * 12 }); }
        for (let i = motes.length - 1; i >= 0; i--) {
          const m = motes[i]; m.d *= .9; m.a += .08; if (m.d < 6) { motes.splice(i, 1); continue; }
          fctx.globalAlpha = .9; fctx.drawImage(BLUE, ox + Math.cos(m.a) * m.d - m.r, oy + Math.sin(m.a) * m.d - m.r, m.r * 2, m.r * 2);
        }
        fctx.globalAlpha = 1;
        const r = unit * (.02 + orbP * .075) * (1 + Math.sin(t * 50) * .07) * (1 + Math.pow(fireP, 2.2) * 34);
        const g = fctx.createRadialGradient(ox, oy, 0, ox, oy, r * 2.4);
        g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(190,235,255,.95)'); g.addColorStop(.55, 'rgba(60,160,255,.55)'); g.addColorStop(1, 'rgba(30,90,255,0)');
        fctx.fillStyle = g; fctx.beginPath(); fctx.arc(ox, oy, r * 2.4, 0, 6.283); fctx.fill();
        if (fireP > 0) {
          fctx.save(); fctx.translate(ox, oy); fctx.rotate(t * 1.6);
          const L = Math.hypot(W, H);
          for (let i = 0; i < 22; i++) {
            fctx.rotate(6.283 / 22); fctx.fillStyle = `rgba(200,235,255,${.1 + fireP * .25})`;
            fctx.beginPath(); fctx.moveTo(0, 0); fctx.lineTo(L, -L * .035 * (1 + (i % 3))); fctx.lineTo(L, L * .035); fctx.fill();
          }
          fctx.restore();
        }
      }
      fctx.globalCompositeOperation = 'source-over';

      // --- DOM beats
      const amp = t >= T.white ? 0 : charge * 5 + (burst ? 5 : 0) + fireP * 14;
      const rise = 1 - Math.pow(1 - phase(t, 0, .9), 3);
      figure.style.transform = `translate(calc(-50% + ${(Math.random() - .5) * amp}px), ${(1 - rise) * 30 + (Math.random() - .5) * amp}%) scale(${1 + fireP * .06})`;
      figure.style.opacity = rise;
      figure.style.filter = `brightness(${.5 + rise * .45 + charge * .2 + (burst ? .15 : 0)}) contrast(1.08) saturate(${1.1 + charge * .3})`;
      powered.style.opacity = burst ? 1 : 0;
      baseImg.style.opacity = burst ? 0 : 1;
      episode.classList.toggle('on', t > .15 && t < T.cut);
      cutin.classList.toggle('on', t >= T.cut && t < T.charge - .05);
      power.classList.toggle('on', t >= T.charge && t < T.fire);
      const level = burst ? 9001 : Math.floor(9000 * Math.pow(charge, 3));
      powerNum.textContent = level.toLocaleString('en-US') + (burst ? '+' : '');
      powerBar.style.transform = `scaleX(${burst ? 1 : charge})`;
      power.classList.toggle('max', burst);
      if (t >= T.fire) say('NOW!', 'big blue');
      else if (t >= T.orb + .6) say('IT…', 'blue');
      else if (t >= T.orb) say('SHIP…', 'blue');
      else if (burst) say('FULL POWER', 'big');
      flash.style.opacity = t >= T.white ? 1 : Math.max(burst && t < T.burst + .28 ? 1 - (t - T.burst) / .28 : 0, Math.pow(fireP, 3));

      if (t >= T.white) {
        release();
        el.classList.add('reveal');
        el.style.opacity = 1 - phase(t, T.white + .15, T.end);
        if (t >= T.end) return finish();
      }
      requestAnimationFrame(frame);
    };

    const finish = () => {
      if (finished) return; finished = true;
      release(); root.classList.remove('intro-playing');
      removeEventListener('resize', resize); removeEventListener('keydown', onKey);
      el.remove();
      document.dispatchEvent(new CustomEvent('intro:done'));
    };
    const skip = () => { skipped = true; };
    const onKey = e => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); skip(); } };
    el.addEventListener('click', skip);
    addEventListener('keydown', onKey);
    el.querySelector('.intro-skip').focus({ preventScroll: true });

    // Start once the figure is ready; never hold the page hostage to a slow image.
    const imgs = [...el.querySelectorAll('img')];
    Promise.race([
      Promise.all(imgs.map(i => i.decode ? i.decode().catch(() => {}) : Promise.resolve())),
      new Promise(r => setTimeout(r, 2500))
    ]).then(() => requestAnimationFrame(frame));
  }
})();
