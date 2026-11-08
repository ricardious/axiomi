// AXIOMI — gira el mundo, cambia sus reglas. Todo dibujado y sonado con código.
(() => {
'use strict';
const W = 960, H = 540, Z = 2, T = 12, CW = 20, RH = 12, G = 650, MV = 400;
const { floor, min, max, abs, sin, cos, hypot, PI, random: rnd, round, sqrt, ceil } = Math, D = document;
const cl = (v, a, b) => v < a ? a : v > b ? b : v, lp = (a, b, k) => a + (b - a) * k;
const rr = (a, b) => a + rnd() * (b - a), ri = (a, b) => floor(rr(a, b + 1)), pk = a => a[floor(rnd() * a.length)];
const hs = (i, j) => { let h = Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; };
const mk = (w, h) => { const c = D.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; };
const cv = D.getElementById('c'), X = cv.getContext('2d');
cv.width = W; cv.height = H;
const fr = (x, y, w, h, c) => { if (c) X.fillStyle = c; X.fillRect(x, y, w, h); }, ga = a => X.globalAlpha = a;
const [DC, DX] = mk(W, H);
const rsz = () => { const s = min(innerWidth / W, innerHeight / H); cv.style.width = W * s + 'px'; cv.style.height = H * s + 'px'; };
onresize = rsz; rsz();
const hx = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
const mix = (a, b, k) => { a = hx(a); b = hx(b); return '#' + a.map((v, i) => (round(lp(v, b[i], k)) | 256).toString(16).slice(1)).join(''); };

// ---------- luz ----------
const GC = {};
const glow = c => GC[c] || (GC[c] = (() => {
  const [k, x] = mk(64, 64), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, c); g.addColorStop(.3, c + '70'); g.addColorStop(1, c + '00');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); return k;
})());
const lt = (x, c, px, py, r, a = 1) => { x.globalAlpha = a; x.drawImage(glow(c), px - r, py - r, r * 2, r * 2); x.globalAlpha = 1; };

// ---------- fuente vectorial propia ----------
// cada glifo son trazos sobre una rejilla de 5x7: pares de dígitos "xy" unidos, trazos separados por espacios
const FC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.!-+<>/?,';
const FG = ('062046 1333|06003041423303 3344453606|4130100105163645|06003041453606|40000646 0333|400006 0333|41301001051636454323|0006 4046 0343|1030 2026 1636|4045361605|0006 400346|000646|0600234046|06004640|103041453616050110|06003041423303|103041453616050110 3546|06003041423303 2346|413010010213334445361605|0040 2026|000516364540|002640|0016233640|0046 4006|0023 4023 2326|00400646|' +
  '103041453616050110 3115|112026 1636|01103041420646|01103041423313 334445361605|36300444|400003334445361605|30100105163645443303|004016|103041423313020110 1304051636454433|43130201103041453616|' +
  '2222 2626|2626|2024 2626|1333|1333 2224|311335|113315|3016|0110304142322324 2626|2627').split('|').map(g => g.split(' ').map(s => s.match(/../g) || []));
const tx = (s, x, y, c, sc = 1, al = 0) => {
  s = ('' + s).toUpperCase(); const u = sc * .95, ad = 6.4 * u, w = s.length * ad - 2.4 * u;
  x = al == 1 ? x - w / 2 : al == 2 ? x - w : x;
  X.save(); X.strokeStyle = c; X.lineWidth = .45 * u + .4; X.lineCap = X.lineJoin = 'round';
  if (sc > 1.5 && c != '#000000') { X.shadowColor = c; X.shadowBlur = 4 + sc * 2; }
  X.beginPath();
  for (const ch of s) {
    const g = FG[FC.indexOf(ch)];
    if (g) for (const st_ of g) st_.forEach((v, n) => X[n ? 'lineTo' : 'moveTo'](x + v[0] * u, y + v[1] * u));
    x += ad;
  }
  X.stroke(); X.restore();
  return w;
};
const txs = (s, x, y, c, sc = 1, al = 0) => { ga(.6); tx(s, x + sc * .3, y + sc * .7, '#000000', sc, al); ga(1); return tx(s, x, y, c, sc, al); };

// ---------- guardado ----------
const S = { b: 0, d: 0, m: 0, n: 0 };
try { Object.assign(S, JSON.parse(localStorage.axiomi || '{}')); } catch (e) { }
const save = () => { try { localStorage.axiomi = JSON.stringify(S); } catch (e) { } };

// ---------- los cuatro axiomas ----------
// cada orientación del mundo es un estado: sólo los bloques de su color son sólidos
const AX = [
  { n: 'FLUJO', c: '#4ff0ff', k: '#0f4a5e', h: 'LO CIAN ES SOLIDO' },
  { n: 'PULSO', c: '#ff4fd8', k: '#5a1050', h: 'LO MAGENTA ES SOLIDO - SALTO FUERTE' },
  { n: 'BRASA', c: '#ffb347', k: '#5e3410', h: 'LO AMBAR ES SOLIDO - LAS LAMPARAS CARGAN' },
  { n: 'RAIZ', c: '#7dff5a', k: '#245a10', h: 'LO VERDE ES SOLIDO - EL TIEMPO SE FRENA' }
];

