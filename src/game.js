// AXIOMI — gira el mundo, cambia sus reglas. Todo dibujado y sonado con código.
(() => {
'use strict';
const W = 480, H = 270, T = 12, CW = 20, RH = 12, G = 650, MV = 400;
const { floor, min, max, abs, sin, cos, hypot, PI, random: rnd, round, sqrt, ceil } = Math, D = document;
const cl = (v, a, b) => v < a ? a : v > b ? b : v, lp = (a, b, k) => a + (b - a) * k;
const rr = (a, b) => a + rnd() * (b - a), ri = (a, b) => floor(rr(a, b + 1)), pk = a => a[floor(rnd() * a.length)];
const hs = (i, j) => { let h = Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; };
const mk = (w, h) => { const c = D.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; };
const cv = D.getElementById('c'), X = cv.getContext('2d');
cv.width = W; cv.height = H; X.imageSmoothingEnabled = false;
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

// ---------- fuente pixel 3x5 ----------
const FC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 :.%+-/!?><x,';
const FG = '25755 65656 34443 65556 74647 74644 34553 55755 72227 11152 55655 44447 hrlhh hpljh 25552 65644 25573 65655 34216 72222 55557 55552 hhlrh 55255 55222 71247 75557 26227 61247 61216 55711 74616 34757 71122 75757 75716 00000 02020 00002 51245 02720 00700 11244 22202 61202 42124 12421 05250 00024'.split(' ');
const gw = g => /[89a-v]/.test(FG[g]) ? 5 : 3;
const gi = ch => { const g = FC.indexOf(ch); return g < 0 ? FC.indexOf(ch.toUpperCase()) : g; };
const tx = (s, x, y, c, sc = 1, al = 0) => {
  s = '' + s; let w = -sc;
  for (const ch of s) { const g = gi(ch); if (g >= 0) w += (gw(g) + 1) * sc; }
  x = round(al == 1 ? x - w / 2 : al == 2 ? x - w : x); y = round(y);
  X.fillStyle = c;
  for (const ch of s) {
    const g = gi(ch); if (g < 0) continue;
    const n = gw(g);
    for (let r = 0; r < 5; r++) { const b = parseInt(FG[g][r], 32); for (let q = 0; q < n; q++) if (b >> n - 1 - q & 1) X.fillRect(x + q * sc, y + r * sc, sc, sc); }
    x += (n + 1) * sc;
  }
  return w;
};
const txs = (s, x, y, c, sc = 1, al = 0) => { tx(s, x, y + sc, '#000000', sc, al); return tx(s, x, y, c, sc, al); };

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
// tiles: 0 aire · 1 roca · 2..5 bloque del axioma 0..3 · 6 púas · 7 lámpara
let st = 'title', t = 0, th = 0, rv = 0, q = 0, pq = 0, M = new Map(), gy = 0, E = [], P = [], p = {}, L = 100, score = 0, cr = 0, depth = 0,
  vY = 0, camx = 0, camy = 0, sh = 0, fl = 0, ban = 0, ot = 0, jb = 0, drag = 0, why = '', hb = 0, pgx = 8, pgw = 4, rec = 0, lpT = 0;
const Z = new Uint8Array(CW);
const tile = (i, j) => i < 0 || i >= CW || j < 0 ? 1 : (M.get(j) || Z)[i];
const solT = v => v == 1 || v > 1 && v < 6 && v - 2 == q;
const sol = (i, j) => solT(tile(i, j));
const DN = [0, 1, 3]; // axiomas en los que la gravedad aún apunta hacia abajo

const gen = () => {
  const j0 = gy, d = min(1, j0 / 1400), R = [], F = RH - 1;
  for (let k = 0; k < RH; k++) R.push(new Uint8Array(CW));
  const st_ = (i, k, v) => { if (i >= 0 && i < CW && k >= 0 && k < RH) R[k][i] = v; };
  const gw = j0 < 40 ? 4 : ri(2, 3) + (rnd() < .3 - d * .3), pat = j0 < 30 ? 0 : pk(j0 < 140 ? [0, 0, 3, 1] : j0 < 300 ? [0, 1, 3, 2, 4] : [0, 1, 2, 2, 3, 4, 4]);
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
    for (let n = ri(1, 3); n--;) { const i = ri(1, CW - 2), k = ri(1, F - 3); if (!R[k][i]) E.push({ x: i * T + 6, y: (j0 + k) * T + 6, ph: rnd() * 6 }); }
  }
  pgx = gx; pgw = gw;
  R.forEach((r, k) => M.set(j0 + k, r)); gy += RH;
};

const reset = () => {
  M.clear(); E = []; P = []; gy = 0; pgx = 8; pgw = 4;
  while (gy < 60) gen();
  p = { x: CW * T / 2, y: 3 * T, vx: 0, vy: 0, r: 5.5, g: 0, sq: 0 };
  th = rv = 0; q = pq = 0; L = 100; score = cr = depth = 0; vY = -220; camx = p.x; camy = p.y; rec = 0; hb = 0;
};
const start = () => { reset(); st = 'play'; t = 0; ban = 2.2; S.n++; save(); sfx('go'); };

// ---------- partículas ----------
const pa = (x, y, vx, vy, l, c) => P.push({ x, y, vx, vy, l, m: l, c });
const burst = (x, y, c, n, s) => { for (let i = 0; i < n; i++) { const a = rnd() * 7, v = rr(.2, 1) * s; pa(x, y, cos(a) * v, sin(a) * v, rr(.3, .8), c); } };
const upP = dt => { for (const e of P) { e.x += e.vx * dt; e.y += e.vy * dt; e.vx *= 1 - 2 * dt; e.vy *= 1 - 2 * dt; e.l -= dt; } P = P.filter(e => e.l > 0); };

// ---------- física ----------
const phys = dt => {
  const sx = sin(th), sy = cos(th);
  p.vx += sx * G * dt; p.vy += sy * G * dt;
  const sp = hypot(p.vx, p.vy); if (sp > MV) { p.vx *= MV / sp; p.vy *= MV / sp; }
  p.x += p.vx * dt; p.y += p.vy * dt;
  const r = p.r;
  for (let j = floor((p.y - r) / T); j <= floor((p.y + r) / T); j++) for (let i = floor((p.x - r) / T); i <= floor((p.x + r) / T); i++) {
    if (!sol(i, j)) continue;
    const cx = cl(p.x, i * T, i * T + T), cy = cl(p.y, j * T, j * T + T), dx = p.x - cx, dy = p.y - cy, d = hypot(dx, dy);
    if (d >= r) continue;
    if (d < .01) { p.x -= sx * 2; p.y -= sy * 2; continue; } // dentro de un bloque que acaba de solidificarse
    const nx = dx / d, ny = dy / d, vn = p.vx * nx + p.vy * ny;
    p.x += nx * (r - d); p.y += ny * (r - d);
    if (vn < 0) { p.vx -= nx * vn * 1.12; p.vy -= ny * vn * 1.12; if (vn < -180) { sfx('ld'); p.sq = min(1, -vn / 450); } }
    if (-(nx * sx + ny * sy) > .5) p.g = .1;
  }
};

const die = w => {
  if (st != 'play') return;
  st = 'over'; ot = 0; why = w; sh = 6; fl = .6;
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
  if (q != pq) { pq = q; fl = .5; ban = 1.4; sh = max(sh, 1.5); sfx('sw'); burst(p.x, p.y, AX[q].c, 18, 100); }
  const ts = q == 3 ? .7 : 1, dts = dt * ts;
  for (let n = ceil(dts / .004), k = n; k--;) phys(dts / n);
  p.g -= dts; p.sq = max(0, p.sq - dt * 5);
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
  // púas
  for (let j = pj - 1; j <= pj + 1; j++) for (let i = pi - 1; i <= pi + 1; i++)
    if (tile(i, j) == 6 && i >= 0 && i < CW && hypot(cl(p.x, i * T + 2, i * T + T - 2) - p.x, cl(p.y, j * T + 5, j * T + T) - p.y) < p.r - .5) die('TE PINCHASTE');
  if (pj > depth) { score += (pj - depth) * 2; depth = pj; }
  // la Sombra cae desde arriba y acelera
  vY += min(120, 27 + depth * .075) * dt; vY = max(vY, p.y - 300);
  if (p.y - p.r < vY) die('LA SOMBRA TE ALCANZO');
  if (L <= 0) { L = 0; die('TE QUEDASTE SIN LUZ'); }
  if (L < 25 && (hb -= dt) < 0) { hb = .7; sfx('hb'); }
  if (!rec && S.b > 50 && score > S.b) { rec = 1; ban = 0; sfx('go'); burst(p.x, p.y, '#ffd75e', 40, 130); }
  while (gy < pj + 40) gen();
  for (const k of M.keys()) if (k < pj - 60) M.delete(k);
  camx = lp(camx, p.x, min(1, dt * 8)); camy = lp(camy, p.y, min(1, dt * 8));
  upP(dt); mus(dt);
};

// ---------- dibujo ----------
const ws = (x, y) => { const dx = x - round(camx), dy = y - round(camy), c = cos(th), s = sin(th); return [W / 2 + dx * c - dy * s, H / 2 + dx * s + dy * c]; };
const VR = 25; // radio visible en tiles
const view = (ox, oy) => { X.translate(W / 2 + ox, H / 2 + oy); X.rotate(th); X.translate(-round(camx), -round(camy)); };
const spk = (x, y) => { X.beginPath(); for (let s = 0; s < 3; s++) { X.moveTo(x + s * 4, y + T); X.lineTo(x + s * 4 + 2, y + 3 + (s & 1) * 2); X.lineTo(x + s * 4 + 4, y + T); } X.fill(); };
// íconos de 4x4 de cada axioma (bits por fila): ola, rombo, sol, hoja
const IC = ['0960', '6996', '6ff6', '1374'];
const icon = (k, x, y, c) => { for (let r = 0; r < 4; r++) { const b = parseInt(IC[k][r], 16); for (let s = 0; s < 4; s++) if (b >> 3 - s & 1) fr(x + s, y + r, 1, 1, c); } };

const world = () => {
  const ci = floor(camx / T), cj = floor(camy / T);
  const bw = mix('#100c24', AX[q].k, .3), bs = mix('#08061a', AX[q].k, .12), bv = mix('#16123a', AX[q].k, .35);
  fr(0, cj * T - VR * T, CW * T, VR * T * 2, bw);
  for (let j = cj - VR; j <= cj + VR; j++) for (let i = ci - VR; i <= ci + VR; i++) {
    const v = tile(i, j), x = i * T, y = j * T, h = hs(i, j), h2 = hs(j, i + 77);
    if (i < 0 || i >= CW || j < 0) {
      if (i > -12 && i < CW + 11) { fr(x, y, T, T, '#13102a'); if (h < .3) fr(x + (h * 99 % 9 | 0), y + (h2 * 9 | 0), 3, 2, '#1b1736'); if (h2 < .2) fr(x + 2, y + (h * 8 | 0), 1, 3, '#0d0b1e'); }
      continue;
    }
    if (!v || v > 5) { // muro del fondo: sillares, grietas y runas antiguas
      const o = j & 1 ? 6 : 0;
      fr(x, y, T, 1, bs); fr(x + o, y, 1, T, bs);
      if (h < .3) fr(x + 2, y + 2, T - 4, T - 4, bv); else if (h < .4) fr(x + 1, y + T - 3, T - 2, 2, bs);
      if (h > .93) { const c = mix('#1a1636', AX[q].c, .25); for (let r = 0; r < 5; r++) for (let s = 0; s < 3; s++) if (hs(i * 7 + s, j * 5 + r) < .5) fr(x + 4 + s * 2, y + 1 + r * 2, 1, 1, c); }
      if (h2 < .06) { fr(x + 3, y + 4, 1, 3, '#05040b'); fr(x + 4, y + 7, 1, 3); }
    }
    if (v == 1) { // roca
      fr(x, y, T, T, '#1d1934'); fr(x, y + T - 2, T, 2, '#17142c');
      if (!sol(i, j - 1)) fr(x, y, T, 3, '#2a2550');
      fr(x + (h * 7 | 0), y + 4 + (h2 * 5 | 0), 3, 1, '#272244'); if (h < .35) fr(x + (h2 * 9 | 0), y + 8, 2, 2, '#120f24');
    } else if (v > 1 && v < 6) { // bloque de axioma
      const k = v - 2, a = AX[k];
      if (k == q) { fr(x, y, T, T, a.k); fr(x + 1, y + 1, T - 2, T - 2, mix(a.k, a.c, .3)); fr(x + 1, y + 1, T - 2, 1, mix(a.c, '#ffffff', .3)); fr(x + 1, y + 1, 1, T - 2); icon(k, x + 4, y + 4, a.c); }
      else { ga(.35); icon(k, x + 4, y + 4, a.k); ga(1); }
    } else if (v == 7) { // lámpara de pared
      const on = q == 2;
      fr(x + 5, y, 2, 3, '#3a2a14'); fr(x + 3, y + 3, 6, 1, '#5a4020'); fr(x + 3, y + 4, 6, 6, '#2a1d0e'); fr(x + 4, y + 5, 4, 4, on ? '#fff1c0' : '#4a3418'); fr(x + 3, y + 10, 6, 1, '#5a4020');
      if (on) fr(x + 5, y + 6, 2, 2, '#ffffff');
    }
  }
};
// contornos fluorescentes: lo que importa se lee aunque esté oscuro
const neon = () => {
  const ci = floor(camx / T), cj = floor(camy / T), c = AX[q].c, cb = mix(c, '#ffffff', .5);
  for (let j = cj - VR; j <= cj + VR; j++) for (let i = max(-1, ci - VR); i <= min(CW, ci + VR); i++) {
    const v = tile(i, j), x = i * T, y = j * T, h = hs(i, j);
    if (v == 6) { X.fillStyle = '#ff3b5c'; spk(x, y); fr(x + 2, y + 4, 1, 1, '#ffd0d8'); fr(x + 6, y + 6, 1, 1); fr(x + 10, y + 4, 1, 1); continue; }
    if (v > 1 && v < 6 && v - 2 != q) { // fantasma: sólo esquinas punteadas
      const a = AX[v - 2].c; ga(.5); X.fillStyle = a;
      fr(x, y, 3, 1); fr(x, y, 1, 3); fr(x + T - 3, y + T - 1, 3, 1); fr(x + T - 1, y + T - 3, 1, 3); fr(x + T - 3, y, 3, 1); fr(x, y + T - 1, 3, 1);
      ga(1); continue;
    }
    if (!solT(v)) continue;
    const e = v == 1 ? c : AX[v - 2].c, al = v == 1 ? .6 : 1, up = !sol(i, j - 1);
    ga(al); X.fillStyle = e;
    if (up) fr(x, y, T, 1);
    if (!sol(i, j + 1)) fr(x, y + T - 1, T, 1);
    if (!sol(i - 1, j)) fr(x, y, 1, T);
    if (!sol(i + 1, j)) fr(x + T - 1, y, 1, T);
    // brotes fluorescentes sobre la roca: cambian de forma y color con el axioma
    if (v == 1 && up && j >= 0) {
      ga(1);
      for (let s = 0; s < 3; s++) {
        const hh = hs(i * 3 + s, j), sx = x + 1 + (hh * 10 | 0), sw = sin(t * 3 + hh * 9);
        if (hh > .55) continue;
        if (q == 0) { fr(sx, y - 2 - (hh * 4 | 0), 1, 2 + (hh * 4 | 0), c); fr(sx, y - 3 - (hh * 4 | 0), 1, 1, cb); }
        else if (q == 1) { if ((t * 2 + hh * 5) % 1 < .5) fr(sx, y - 2, 2, 2, c); fr(sx, y - 1, 2, 1, cb); }
        else if (q == 2) { fr(sx, y - 1, 1, 1, c); if (hh < .25) fr(sx + (sw > 0), y - 3 - (hh * 8 | 0), 1, 1, cb); }
        else { fr(sx, y - 3, 1, 3, c); fr(sx + (sw > 0 ? 1 : -1), y - 4, 1, 1, cb); fr(sx + 1, y - 2, 1, 1, c); }
      }
    }
    ga(1);
  }
  // la Sombra
  fr(-120, vY - 1300, CW * T + 240, 1300, '#000000');
  for (let x = -120; x < CW * T + 120; x += 2) { const w = sin(x * .12 + t * 5) * 4 + sin(x * .035 - t * 2) * 5; fr(x, vY + w - 5, 2, 5, '#2a0a3e'); fr(x, vY + w, 2, 1, '#9a3aff'); if (hs(x, floor(t * 8)) < .05) fr(x, vY + w + 2 + hs(x, 3) * 6, 1, 1, '#c070ff'); }
  for (const e of E) { // cristales facetados
    const b = 3 + round(sin(t * 5 + e.ph) * 1.5), x = round(e.x), y = round(e.y);
    for (let r = -b - 1; r <= b + 1; r++) { const w = b + 1 - abs(r); fr(x - w, y + r, w * 2 + 1, 1, r < 0 ? '#e8fbff' : '#9fd8ff'); }
    fr(x, y - b, 1, b * 2 + 1, '#ffffff'); fr(x - 1, y - 1, 1, 1, c);
  }
  for (const e of P) { ga(e.l / e.m); fr(e.x, e.y, 2, 2, e.c); } ga(1);
};

const hero = (x, y) => {
  x = round(x); y = round(y);
  const ct = cos(th), stt = sin(th), vx = p.vx * ct - p.vy * stt, vy = p.vx * stt + p.vy * ct,
    sq = p.sq, rx = 6 + round(sq * 2), ry = 6 - round(sq * 2), ex = cl(round(vx / 90), -1, 1), ey = cl(round(vy / 120), -1, 1), oy = round(sq * 2);
  const disc = (r1, r2, f) => { for (let b = -r2; b <= r2; b++) { const w = round(r1 * sqrt(max(0, 1 - b * b / ((r2 + .5) * (r2 + .5))))); fr(x - w, y + b + oy, w * 2 + 1, 1, f(b / r2)); } };
  // estela
  ga(.35); fr(x - round(vx / 40) - 1, y - round(vy / 40) + oy - 1, 3, 3, AX[q].c); ga(.2); fr(x - round(vx / 20) - 1, y - round(vy / 20) + oy - 1, 3, 3); ga(1);
  // antena con brote de luz
  fr(x + ex, y - ry - 3 + oy, 1, 3, '#241034'); fr(x + ex + 1, y - ry - 5 + oy, 1, 2); fr(x + ex + 1, y - ry - 6 + oy, 2, 2, AX[q].c);
  disc(rx + 1, ry + 1, () => '#241034');
  disc(rx, ry, b => b < -.4 ? '#fffbe8' : b < .35 ? '#fff0c4' : b < .75 ? '#ffd27a' : '#ffb04a');
  fr(x - 3, y - ry + 1 + oy, 3, 1, '#ffffff'); fr(x - 4, y - ry + 2 + oy, 1, 1);
  const bl = t % 3.2 < .12, e1 = x - 3 + ex, e2 = x + 2 + ex, ye = y - 2 + ey + oy;
  if (bl) { fr(e1, ye + 1, 2, 1, '#1a0f2e'); fr(e2, ye + 1, 2, 1); }
  else { fr(e1, ye, 2, 3, '#1a0f2e'); fr(e2, ye, 2, 3); fr(e1, ye, 1, 1, '#ffffff'); fr(e2, ye, 1, 1); }
  fr(x - 5 + ex, y + 2 + oy, 2, 1, '#ff8ab8'); fr(x + 4 + ex, y + 2 + oy, 2, 1);
  fr(x - 1 + ex, y + 2 + oy + (p.g > 0 ? 0 : 1), 2, 1, '#8a3a2a');
};

const compass = (cx, cy) => {
  ga(.6); for (let k = 0; k < 24; k++) { const a = k * PI / 12; fr(round(cx + sin(a) * 13), round(cy - cos(a) * 13), 1, 1, '#3a3460'); } ga(1);
  for (let k = 0; k < 4; k++) {
    const a = k * PI / 2 - th, x = round(cx + sin(a) * 13), y = round(cy - cos(a) * 13), on = k == q;
    fr(x - (on ? 3 : 2), y - (on ? 3 : 2), on ? 7 : 5, on ? 7 : 5, on ? AX[k].c : AX[k].k); if (on) icon(k, x - 2, y - 2, '#ffffff');
  }
  fr(cx, cy - 19, 1, 4, '#ffffff'); fr(cx - 1, cy - 1, 3, 3, '#ffffff');
};

const draw = () => {
  const ax = AX[q], ox = round((rnd() - .5) * sh * 2), oy = round((rnd() - .5) * sh * 2);
  X.setTransform(1, 0, 0, 1, 0, 0);
  fr(0, 0, W, H, mix('#05040b', ax.k, .3));
  X.save(); view(ox, oy); world(); X.restore();
  // oscuridad
  const [px, py] = ws(p.x, p.y), ci = floor(camx / T), cj = floor(camy / T), lamps = [];
  if (q == 2) for (let j = cj - VR; j <= cj + VR; j++) for (const i of [0, CW - 1]) if (tile(i, j) == 7) lamps.push(ws(i * T + 6, j * T + 6));
  DX.globalCompositeOperation = 'source-over'; DX.clearRect(0, 0, W, H);
  DX.fillStyle = `rgba(4,2,12,${lp(.93, .62, L / 100)})`; DX.fillRect(0, 0, W, H);
  DX.globalCompositeOperation = 'destination-out';
  if (st != 'over') lt(DX, '#ffffff', px + ox, py + oy, 50 + L * 1.4);
  for (const e of E) { const [a, b] = ws(e.x, e.y); lt(DX, '#ffffff', a + ox, b + oy, 22, .6); }
  for (const [a, b] of lamps) lt(DX, '#ffffff', a + ox, b + oy, 60);
  X.drawImage(DC, 0, 0);
  X.save(); view(ox, oy); neon(); X.restore();
  // brillos
  X.globalCompositeOperation = 'lighter';
  if (st != 'over') { lt(X, '#ffe8b0', px + ox, py + oy, 26 + L * .15, .55); lt(X, ax.c, px + ox, py + oy, 46, .16); }
  for (const [a, b] of lamps) lt(X, '#ffb347', a + ox, b + oy, 40, .7);
  for (const e of E) { const [a, b] = ws(e.x, e.y); lt(X, '#9fd8ff', a + ox, b + oy, 16, .5); }
  X.globalCompositeOperation = 'source-over';
  if (st != 'over') hero(px + ox, py + oy);
  if (fl > 0) { ga(fl * .4); fr(0, 0, W, H, ax.c); ga(1); }
  // interfaz
  if (st == 'title') {
    ga(.55); fr(0, 0, W, H, '#05040b'); ga(1);
    const lw = tx('AXIOMI', -999, 0, '#000', 9);
    let x = W / 2 - lw / 2; 'AXIOMI'.split('').forEach((ch, i) => { const c = AX[(i + floor(t * 2)) % 4].c, y = 50 + sin(t * 3 + i) * 3; tx(ch, x, y + 9, '#000000', 9); x += tx(ch, x, y, c, 9) + 9; });
    txs('GIRA EL MUNDO. CAMBIA SUS REGLAS.', W / 2, 118, '#e8e4ff', 2, 1);
    AX.forEach((a, k) => { const x = 90 + k * 100; fr(x - 4, 141, 8, 8, a.k); icon(k, x - 2, 143, a.c); tx(a.n, x, 154, a.c, 1, 1); });
    txs('<  >  GIRAR       ESPACIO  SALTAR', W / 2, 180, '#b8b0e0', 1, 1);
    txs('SOLO LO DEL COLOR DEL AXIOMA ES SOLIDO', W / 2, 192, '#8a84b8', 1, 1);
    if (t % 1 < .65) txs('PULSA ESPACIO', W / 2, 214, '#ffffff', 2, 1);
    if (S.b) txs('RECORD ' + S.b + '   PROF ' + S.d + 'M', W / 2, 248, '#ffd75e', 1, 1);
    return;
  }
  fr(8, 8, 96, 9, '#1a1530'); fr(9, 9, round(94 * L / 100), 7, L < 25 && t % .4 < .2 ? '#ff4060' : '#ffe9a8'); fr(9, 9, round(94 * L / 100), 2, '#ffffff');
  txs('LUZ', 110, 10, '#ffe9a8');
  txs(depth + 'M', W - 8, 8, '#ffffff', 3, 2); txs(score + ' PTS', W - 8, 28, '#9ad8ff', 1, 2);
  compass(W - 26, H - 26); txs(ax.n, W - 46, H - 29, ax.c, 1, 2);
  if (ban > 0 && st == 'play') { ga(min(1, ban * 2)); txs(ax.n, W / 2, 44, ax.c, 4, 1); txs(ax.h, W / 2, 72, '#e8e4ff', 1, 1); ga(1); }
  if (st == 'play' && t < 6 && S.n < 4) txs('INCLINA EL MUNDO PARA RODAR. BAJA.', W / 2, H - 20, '#e8e4ff', 1, 1);
  if (st == 'over') {
    ga(min(.7, ot * 2)); fr(0, 0, W, H, '#05040b'); ga(1);
    txs('APAGADO', W / 2, 50, '#ff6080', 4, 1);
    txs(why, W / 2, 86, '#e8e4ff', 1, 1);
    txs(depth + 'M', W / 2, 106, '#ffffff', 4, 1);
    txs(score + ' PTS   ' + cr + ' CRISTALES', W / 2, 140, '#9ad8ff', 1, 1);
    txs(rec ? 'NUEVO RECORD!' : 'RECORD ' + S.b, W / 2, 156, '#ffd75e', 1, 1);
    if (ot > .4 && t % 1 < .7) txs('ESPACIO: OTRA VEZ', W / 2, 192, '#ffffff', 2, 1);
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
onpointermove = e => { if (!pd) return; const dx = (e.clientX - pd.x) * W / cv.clientWidth; pd.x = e.clientX; pd.m += abs(dx); if (st == 'play') drag += dx * .03; };
onpointerup = () => { if (pd && pd.m < 4) act(); pd = 0; };

// ---------- bucle ----------
let t0 = 0;
const loop = ts => {
  requestAnimationFrame(loop);
  const dt = min(.033, (ts - t0) / 1000 || 0); t0 = ts;
  if (st == 'play') upd(dt);
  else {
    t += dt; ot += dt; upP(dt); mus(dt);
    if (st == 'title') { th = sin(t * .45) * 2.4; q = pq = ((round(th / (PI / 2)) % 4) + 4) % 4; camy = lp(camy, 60 + t * 9 % 450, .05); }
  }
  sh = max(0, sh - dt * 12); fl = max(0, fl - dt * 2.5); ban -= dt;
  draw();
};
reset();
requestAnimationFrame(loop);
})();