// ---------- audio ----------
let A, MG, DL, NB;
const au = () => {
  if (!A) {
    try { A = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    MG = A.createGain(); MG.gain.value = S.m ? 0 : .5; MG.connect(A.destination);
    DL = A.createDelay(); DL.delayTime.value = .32;
    const fb = A.createGain(); fb.gain.value = .38; DL.connect(fb); fb.connect(DL);
    const wt = A.createGain(); wt.gain.value = .55; DL.connect(wt); wt.connect(MG);
    NB = A.createBuffer(1, A.sampleRate, A.sampleRate);
    const d = NB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = rnd() * 2 - 1;
  }
  if (A.state[0] == 's') A.resume();
};
const tn = (f, d, ty, v, f2, dl, fx) => {
  if (!A) return;
  const t0 = A.currentTime + (dl || 0), o = A.createOscillator(), g = A.createGain();
  o.type = ty || 'sine'; o.frequency.setValueAtTime(f, t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
  g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + .01); g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
  o.connect(g); g.connect(MG); if (fx) g.connect(DL); o.start(t0); o.stop(t0 + d + .05);
};
const nz = (d, v, fq, dl) => {
  if (!A) return;
  const t0 = A.currentTime + (dl || 0), s = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain();
  s.buffer = NB; f.frequency.value = fq; g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
  s.connect(f); f.connect(g); g.connect(MG); s.start(t0, rnd() * .5); s.stop(t0 + d);
};
const BF = [220, 247, 196, 233], SC = [[0, 3, 7, 10, 12], [0, 2, 5, 7, 9], [0, 4, 7, 11, 14], [0, 2, 3, 7, 8]];
const nt = (k, s) => BF[k] * 2 ** (s / 12);
const sfxT = {};
const sfx = (k, gap = .06) => {
  if (!A || (sfxT[k] || 0) > A.currentTime - gap) return; sfxT[k] = A.currentTime;
  ({
    sw: () => { [0, 7, 12, 16].forEach((s, i) => tn(nt(q, s) * 2, .45, 'triangle', .06, 0, i * .03, 1)); nz(.25, .07, 2500); },
    cr: () => { tn(1320 + cr % 5 * 110, .15, 'triangle', .07, 0, 0, 1); tn(1980, .25, 'sine', .04, 0, .06, 1); },
    jp: () => tn(260, .14, 'square', .03, q == 1 ? 900 : 620),
    ld: () => nz(.06, .08, 700),
    die: () => { tn(420, .9, 'sawtooth', .08, 50); nz(.7, .2, 400); },
    hb: () => tn(70, .18, 'sine', .14, 45),
    lp: () => tn(880 + rnd() * 300, .08, 'sine', .02),
    go: () => [0, 4, 7, 12].forEach((s, i) => tn(nt(0, s) * 2, .3, 'triangle', .06, 0, i * .07, 1))
  })[k]();
};
let mt = 0, stp = 0;
const mus = dt => {
  if (!A || (mt -= dt) > 0) return;
  mt += .15; stp++;
  const s = SC[q];
  if (stp % 2 == 0 && hs(stp >> 1, q + 9) < .75) tn(nt(q, s[floor(hs(stp, q) * 5)]) * 2, .3, 'triangle', .02, 0, 0, 1);
  if (stp % 16 == 0) tn(BF[q] / 2, 2.6, 'sawtooth', .025), tn(BF[q] / 4, 2.6, 'sine', .08);
  if (stp % 4 == 2) nz(.03, .025, 7000);
};

// ---------- mundo ----------
// plano grueso (12 px): 0 aire · 1 roca · 2..5 materia del axioma 0..3 · 6 espinas · 7 lámpara
// el plano se deforma con ruido sobre una rejilla fina (4 px) y se contornea con marching squares:
// así las cuevas son orgánicas y la colisión coincide exactamente con lo que se ve.
let st = 'title', t = 0, th = 0, rv = 0, q = 0, pq = 0, M = new Map(), gy = 0, E = [], P = [], p = {}, L = 100, score = 0, cr = 0, depth = 0,
  vY = 0, camx = 0, camy = 0, sh = 0, fl = 0, ban = 0, ot = 0, jb = 0, drag = 0, why = '', hb = 0, pgx = 8, pgw = 4, rec = 0, lpT = 0, DM = [];
const Zr = new Uint8Array(CW);
const tile = (i, j) => i < 0 || i >= CW || j < 0 ? 1 : (M.get(j) || Zr)[i];
const DN = [0, 1, 3]; // axiomas en los que la gravedad aún apunta hacia abajo

const gen = () => {
  const j0 = gy, d = min(1, j0 / 1400), R = [], F = RH - 1;
  for (let k = 0; k < RH; k++) R.push(new Uint8Array(CW));
  const st_ = (i, k, v) => { if (i >= 0 && i < CW && k >= 0 && k < RH) R[k][i] = v; };
  const gw = j0 < 40 ? 4 : 3 + (rnd() < .35 - d * .3), pat = j0 < 30 ? 0 : pk(j0 < 140 ? [0, 0, 3, 1] : j0 < 300 ? [0, 1, 3, 2, 4] : [0, 1, 2, 2, 3, 4, 4]);
  let gx = ri(1, CW - gw - 1), a = pk(DN);
  if (pat == 4) gx = a == 1 ? CW - gw : a == 3 ? 0 : gx;
  if (pat == 1 && j0 < 200) a = 0;
  const inGap = i => i >= gx && i < gx + gw, near = (i, k) => abs(i - (k + .5)) < 3;
  if (pat == 1) R[F].fill(2 + a);
  else if (pat == 2) { const b = pk(DN.filter(v => v != a)), sp = ri(5, CW - 5); for (let i = 0; i < CW; i++) R[F][i] = 2 + (i < sp ? a : b); }
  else {
    for (let i = 0; i < CW; i++) R[F][i] = inGap(i) ? pat == 3 ? 2 + a : 0 : 1;
    if (pat == 4) {
      for (let i = 0; i < CW; i++) if (!inGap(i)) { st_(i, F - 1, 6); if (!(a == 3 ? i > CW - 4 : a == 1 ? i < 3 : 0)) st_(i, F - 4, 2 + a); }
    } else if (d > .1) for (let i = 0; i < CW; i++) if (!inGap(i) && abs(i - gx - gw / 2) > gw / 2 + 1.5 && !near(i, pgx + pgw / 2 - .5) && rnd() < d * .7) st_(i, F - 1, 6);
  }
  if (j0) {
    for (let n = ri(1, 2 + (d * 2 | 0)); n--;) {
      const k = ri(3, F - 4), w = ri(2, 5), i0 = ri(0, CW - w), v = rnd() < .3 + d * .3 ? 2 + ri(0, 3) : 1;
      for (let i = i0; i < i0 + w; i++) st_(i, k, v);
      if (v == 1 && rnd() < d * .8) st_(i0 + ri(0, w - 1), k - 1, 6);
    }
    if (rnd() < .5) st_(rnd() < .5 ? 0 : CW - 1, ri(2, F - 3), 7);
    for (let n = ri(1, 3); n--;) { const i = ri(1, CW - 2), k = ri(1, F - 3); if (!R[k][i] && !R[k + 1][i]) E.push({ x: i * T + 6, y: (j0 + k) * T + 6, ph: rnd() * 6 }); }
  }
  pgx = gx; pgw = gw;
  R.forEach((r, k) => M.set(j0 + k, r)); gy += RH;
};

const C = 4, PX = 48, FW = (CW * T + PX * 2) / C, FH = RH * T / C, CH = FH * C, PAD = 30;
const MT = new Map(), CF = new Map(), CC = new Map();
const vn = (x, y) => { const i = floor(x), j = floor(y), u = x - i, v = y - j, s = k => k * k * (3 - 2 * k); return lp(lp(hs(i, j), hs(i + 1, j), s(u)), lp(hs(i, j + 1), hs(i + 1, j + 1), s(u)), s(v)) * 2 - 1; };
const cells = k => {
  let m = MT.get(k); if (m) return m;
  while (gy < (k + 2) * RH) gen();
  m = new Uint8Array(FW * FH);
  for (let j = 0; j < FH; j++) for (let i = 0; i < FW; i++) {
    const x = i * C - PX + 2, y = (k * FH + j) * C + 2;
    const wb = max(0, vn(x < 120 ? 3.3 : 8.7, y * .022)) * 11, dx = vn(x * .045, y * .045) * 6 + vn(x * .18 + 50, y * .18) * 1.6 + (x < 26 ? -wb : x > CW * T - 26 ? wb : 0),
      v = tile(floor((x + dx) / T), floor((y + vn(x * .045 + 40, y * .045 + 70) * 6.5 + vn(x * .16, y * .16 + 9) * 1.5) / T));
    m[j * FW + i] = v < 6 ? v : 0;
  }
  MT.set(k, m); return m;
};
const cell = (i, j) => i < 0 || i >= FW || j < 0 ? 1 : cells(floor(j / FH))[(j % FH) * FW + i];
// campos en las esquinas: 0 roca, 1..4 materia de cada axioma
const corn = k => {
  let c = CF.get(k); if (c) return c;
  c = [0, 1, 2, 3, 4].map(() => new Float32Array((FW + 1) * FH));
  for (let j = k * FH; j < (k + 1) * FH; j++) for (let i = 0; i <= FW; i++)
    for (const m of [cell(i - 1, j - 1), cell(i, j - 1), cell(i - 1, j), cell(i, j)]) if (m) c[m - 1][(j - k * FH) * (FW + 1) + i] += .25;
  CF.set(k, c); return c;
};
const cf = (i, j, s) => i < 0 || i > FW || j < 0 ? +!s : corn(floor(j / FH))[s][(j % FH) * (FW + 1) + i];
// campo sólido (>.5 = dentro) con interpolación bilineal; coincide con el contorno dibujado
const fld = (x, y) => {
  const gx = (x + PX) / C, gy_ = y / C, i = floor(gx), j = floor(gy_), u = gx - i, v = gy_ - j;
  let f = 0;
  for (const s of [0, q + 1]) f += lp(lp(cf(i, j, s), cf(i + 1, j, s), u), lp(cf(i, j + 1, s), cf(i + 1, j + 1, s), u), v);
  return f;
};

// ---------- trozos de escenario cacheados (uno por sala y axioma) ----------
const chunk = (k, qq) => {
  const key = k * 4 + qq; let cc = CC.get(key); if (cc) return cc;
  const [cn, x] = mk(FW * C * Z, (CH + PAD * 2) * Z);
  x.imageSmoothingEnabled = true; x.scale(Z, Z); x.translate(PX, PAD - k * CH);
  x.lineCap = x.lineJoin = 'round';
  const ac = AX[qq].c, tip = mix(ac, '#ffffff', .35), j0 = k * FH, I0 = k * RH;
  // contorno de una materia: devuelve el relleno y los segmentos del borde con su normal exterior
  const iso = s => {
    const Pp = new Path2D(), Sg = [];
    for (let j = j0; j < j0 + FH; j++) for (let i = 0; i < FW; i++) {
      const a = cf(i, j, s), b = cf(i + 1, j, s), c = cf(i + 1, j + 1, s), d = cf(i, j + 1, s);
      if (a + b + c + d == 0) continue;
      const X0 = i * C - PX, Y0 = j * C;
      if (a > .5 && b > .5 && c > .5 && d > .5) { Pp.rect(X0, Y0, C, C); continue; }
      const cs = [[a, X0, Y0], [b, X0 + C, Y0], [c, X0 + C, Y0 + C], [d, X0, Y0 + C]], pts = [], cr_ = [];
      for (let n = 0; n < 4; n++) {
        const [va, xa, ya] = cs[n], [vb, xb, yb] = cs[(n + 1) % 4];
        if (va > .5) pts.push([xa, ya]);
        if ((va > .5) != (vb > .5)) { const f = (.5 - va) / (vb - va), e = [xa + (xb - xa) * f, ya + (yb - ya) * f]; pts.push(e); cr_.push(e); }
      }
      if (pts.length > 2) { Pp.moveTo(...pts[0]); for (const e of pts) Pp.lineTo(...e); Pp.closePath(); }
      const gx = b + c - a - d, gy_ = c + d - a - b, gl = hypot(gx, gy_) || 1;
      for (let n = 0; n + 1 < cr_.length; n += 2) Sg.push([...cr_[n], ...cr_[n + 1], -gx / gl, -gy_ / gl]);
    }
    return [Pp, Sg];
  };
  const seg = (Sg, c, w, al) => { x.globalAlpha = al; x.strokeStyle = c; x.lineWidth = w; x.beginPath(); for (const [a, b, c_, d] of Sg) { x.moveTo(a, b); x.lineTo(c_, d); } x.stroke(); x.globalAlpha = 1; };
  const line = (pts, w) => { x.lineWidth = w; x.beginPath(); x.moveTo(...pts[0]); for (let n = 1; n < pts.length; n++) x.lineTo(...pts[n]); x.stroke(); };
  // roca: silueta negra con borde de luz
  const [RP, RS] = iso(0);
  x.fillStyle = x.strokeStyle = '#030207'; x.fill(RP); x.lineWidth = .7; x.stroke(RP);
  seg(RS, mix(ac, '#ffffff', .25), 1.4, .25); seg(RS, tip, .6, .8);
  // flora en siluetas: hierba, helechos, hongos, raíces colgantes
  x.strokeStyle = x.fillStyle = '#030207';
  for (const [a, b, c_, d, nx, ny] of RS) {
    const mx = (a + c_) / 2, my = (b + d) / 2, h = hs(round(mx * 3), round(my * 3)), h2 = hs(round(my * 7), round(mx * 5));
    if (mx < -6 || mx > CW * T + 6) continue;
    if (ny < -.6) {
      if (h < .5) for (let n = 0; n < 1 + (h2 * 3 | 0); n++) {
        const bx = mx + n * 1.3 - 1, ln = 3 + hs(n, round(mx * 9)) * 7, bend = (h2 - .5) * 5;
        x.lineWidth = .9; x.beginPath(); x.moveTo(bx, my + 1); x.quadraticCurveTo(bx + bend * .3, my - ln * .6, bx + bend, my - ln); x.stroke();
        if (h2 < .45) { x.fillStyle = tip; x.fillRect(bx + bend - .5, my - ln - .5, 1.2, 1.2); x.fillStyle = '#030207'; }
      }
      else if (h < .56) { // hongo
        const hh = 5 + h2 * 9, cw = 3 + h2 * 4;
        x.lineWidth = 1.4; x.beginPath(); x.moveTo(mx, my + 1); x.quadraticCurveTo(mx + 2, my - hh / 2, mx + .5, my - hh); x.stroke();
        x.beginPath(); x.ellipse(mx + .5, my - hh, cw, cw * .55, 0, PI, 0); x.fill();
        x.fillStyle = ac; for (let n = -1; n <= 1; n++) x.fillRect(mx + .5 + n * cw * .55 - .5, my - hh + .4, 1, 1); x.fillStyle = '#030207';
      } else if (h < .62) { // helecho
        const ln = 8 + h2 * 8, dir = h2 < .5 ? -1 : 1;
        const pts = []; for (let n = 0; n <= 8; n++) { const u = n / 8; pts.push([mx + dir * u * u * ln * .6, my - u * ln]); }
        line(pts, 1);
        for (let n = 2; n < 8; n++) { const [px_, py_] = pts[n], fl_ = (9 - n) * .5; x.lineWidth = .6; x.beginPath(); x.moveTo(px_, py_); x.lineTo(px_ - fl_, py_ - fl_ * .4); x.moveTo(px_, py_); x.lineTo(px_ + fl_, py_ - fl_ * .4); x.stroke(); }
      }
    } else if (ny > .6 && h < .32) { // raíces que cuelgan del techo
      const ln = 5 + h2 * 24, pts = [];
      for (let n = 0; n <= 10; n++) { const u = n / 10; pts.push([mx + sin(u * 4 + h * 20) * u * 3, my - 1 + u * ln]); }
      line(pts, 1.3 - h2 * .6);
      if (h < .06) { x.fillStyle = tip; x.beginPath(); x.arc(pts[10][0], pts[10][1] + 1.5, 1.6, 0, 7); x.fill(); x.fillStyle = '#030207'; }
    } else if (abs(nx) > .7 && h < .15) { // musgo en las paredes
      for (let n = 0; n < 3; n++) { x.beginPath(); x.arc(mx + nx * 1.2, my + (n - 1) * 1.6, 1.1 + h2, 0, 7); x.fill(); }
    }
  }
  // espinas y lámparas (en el plano grueso)
  for (let J = I0; J < I0 + RH; J++) for (let I = 0; I < CW; I++) {
    const v = tile(I, J), bx = I * T, by = J * T;
    if (v == 6) for (let n = 0; n < 4; n++) {
      const sx = bx + 1 + n * 3 + hs(I + n, J) * 1.5, hh = 7 + hs(J, I + n) * 5, lean = (hs(I * 3, J + n) - .5) * 3;
      x.fillStyle = '#030207'; x.beginPath(); x.moveTo(sx - 1.6, by + T + 1); x.lineTo(sx + lean, by + T - hh); x.lineTo(sx + 1.6, by + T + 1); x.fill();
      x.fillStyle = '#ff2e55'; x.beginPath(); x.moveTo(sx + lean * .75 - .7, by + T - hh * .72); x.lineTo(sx + lean, by + T - hh); x.lineTo(sx + lean * .75 + .7, by + T - hh * .72); x.fill();
    }
    if (v == 7) {
      const s = I ? -1 : 1, wx = I ? CW * T + 2 : -2, cx = bx + 6, cy = by + 7, on = qq == 2;
      x.strokeStyle = '#030207'; line([[wx, by + 1], [wx + s * 4, by - 2], [cx, by + 1], [cx, cy - 3]], 1.2);
      x.fillStyle = '#030207'; x.beginPath(); x.ellipse(cx, cy, 3.6, 4.4, 0, 0, 7); x.fill();
      x.fillStyle = on ? '#ffe6a8' : '#4a3418'; x.beginPath(); x.ellipse(cx, cy + .5, 2.3, 3, 0, 0, 7); x.fill();
      if (on) { x.fillStyle = '#ffffff'; x.fillRect(cx - .6, cy - .5, 1.2, 2); }
    }
  }
  // materia de los axiomas: sólida en su axioma, fantasma en los demás
  for (let kk = 0; kk < 4; kk++) {
    const [MP, MS] = iso(kk + 1), c = AX[kk].c;
    if (!MS.length) continue;
    if (kk == qq) {
      x.fillStyle = mix(c, '#05040b', .62); x.strokeStyle = x.fillStyle; x.fill(MP); x.lineWidth = .7; x.stroke(MP);
      x.save(); x.clip(MP); x.globalAlpha = .35; x.strokeStyle = c; x.lineWidth = .6; x.beginPath();
      for (let n = -40; n < 140; n++) { const yy = k * CH + n * 5 - 200; x.moveTo(-PX, yy); x.lineTo(CW * T + PX, yy + 120); } x.stroke(); x.restore();
      seg(MS, c, 2.4, .35); seg(MS, mix(c, '#ffffff', .4), 1, 1);
    } else { x.setLineDash([2, 2.5]); seg(MS, c, .9, .5); x.setLineDash([]); }
  }
  CC.set(key, cn); return cn;
};

const reset = () => {
  M.clear(); MT.clear(); CF.clear(); CC.clear(); E = []; P = []; gy = 0; pgx = 8; pgw = 4;
  while (gy < 60) gen();
  p = { x: CW * T / 2, y: 3 * T, vx: 0, vy: 0, r: 6, g: 0, sq: 0, f: 1, ph: 0, an: 0, nx: 0, ny: -1 };
  th = rv = 0; q = pq = 0; L = 100; score = cr = depth = 0; vY = -220; camx = p.x; camy = p.y; rec = 0; hb = 0;
  DM = [...Array(46)].map(() => ({ x: p.x + rr(-260, 260), y: p.y + rr(-260, 260), ph: rnd() * 7, s: rr(.4, 1.2) }));
};
const start = () => { reset(); st = 'play'; t = 0; ban = 2.2; S.n++; save(); sfx('go'); };

// ---------- partículas ----------
const pa = (x, y, vx, vy, l, c) => P.push({ x, y, vx, vy, l, m: l, c });
const burst = (x, y, c, n, s) => { for (let i = 0; i < n; i++) { const a = rnd() * 7, v = rr(.2, 1) * s; pa(x, y, cos(a) * v, sin(a) * v, rr(.3, .8), c); } };
const upP = dt => { for (const e of P) { e.x += e.vx * dt; e.y += e.vy * dt; e.vx *= 1 - 2 * dt; e.vy *= 1 - 2 * dt; e.l -= dt; } P = P.filter(e => e.l > 0); };

// ---------- física ----------
const SA = [...Array(14)].map((_, k) => [cos(k * PI / 7), sin(k * PI / 7)]);
const phys = dt => {
  const sx = sin(th), sy = cos(th), r = p.r;
  p.vx += sx * G * dt; p.vy += sy * G * dt;
  const sp = hypot(p.vx, p.vy); if (sp > MV) { p.vx *= MV / sp; p.vy *= MV / sp; }
  p.x += p.vx * dt; p.y += p.vy * dt;
  let nx = 0, ny = 0, hit = 0;
  for (let it = 0; it < 7; it++) {
    if (fld(p.x, p.y) > .5) { p.x -= sx * 1.5; p.y -= sy * 1.5; continue; } // dentro de materia que acaba de solidificarse
    let ax = 0, ay = 0, n = 0;
    for (const [cx, cy] of SA) if (fld(p.x + cx * r, p.y + cy * r) > .5) { ax -= cx; ay -= cy; n++; }
    if (!n) break;
    const d = hypot(ax, ay); if (d < .01) break;
    ax /= d; ay /= d; p.x += ax * .55; p.y += ay * .55; nx += ax; ny += ay; hit = 1;
  }
  if (hit) {
    const d = hypot(nx, ny) || 1; nx /= d; ny /= d;
    const vn = p.vx * nx + p.vy * ny;
    if (vn < 0) { p.vx -= nx * vn * 1.08; p.vy -= ny * vn * 1.08; if (vn < -180) { sfx('ld'); p.sq = min(1, -vn / 450); } }
    if (-(nx * sx + ny * sy) > .45) { p.g = .1; p.nx = nx; p.ny = ny; p.vx *= 1 - 1.6 * dt; p.vy *= 1 - 1.6 * dt; }
  }
};

const die = w => {
  if (st != 'play') return;
  st = 'over'; ot = 0; why = w; sh = 8; fl = .6;
  burst(p.x, p.y, '#fff4d0', 50, 180); burst(p.x, p.y, AX[q].c, 25, 120); sfx('die');
  if (score > S.b) { S.b = score; rec = 1; }
  S.d = max(S.d, depth); save();
};

const upd = dt => {
  t += dt;
  const dir = (K.ArrowRight || K.KeyD ? 1 : 0) - (K.ArrowLeft || K.KeyA ? 1 : 0);
  rv = lp(rv, dir * 3.3, min(1, dt * 14));
  const dth = rv * dt + drag; th += dth; drag = 0;
  q = ((round(th / (PI / 2)) % 4) + 4) % 4;
  if (q != pq) { pq = q; fl = .5; ban = 1.4; sh = max(sh, 2); sfx('sw'); burst(p.x, p.y, AX[q].c, 18, 100); }
  const ts = q == 3 ? .7 : 1, dts = dt * ts;
  for (let n = ceil(dts / .004), k = n; k--;) phys(dts / n);
  p.g -= dts; p.sq = max(0, p.sq - dt * 5);
  // animación de la criatura (en espacio de pantalla)
  const c_ = cos(th), s_ = sin(th), svx = p.vx * c_ - p.vy * s_;
  if (abs(svx) > 18) p.f = svx > 0 ? 1 : -1;
  if (p.g > 0) p.ph += abs(svx) * dt * .16;
  const ga_ = p.g > 0 ? cl(Math.atan2(p.nx * c_ - p.ny * s_, -(p.nx * s_ + p.ny * c_)), -.7, .7) : 0;
  p.an = lp(p.an, ga_, min(1, dt * 12));
  if ((jb -= dt) > 0 && p.g > 0) {
    const js = q == 1 ? 375 : 255, gx = sin(th), gy = cos(th), vg = p.vx * gx + p.vy * gy;
    p.vx -= gx * (vg + js); p.vy -= gy * (vg + js); p.g = 0; jb = 0; sfx('jp');
    burst(p.x + gx * 5, p.y + gy * 5, '#fff4d0', 6, 45);
  }
  // la luz: se gasta siempre, más al girar y más cuanto más hondo
  L -= dt * (2.4 + abs(dth / dt) * 1.3) * (1 + depth / 450) * (q == 3 ? 1.4 : 1);
  const pi = floor(p.x / T), pj = floor(p.y / T);
  if (q == 2) for (let j = pj - 3; j <= pj + 3; j++) for (let i = pi - 3; i <= pi + 3; i++) if (tile(i, j) == 7 && i >= 0 && i < CW) {
    L = min(100, L + 45 * dt); if (rnd() < dt * 20) pa(i * T + 6, j * T + 6, (p.x - i * T) * 2, (p.y - j * T) * 2, .4, '#ffd27a');
    if ((lpT -= dt) < 0) { lpT = .09; sfx('lp'); }
  }
  for (const e of E) if (!e.k && hypot(e.x - p.x, e.y - p.y) < p.r + 7) {
    e.k = 1; cr++; L = min(100, L + 16); score += 25; sfx('cr'); burst(e.x, e.y, '#e8fbff', 14, 90); burst(e.x, e.y, AX[q].c, 8, 60);
  }
  E = E.filter(e => !e.k && e.y > p.y - 600);
  // espinas
  for (let j = pj - 1; j <= pj + 1; j++) for (let i = pi - 1; i <= pi + 1; i++)
    if (tile(i, j) == 6 && i >= 0 && i < CW && hypot(cl(p.x, i * T + 2, i * T + T - 2) - p.x, cl(p.y, j * T + 5, j * T + T) - p.y) < p.r - 1) die('TE PINCHASTE');
  if (pj > depth) { score += (pj - depth) * 2; depth = pj; }
  // la Sombra cae desde arriba y acelera
  vY += min(120, 27 + depth * .075) * dt; vY = max(vY, p.y - 300);
  if (p.y - p.r < vY) die('LA SOMBRA TE ALCANZO');
  if (L <= 0) { L = 0; die('TE QUEDASTE SIN LUZ'); }
  if (L < 25 && (hb -= dt) < 0) { hb = .7; sfx('hb'); }
  if (!rec && S.b > 50 && score > S.b) { rec = 1; ban = 0; sfx('go'); burst(p.x, p.y, '#ffd75e', 40, 130); }
  while (gy < pj + 40) gen();
  const kc = floor(p.y / CH);
  for (const k of M.keys()) if (k < pj - 60) M.delete(k);
  for (const k of MT.keys()) if (k < kc - 3) { MT.delete(k); CF.delete(k); for (let n = 0; n < 4; n++) CC.delete(k * 4 + n); }
  camx = lp(camx, p.x, min(1, dt * 8)); camy = lp(camy, p.y, min(1, dt * 8));
  upP(dt); mus(dt);
};

// ---------- dibujo ----------
const ws = (x, y) => { const dx = (x - camx) * Z, dy = (y - camy) * Z, c = cos(th), s = sin(th); return [W / 2 + dx * c - dy * s, H / 2 + dx * s + dy * c]; };
const view = (ox, oy, f = 1) => { X.translate(W / 2 + ox, H / 2 + oy); X.rotate(th); X.scale(Z, Z); X.translate(-camx * f, -camy * f); };
const VR = 300; // radio visible en px de mundo

// capas lejanas: columnas, estalactitas y raíces en silueta, con paralaje
const far = (f, col, sd) => {
  X.save(); view(0, 0, f); X.fillStyle = col;
  const g = 70, cx = floor(camx * f / g), cy = floor(camy * f / g);
  for (let j = cy - 6; j <= cy + 6; j++) for (let i = cx - 6; i <= cx + 6; i++) {
    const h = hs(i * 7 + sd, j), h2 = hs(j * 3 + sd, i);
    if (h > .42) continue;
    const x0 = i * g + h2 * g, y0 = j * g, w = 6 + h2 * 16, hh = 50 + h * 260, up = h2 < .5;
    X.beginPath(); X.moveTo(x0 - w, y0);
    for (let n = 0; n <= 10; n++) { const u = n / 10; X.lineTo(x0 - w * (1 - u) * (.7 + .3 * sin(u * 9 + h * 30)) + sin(u * 5 + h2 * 9) * 4, y0 + (up ? -1 : 1) * u * hh); }
    for (let n = 10; n >= 0; n--) { const u = n / 10; X.lineTo(x0 + w * (1 - u) * (.7 + .3 * sin(u * 7 + h2 * 30)) + sin(u * 5 + h2 * 9) * 4, y0 + (up ? -1 : 1) * u * hh); }
    X.fill();
  }
  X.restore();
};

const cre = (x, y, s, f, an, ph, air, cc, tt) => {
  X.save(); X.translate(x, y); X.rotate(an); X.scale(s * f, s); X.translate(0, -2);
  X.lineCap = X.lineJoin = 'round';
  const E_ = (x_, y_, rx, ry) => { X.beginPath(); X.ellipse(x_, y_, rx, ry, 0, 0, 7); X.fill(); };
  const run = !air && abs(ph) > 0, sw = sin(tt * 6), fl_ = air ? -2.5 : sin(tt * 2.3) * .6;
  const leg = (hx_, hy_, a, w, c) => { X.strokeStyle = c; X.lineWidth = w; X.beginPath(); X.moveTo(hx_, hy_); const kx = hx_ + sin(a) * 2.8, ky = hy_ + cos(a) * 2.8; X.lineTo(kx, ky); X.lineTo(kx + sin(a * .4) * 2.4 + .4, ky + 2.4); X.stroke(); };
  const la = k => air ? (k < 2 ? .9 : -.8) : run ? sin(ph + k * PI / 2 + (k > 1) * .6) * .75 : 0;
  const ear = (bx, by, tx_, ty_, w, c) => { X.fillStyle = c; X.beginPath(); X.moveTo(bx - w, by); X.quadraticCurveTo(bx - w - 1, (by + ty_) / 2, tx_, ty_); X.quadraticCurveTo(bx + w + 1.5, (by + ty_) / 2 + 1, bx + w, by + .5); X.fill(); };
  for (let pass = 0; pass < 2; pass++) {
    const o = pass ? 0 : 1.1, dk = '#170b28', C1 = pass ? '#f7f4ff' : dk, C2 = pass ? '#c9c0ea' : dk;
    X.fillStyle = C1;
    // cola esponjosa
    for (let k = 0; k <= 8; k++) { const u = k / 8; X.beginPath(); X.arc(-5.5 - u * 9, -.5 - u * u * 7 + sin(tt * 5 - u * 3) * u * (air ? 1 : 2), 2.6 - u * 1.3 + o, 0, 7); X.fill(); }
    // patas del fondo, cuerpo, patas del frente
    leg(-3.6, 2.6, la(0) + PI * 0, 1.7 + o * 1.6, C2); leg(3.4, 2.6, la(2), 1.7 + o * 1.6, C2);
    X.fillStyle = C1; E_(0, 0, 6.6 + o, 4.5 + o);
    leg(-2.6, 3, la(1), 1.8 + o * 1.6, C1); leg(4.4, 3, la(3), 1.8 + o * 1.6, C1);
    // cabeza, hocico y orejas largas
    X.fillStyle = C1; E_(6.4, -4, 4.7 + o, 4.3 + o); E_(10, -2.6, 2.5 + o, 1.8 + o);
    ear(4.6, -7, -2.5 + fl_, -16.5, 1.6 + o, pass ? C2 : dk); ear(6.6, -7.4, .5 + fl_, -16, 1.7 + o, C1);
  }
  // detalles
  X.fillStyle = cc; ga(.85); ear(6.6, -7.6, 1 + fl_, -14.2, .7, cc); ga(1);
  X.fillStyle = '#ddd5f6'; ga(.7); E_(0, 2, 5.4, 2.2); ga(1);
  const bl = tt % 3.4 < .13;
  X.fillStyle = '#160b26'; E_(7.8, -4.6, 1.55, bl ? .3 : 2);
  if (!bl) { X.fillStyle = '#ffffff'; E_(8.3, -5.4, .6, .6); X.fillStyle = cc; ga(.6); E_(7.6, -3.6, .7, .45); ga(1); }
  X.fillStyle = '#2a1838'; E_(12.3, -2.9, .75, .6);
  X.fillStyle = '#ff9ac8'; ga(.65); E_(9, -2, 1.2, .7); ga(1);
  X.fillStyle = cc; X.beginPath(); X.moveTo(3.8, -7.2); X.lineTo(4.6, -6); X.lineTo(3.8, -4.8); X.lineTo(3, -6); X.fill();
  X.beginPath(); X.arc(-14.5, -7.5 + sin(tt * 5 - 3) * (air ? 1 : 2), 1.3, 0, 7); X.fill();
  X.restore();
};

const draw = () => {
  const ax = AX[q], ox = round((rnd() - .5) * sh * 2), oy = round((rnd() - .5) * sh * 2);
  X.setTransform(1, 0, 0, 1, 0, 0); X.imageSmoothingEnabled = true;
  // niebla de color del axioma
  const g = X.createRadialGradient(W / 2, H * .5, 0, W / 2, H * .5, W * .7);
  g.addColorStop(0, mix(ax.c, '#07050f', .74)); g.addColorStop(.55, mix(ax.c, '#06040c', .88)); g.addColorStop(1, '#030208');
  X.fillStyle = g; X.fillRect(0, 0, W, H);
  far(.35, mix(ax.c, '#06040c', .8), 1); far(.6, mix(ax.c, '#05030a', .9), 2);
  // polvo luminoso
  X.globalCompositeOperation = 'lighter';
  for (const d of DM) { const [a, b] = ws(d.x, d.y); ga(.25 + .25 * sin(t * 2 + d.ph)); X.fillStyle = mix(ax.c, '#ffffff', .5); X.fillRect(a, b, d.s * 2, d.s * 2); }
  ga(1); X.globalCompositeOperation = 'source-over';
  // escenario
  X.save(); view(ox, oy);
  fr(-3000, -4000, 3000 - PX + 1, 9000 + camy * 2, '#030207'); fr(CW * T + PX - 1, -4000, 3000, 9000 + camy * 2); fr(-3000, -4000, 6000, 4000);
  for (let k = max(0, floor((camy - VR) / CH)); k <= floor((camy + VR) / CH); k++) X.drawImage(chunk(k, q), -PX, k * CH - PAD, FW * C, CH + PAD * 2);
  // semillas de luz
  for (const e of E) {
    const b = 2 + sin(t * 5 + e.ph) * .6;
    X.fillStyle = '#ffffff'; X.beginPath(); X.arc(e.x, e.y, b, 0, 7); X.fill();
    X.strokeStyle = mix(ax.c, '#ffffff', .5); X.lineWidth = .7; X.beginPath(); const a = t * 2 + e.ph;
    for (let n = 0; n < 4; n++) { const aa = a + n * PI / 2; X.moveTo(e.x + cos(aa) * 2.5, e.y + sin(aa) * 2.5); X.lineTo(e.x + cos(aa) * 6, e.y + sin(aa) * 6); } X.stroke();
  }
  // la Sombra: masa viva con tentáculos
  X.fillStyle = '#000000'; X.beginPath(); X.moveTo(-400, vY - 3000);
  for (let x = -400; x <= CW * T + 400; x += 5) X.lineTo(x, vY + sin(x * .09 + t * 4) * 4 + sin(x * .031 - t * 1.7) * 6 + max(0, sin(x * .23 + t)) ** 6 * 14);
  X.lineTo(CW * T + 400, vY - 3000); X.fill();
  X.strokeStyle = '#9a3aff'; X.lineWidth = 1.2; X.stroke();
  for (const e of P) { ga(e.l / e.m); X.fillStyle = e.c; X.fillRect(e.x - .8, e.y - .8, 1.6, 1.6); } ga(1);
  X.restore();
  // luz de la criatura
  const [px, py] = ws(p.x, p.y), ci = floor(camx / T), cj = floor(camy / T), lamps = [];
  for (let j = cj - 25; j <= cj + 25; j++) for (const i of [0, CW - 1]) if (tile(i, j) == 7) lamps.push(ws(i * T + 6, j * T + 7));
  DX.globalCompositeOperation = 'source-over'; DX.clearRect(0, 0, W, H);
  DX.fillStyle = `rgba(3,2,8,${lp(.9, .5, L / 100)})`; DX.fillRect(0, 0, W, H);
  DX.globalCompositeOperation = 'destination-out';
  if (st != 'over') lt(DX, '#ffffff', px + ox, py + oy, (60 + L * 1.6) * Z);
  for (const e of E) { const [a, b] = ws(e.x, e.y); lt(DX, '#ffffff', a + ox, b + oy, 26 * Z, .5); }
  if (q == 2) for (const [a, b] of lamps) lt(DX, '#ffffff', a + ox, b + oy, 70 * Z);
  X.drawImage(DC, 0, 0);
  X.globalCompositeOperation = 'lighter';
  if (st != 'over') { lt(X, '#fff0d0', px + ox, py + oy, (18 + L * .1) * Z, .5); lt(X, ax.c, px + ox, py + oy, 40 * Z, .14); }
  if (q == 2) for (const [a, b] of lamps) lt(X, '#ffb347', a + ox, b + oy, 30 * Z, .8);
  for (const e of E) { const [a, b] = ws(e.x, e.y); lt(X, '#bfe6ff', a + ox, b + oy, 12 * Z, .6); }
  X.globalCompositeOperation = 'source-over';
  if (st == 'play') cre(px + ox, py + oy, Z, p.f, p.an, p.ph, p.g <= 0, ax.c, t);
  if (fl > 0) { ga(fl * .35); fr(0, 0, W, H, ax.c); ga(1); }
  // interfaz (en una rejilla de 480x270, a escala 2)
  X.setTransform(2, 0, 0, 2, 0, 0);
  const U = W / 2, V = H / 2;
  if (st == 'title') {
    ga(.5); fr(0, 0, U, V, '#05040b'); ga(1);
    const lw = tx('AXIOMI', -999, 0, '#000', 9);
    let x = U / 2 - lw / 2; 'AXIOMI'.split('').forEach((ch, i) => { const c = AX[(i + floor(t * 2)) % 4].c, y = 34 + sin(t * 3 + i) * 3; tx(ch, x, y, c, 9); x += 6.4 * .95 * 9; });
    txs('GIRA EL MUNDO. CAMBIA SUS REGLAS.', U / 2, 96, '#e8e4ff', 2, 1);
    X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'lighter'; lt(X, ax.c, W / 2, 290, 120, .35); X.globalCompositeOperation = 'source-over';
    cre(W / 2, 314, 5, 1, 0, t * 9, 0, ax.c, t); X.setTransform(2, 0, 0, 2, 0, 0);
    AX.forEach((a, k) => { tx(a.n, 90 + k * 100, 176, a.c, 1, 1); });
    txs('<  >  GIRAR       ESPACIO  SALTAR', U / 2, 196, '#b8b0e0', 1, 1);
    txs('SOLO LO DEL COLOR DEL AXIOMA ES SOLIDO', U / 2, 208, '#8a84b8', 1, 1);
    if (t % 1 < .65) txs('PULSA ESPACIO', U / 2, 226, '#ffffff', 2, 1);
    if (S.b) txs('RECORD ' + S.b + '   PROF ' + S.d + 'M', U / 2, 252, '#ffd75e', 1, 1);
    return;
  }
  // barra de luz
  const lc = L < 25 && t % .4 < .2 ? '#ff4060' : '#ffe9a8';
  X.lineCap = 'round'; X.lineWidth = 3; X.strokeStyle = '#ffffff22'; X.beginPath(); X.moveTo(12, 13); X.lineTo(108, 13); X.stroke();
  X.save(); X.shadowColor = lc; X.shadowBlur = 10; X.strokeStyle = lc; X.beginPath(); X.moveTo(12, 13); X.lineTo(12 + 96 * L / 100, 13); X.stroke(); X.restore();
  txs('LUZ', 116, 10, lc);
  txs(depth + 'M', U - 10, 8, '#ffffff', 3, 2); txs(score + ' PTS', U - 10, 33, '#9ad8ff', 1, 2);
  // brújula de axiomas
  const cx = U - 26, cy = V - 26;
  X.lineWidth = .8; X.strokeStyle = '#ffffff30'; X.beginPath(); X.arc(cx, cy, 13, 0, 7); X.stroke();
  for (let k = 0; k < 4; k++) {
    const a = k * PI / 2 - th, on = k == q; X.save(); if (on) { X.shadowColor = AX[k].c; X.shadowBlur = 10; }
    X.fillStyle = on ? AX[k].c : AX[k].k; X.beginPath(); X.arc(cx + sin(a) * 13, cy - cos(a) * 13, on ? 3.4 : 2.2, 0, 7); X.fill(); X.restore();
  }
  X.strokeStyle = '#ffffff'; X.lineWidth = 1; X.beginPath(); X.moveTo(cx, cy - 7); X.lineTo(cx, cy - 2); X.stroke(); X.beginPath(); X.arc(cx, cy, 1.2, 0, 7); X.fillStyle = '#ffffff'; X.fill();
  txs(ax.n, U - 46, V - 29, ax.c, 1, 2);
  if (ban > 0 && st == 'play') { ga(min(1, ban * 2)); txs(ax.n, U / 2, 44, ax.c, 4, 1); txs(ax.h, U / 2, 72, '#e8e4ff', 1, 1); ga(1); }
  if (st == 'play' && t < 6 && S.n < 4) txs('INCLINA EL MUNDO PARA CORRER. BAJA.', U / 2, V - 20, '#e8e4ff', 1, 1);
  if (st == 'over') {
    ga(min(.7, ot * 2)); fr(0, 0, U, V, '#05040b'); ga(1);
    txs('APAGADO', U / 2, 50, '#ff6080', 4, 1);
    txs(why, U / 2, 86, '#e8e4ff', 1, 1);
    txs(depth + 'M', U / 2, 106, '#ffffff', 4, 1);
    txs(score + ' PTS   ' + cr + ' SEMILLAS', U / 2, 140, '#9ad8ff', 1, 1);
    txs(rec ? 'NUEVO RECORD!' : 'RECORD ' + S.b, U / 2, 156, '#ffd75e', 1, 1);
    if (ot > .4 && t % 1 < .7) txs('ESPACIO: OTRA VEZ', U / 2, 192, '#ffffff', 2, 1);
  }
};

// ---------- entrada ----------
const K = {};
const act = () => { au(); if (st == 'play') jb = .12; else if (st == 'title' || ot > .4) start(); };
onkeydown = e => {
  au(); K[e.code] = 1;
  if (/Arrow|Space/.test(e.code)) e.preventDefault();
  if (!e.repeat && /Space|ArrowUp|KeyW|Enter/.test(e.code)) act();
  if (e.code == 'KeyM') { S.m ^= 1; save(); if (MG) MG.gain.value = S.m ? 0 : .5; }
};
onkeyup = e => K[e.code] = 0;
let pd = 0;
cv.onpointerdown = e => { au(); pd = { x: e.clientX, m: 0 }; };
onpointermove = e => { if (!pd) return; const dx = (e.clientX - pd.x) * W / cv.clientWidth; pd.x = e.clientX; pd.m += abs(dx); if (st == 'play') drag += dx * .015; };
onpointerup = () => { if (pd && pd.m < 4) act(); pd = 0; };

// ---------- bucle ----------
let t0 = 0;
const loop = ts => {
  requestAnimationFrame(loop);
  const dt = min(.033, (ts - t0) / 1000 || 0); t0 = ts;
  if (st == 'play') upd(dt);
  else {
    t += dt; ot += dt; upP(dt); mus(dt);
    if (st == 'title') { th = sin(t * .45) * 2.4; q = pq = ((round(th / (PI / 2)) % 4) + 4) % 4; camy = lp(camy, 60 + t * 9 % 450, .05); camx = CW * T / 2; }
  }
  sh = max(0, sh - dt * 12); fl = max(0, fl - dt * 2.5); ban -= dt;
  draw();
};
reset();
requestAnimationFrame(loop);
})();
