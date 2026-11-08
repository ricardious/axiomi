// AXIOMI — gira el mundo, cambia sus reglas. Todo dibujado y sonado con código.
// El mundo se pinta en pixel art a 480x270 (cada píxel del juego son 2x2 en pantalla) y se escala sin suavizado.
(() => {
'use strict';
const W = 960, H = 540, U = 480, V = 270, RW = 256, RH = 176, NC = 5, WW = RW * NC, G = 650, MV = 400;
const { floor, min, max, abs, sin, cos, hypot, PI, random: rnd, round, sqrt, ceil } = Math, D = document;
const cl = (v, a, b) => v < a ? a : v > b ? b : v, lp = (a, b, k) => a + (b - a) * k;
const rr = (a, b) => a + rnd() * (b - a), ri = (a, b) => floor(rr(a, b + 1)), pk = a => a[floor(rnd() * a.length)];
const hs = (i, j) => { let h = Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; };
const mk = (w, h, f) => { const c = D.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: !!f }); x.imageSmoothingEnabled = false; return [c, x]; };
const cv = D.getElementById('c'), O = cv.getContext('2d');
cv.width = W; cv.height = H;
const [LC, LX] = mk(U, V), [DC, DX] = mk(U, V);
let X = LX; // contexto activo: LX (mundo en baja resolución) u O (interfaz nítida)
const fr = (x, y, w, h, c) => { if (c) X.fillStyle = c; X.fillRect(x, y, w, h); }, ga = a => X.globalAlpha = a;
const rsz = () => { const s = min(innerWidth / W, innerHeight / H); cv.style.width = W * s + 'px'; cv.style.height = H * s + 'px'; };
onresize = rsz; rsz();
const hx = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
const mix = (a, b, k) => { a = hx(a); b = hx(b); return '#' + a.map((v, i) => (round(lp(v, b[i], k)) | 256).toString(16).slice(1)).join(''); };
const u32 = (h, a = 255) => { const [r, g, b] = hx(h); return (a << 24 | b << 16 | g << 8 | r) >>> 0; };

// ---------- luz ----------
const GC = {};
const glow = c => GC[c] || (GC[c] = (() => {
  const [k, x] = mk(64, 64), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, c); g.addColorStop(.3, c + '70'); g.addColorStop(1, c + '00');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); return k;
})());
const lt = (x, c, px, py, r, a = 1) => { x.globalAlpha = a; x.imageSmoothingEnabled = true; x.drawImage(glow(c), px - r, py - r, r * 2, r * 2); x.imageSmoothingEnabled = false; x.globalAlpha = 1; };

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
    sp: () => tn(1760 + cr % 6 * 120, .07, 'sine', .035, 0, 0, 1),
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
// El pozo es una rejilla de salas (5 de ancho, infinitas hacia abajo). En cada fila un camino
// entra por arriba, recorre túneles horizontales hacia un lado y vuelve a caer: así hay pozos,
// túneles, cámaras y cuevas laterales. Las cuevas se tallan con cápsulas deformadas por ruido,
// píxel a píxel: lo que ves es exactamente lo que colisiona.
// materia: 0 aire · 1 roca · 2..5 materia del axioma 0..3
let st = 'title', t = 0, th = 0, ca = 0, rv = 0, q = 0, pq = 0, E = [], P = [], p = {}, L = 100, score = 0, cr = 0, depth = 0,
  vY = 0, camx = 0, camy = 0, sh = 0, fl = 0, ban = 0, ot = 0, jb = 0, drag = 0, why = '', hb = 0, rec = 0, lpT = 0, DM = [];
let RM = new Map(), CP = [], CO = [], EX = [], WP = [], FL = [], gr = 0, pc = 2, pdx = 0, pdr = 0, wi = 0, pbi = 0, bn = 0;
// biomas: cada 5 filas de salas el pozo cambia de escenario
const BN = ['GRUTAS', 'BOSQUE HONGO', 'GEODA', 'ABISMO'], BI = ry => ry < 5 ? 0 : (1 + floor((ry - 5) / 5)) % 4;
const room = (i, j) => i < 0 || i >= NC ? 0 : RM.get(j * 8 + i);
const vn = (x, y) => { const i = floor(x), j = floor(y), u = x - i, v = y - j, s = k => k * k * (3 - 2 * k); return lp(lp(hs(i, j), hs(i + 1, j), s(u)), lp(hs(i, j + 1), hs(i + 1, j + 1), s(u)), s(v)) * 2 - 1; };

// cápsula de radio variable entre dos puntos (con su caja para filtrar rápido)
const cap = (a, b, ra, rb, oc) => CP.push([a[0], a[1], ra, b[0], b[1], rb, min(a[0] - ra, b[0] - rb), min(a[1] - ra, b[1] - rb), max(a[0] + ra, b[0] + rb), max(a[1] + ra, b[1] + rb), oc]);
// rellenos sólidos (hongos gigantes, cristales, islas): [caja, tipo (0 cápsula · 1 elipse), materia, parámetros]
const fil = (m, ty, a, bb) => FL.push([...bb, ty, m, ...a]);
// conecta cada salida con el centro de la sala mediante un túnel curvo
// tr: además deja un rastro de chispas por el centro del túnel que marca el camino
const carve = (R, ex, rc, tr, oc) => {
  const c = R.c;
  for (const [x, y, r] of ex) {
    const dx = c[0] - x, dy = c[1] - y, l = hypot(dx, dy) || 1, j = rr(-.3, .3) * l, m = [x + dx / 2 - dy / l * j, y + dy / 2 + dx / l * j], rm = (r + rc) / 2;
    cap([x, y], m, r, rm, oc); cap(m, c, rm, rc, oc); R.sd.push(m); EX.push([x, y]);
    if (tr) for (const [a, b_] of [[[x, y], m], [m, c]]) for (let k = 0, n = hypot(b_[0] - a[0], b_[1] - a[1]) / 30 | 0; k < n; k++) E.push({ x: lp(a[0], b_[0], k / n), y: lp(a[1], b_[1], k / n), ph: k, s: 1 });
  }
};
const gen = () => {
  const ry = gr++, oy = ry * RH, d = min(1, ry / 45), Rs = [], bi = BI(ry), big = bi & 1; // bosque y abismo son abiertos
  for (let i = 0; i < NC; i++) {
    const R = { rx: i, ry, bi, ox: i * RW, oy, k: 0, sd: [], img: [], ux: -1e3, c: [i * RW + RW / 2 + rr(-60, 60), oy + RH / 2 + rr(-38, 38)] };
    Rs.push(R); RM.set(ry * 8 + i, R);
  }
  const c = pc, c2 = ry && rnd() < .8 ? cl(c + pk([-3, -2, -1, -1, 1, 1, 2, 3]), 0, NC - 1) : c, lo = min(c, c2), hi = max(c, c2), hb_ = [];
  for (let i = lo; i < hi; i++) hb_[i] = [(i + 1) * RW, oy + rr(big ? 62 : 52, RH - (big ? 62 : 52)), big ? rr(34, 42) : rr(19, 27)];
  const dx = c2 * RW + rr(60, RW - 60), dr = bi == 3 ? rr(28, 34) : rr(18, 25);
  if (!ry) Rs[c].c = [c * RW + RW / 2, 76];
  for (let i = lo; i <= hi; i++) {
    const R = Rs[i], ex = []; R.k = 1; R.lamp = rnd() < .3;
    if (ry && i == c) { ex.push([pdx, oy, pdr]); R.ux = pdx; }
    if (i == c2) ex.push([dx, oy + RH, dr]);
    if (i > lo) ex.push(hb_[i - 1]);
    if (i < hi) ex.push(hb_[i]);
    if (big && ry) R.c = [R.ox + RW / 2 + rr(-30, 30), oy + RH / 2 + rr(-10, 10)];
    const rc = !ry ? 48 : bi == 1 ? rr(56, 66) : bi == 3 ? rr(70, 78) : rr(24, 46), vx = e => e[1] == oy || e[1] == oy + RH;
    carve(R, ex, rc, ry, bi == 2);
    if (bi == 1) for (let n = ri(2, 4); n--;) { // hongos gigantes: tallo y sombrero, sirven de plataforma
      const x = R.ox + rr(36, RW - 36), cy = R.c[1] + rr(-15, 35), rx = rr(20, 36), r_ = rr(7, 11), tx = x + rr(-10, 10);
      if (ex.some(e => vx(e) ? abs(e[0] - x) < e[2] + rx + 12 : hypot(e[0] - tx, e[1] - cy) < e[2] + rx + 10)) continue;
      fil(6, 0, [x, oy + RH - 2, 6, tx, cy, 4], [min(x, tx) - 8, cy - 8, max(x, tx) + 8, oy + RH]);
      fil(6, 1, [tx, cy, rx, r_, 1], [tx - rx - 3, cy - r_ - 3, tx + rx + 3, cy + r_ + 3]);
    }
    if (bi == 2) for (let n = ri(4, 7); n--;) { // cristales que brotan de las paredes de la geoda
      const a = rnd() * 7;
      if (ex.some(e => abs((Math.atan2(e[1] - R.c[1], e[0] - R.c[0]) - a + 3 * PI) % (2 * PI) - PI) < .55)) continue;
      const l1 = rc + 14, l2 = rc - rr(6, 18), s1 = [R.c[0] + cos(a) * l1, R.c[1] + sin(a) * l1], s2 = [R.c[0] + cos(a) * l2, R.c[1] + sin(a) * l2];
      fil(6, 0, [...s1, 6, ...s2, 1], [min(s1[0], s2[0]) - 7, min(s1[1], s2[1]) - 7, max(s1[0], s2[0]) + 7, max(s1[1], s2[1]) + 7]);
    }
    if (bi == 3) for (let n = ri(2, 4); n--;) { // islas flotantes en el vacío
      const rx = rr(16, 34), r_ = rr(7, 12), x = R.ox + rr(rx + 10, RW - rx - 10), y = oy + rr(30, RH - 30);
      if (ex.some(e => vx(e) && abs(e[0] - x) < e[2] + rx + 12)) continue;
      fil(rnd() < .3 ? ri(2, 5) : 1, 1, [x, y, rx, r_, 0], [x - rx - 6, y - r_ - 6, x + rx + 6, y + r_ + 6]);
      E.push({ x, y: y - r_ - 10, ph: rnd() * 6 });
    }
    for (const m of [...R.sd, R.c]) if (ry && rnd() < .3) E.push({ x: m[0] + rr(-8, 8), y: m[1] + rr(-8, 8), ph: rnd() * 6 });
    // islas de materia de color dentro de las cámaras
    if (ry > 1 && rnd() < .35 + d * .4) { const a = rnd() * 7, rb = rr(9, 17), x = R.c[0] + cos(a) * rr(8, 36), y = R.c[1] + sin(a) * rr(8, 26); CO.push([ri(0, 3), x - rb - 4, y - rb - 4, x + rb + 4, y + rb + 4, x, y, rb]); }
  }
  // camino de puntos (lo usa el bot de pruebas)
  for (let i = c, s = c2 > c ? 1 : -1; ; i += s) { WP.push(Rs[i].c); if (i == c2) break; WP.push(hb_[s > 0 ? i : i - 1]); }
  WP.push([dx, oy + RH]);
  // cuevas laterales sin salida, con semillas y a veces una lámpara
  if (ry) for (const i of [lo - 1, hi + 1]) if (i >= 0 && i < NC && rnd() < .2) {
    const R = Rs[i], b = [i < lo ? lo * RW : i * RW, oy + rr(52, RH - 52), rr(17, 22)];
    R.k = 2; R.lamp = rnd() < .65; carve(R, [b], rr(22, 34)); carve(Rs[i < lo ? lo : hi], [b], 22);
    for (let n = 3; n--;) E.push({ x: R.c[0] + rr(-12, 12), y: R.c[1] + rr(-10, 10), ph: rnd() * 6 });
  }
  // tapones de color en las salidas: sólo los atraviesas en un axioma en el que sean fantasma
  const pl = ry > 1 ? .35 + d * .4 : 0;
  for (let i = lo; i < hi; i++) if (rnd() < pl) { const [x, y, r] = hb_[i]; CO.push([ri(0, 3), x - 5, y - r - 18, x + 5, y + r + 18]); }
  if (ry > 1 && rnd() < pl) CO.push([ri(0, 3), dx - dr - 18, oy + RH - 5, dx + dr + 18, oy + RH + 5]);
  pc = c2; pdx = dx; pdr = dr;
};

// distancia con signo a una cápsula de radio variable (oc: octogonal, para las facetas de la geoda)
const cd = (x, y, ax, ay, ra, bx, by, rb, oc) => {
  const ex = bx - ax, ey = by - ay, u = cl(((x - ax) * ex + (y - ay) * ey) / (ex * ex + ey * ey || 1), 0, 1), qx = abs(x - ax - ex * u), qy = abs(y - ay - ey * u);
  return (oc ? max(qx, qy, (qx + qy) * .7071) : hypot(qx, qy)) - lp(ra, rb, u);
};
// rejilla de materia de una sala, más sus púas y lámparas
const mapR = R => {
  const { ox, oy } = R, m = R.m = new Uint8Array(RW * RH).fill(1);
  const cs = CP.filter(c => c[8] > ox - 20 && c[6] < ox + RW + 20 && c[9] > oy - 20 && c[7] < oy + RH + 20),
    co = CO.filter(c => c[3] > ox && c[1] < ox + RW && c[4] > oy && c[2] < oy + RH), fs = FL.filter(f => f[2] > ox && f[0] < ox + RW && f[3] > oy && f[1] < oy + RH), na = R.bi == 2 ? .3 : 1;
  R.sp = []; R.lp = []; R.so = 1;
  if (!cs.length) return m;
  // ruido en una rejilla de 4 px, interpolado (mucho más barato que evaluarlo en cada píxel)
  const GW = RW / 4 + 1, NZ = new Float32Array(GW * (RH / 4 + 1));
  for (let j = 0; j <= RH / 4; j++) for (let i = 0; i < GW; i++) { const x = ox + i * 4, y = oy + j * 4; NZ[j * GW + i] = (vn(x * .035, y * .035) * 6.5 + vn(x * .12 + 9, y * .12) * 2) * na; }
  // por bloques de 8x8: sólo se prueban las cápsulas que pueden tocar el bloque; sin ninguna, es roca
  for (let by = 0; by < RH; by += 8) for (let bx = 0; bx < RW; bx += 8) {
    const x0 = ox + bx, y0 = oy + by, bc = cs.filter(c => c[8] > x0 - 10 && c[6] < x0 + 18 && c[9] > y0 - 10 && c[7] < y0 + 18);
    if (!bc.length) continue;
    const bf = fs.filter(f => f[2] > x0 && f[0] < x0 + 8 && f[3] > y0 && f[1] < y0 + 8), bo = co.filter(c => c[3] > x0 && c[1] < x0 + 8 && c[4] > y0 && c[2] < y0 + 8);
    for (let j = by; j < by + 8; j++) for (let i = bx; i < bx + 8; i++) {
      const x = ox + i, y = oy + j, g = (j >> 2) * GW + (i >> 2), u = (i & 3) / 4, n = lp(lp(NZ[g], NZ[g + 1], u), lp(NZ[g + GW], NZ[g + GW + 1], u), (j & 3) / 4);
      let dm = 1e9;
      for (let k = 0; k < bc.length && dm + n >= 0; k++) { const c = bc[k], dd = cd(x, y, c[0], c[1], c[2], c[3], c[4], c[5], c[10]); if (dd < dm) dm = dd; }
      if (dm + n >= 0) continue;
      let v = 0;
      for (const [, , , , ty, mm, a, b, c, d, e, f] of bf) if (ty ? ((x - a) / c) ** 2 + ((y - b) / d) ** 2 + n * .03 < 1 && (!e || y < b + d * .35) : cd(x, y, a, b, c, d, e, f) < 0) { v = mm; break; }
      if (!v) for (const [k, a, b, c, d, cx, cy, r] of bo) if (x >= a && x < c && y >= b && y < d && (!r || hypot(x - cx, y - cy) - r + n * .5 < 0)) v = k + 2;
      m[j * RW + i] = v; if (v != 1) R.so = 0;
    }
  }
  const mt = (x, y) => { x = floor(x) - ox; y = floor(y) - oy; return x < 0 || y < 0 || x >= RW || y >= RH ? 1 : m[y * RW + x]; };
  // púas: grupos sobre suelos, techos y paredes, nunca junto a una salida
  const ns = R.k == 1 && R.ry > 1 ? ri(0, 1 + min(3, R.ry / 9)) : 0;
  for (let n = 0; n < ns; n++) {
    const s = pk([...R.sd, R.c]), [nx, ny] = pk([[0, -1], [0, -1], [0, 1], [1, 0], [-1, 0]]), len = ri(3, 8);
    let bx = floor(s[0]), by = floor(s[1]), f = 0;
    for (let k = 0; k < 90 && !f; k++) if (mt(bx - nx, by - ny) == 1) f = 1; else { bx -= nx; by -= ny; }
    if (f) for (let k = -len >> 1; k < len >> 1; k++) {
      let x = bx - ny * k * 5, y = by + nx * k * 5, ok = 0;
      for (let z = -6; z <= 6 && !ok; z++) { const xx = x + nx * z, yy = y + ny * z; if (!mt(xx, yy) && mt(xx - nx, yy - ny) == 1) { x = xx; y = yy; ok = 1; } }
      if (ok && !EX.some(e => hypot(e[0] - x, e[1] - y) < 52) && !(ny < 0 && abs(x - R.ux) < 48)) R.sp.push([x, y, nx, ny]);
    }
  }
  // lámpara colgada del techo de la cámara
  if (R.lamp) { const x = floor(R.c[0]); let y = floor(R.c[1]); for (let k = 0; k < 110 && !mt(x, y - 1); k++) y--; if (mt(x, y - 1) == 1 && R.c[1] - y > 14) R.lp.push([x, y]); }
  return m;
};
const mat = (x, y) => {
  x = floor(x); y = floor(y);
  if (x < 0 || x >= WW || y < 0) return 1;
  const R = room(floor(x / RW), floor(y / RH));
  return R ? (R.m || mapR(R))[(y - R.oy) * RW + x - R.ox] : 1;
};
const sol = (x, y) => { const v = mat(x, y); return v == 1 || v == 6 || v == q + 2; };

// ---------- pixel art de cada sala (una imagen por axioma) ----------
const PD = 5, MG_ = 6; // cada imagen invade 5 px de sus vecinas (sin costuras al girar); se analizan 6 px más
const PW = RW + (PD + MG_) * 2, PH = RH + (PD + MG_) * 2, CSs = new Uint8Array(PW * PH), DDs = new Uint8Array(PW * PH);
// materia de la sala con un margen de las vecinas, copiada fila a fila (se guarda: es igual para los 4 axiomas)
const pad = R => {
  if (R.pv) return R.pv;
  const v = R.pv = new Uint8Array(PW * PH), x0 = R.ox - PD - MG_, y0 = R.oy - PD - MG_;
  for (let j = 0; j < PH; j++) {
    const yy = y0 + j, rj = floor(yy / RH), ly = (yy - rj * RH) * RW;
    let lr = -9, mm = 0;
    for (let i = 0; i < PW; i++) {
      const xx = x0 + i, ri_ = floor(xx / RW);
      if (ri_ != lr) { lr = ri_; const Q = room(ri_, rj); mm = Q ? Q.m || mapR(Q) : 0; }
      v[j * PW + i] = mm ? mm[ly + xx - ri_ * RW] : 1;
    }
  }
  return v;
};
const rend = (R, qq) => {
  const w = RW + PD * 2, h = RH + PD * 2, [cn, x] = mk(w, h), id = x.createImageData(w, h), b = new Uint32Array(id.data.buffer);
  const ac = AX[qq].c, ox = R.ox - PD, oy = R.oy - PD, pw = w + MG_ * 2, ph_ = h + MG_ * 2, mv = pad(R), cs = CSs, dd = DDs;
  // clases: 0 aire · 1 roca · 2 materia sólida · 3 materia fantasma · 4 hongo/cristal
  for (let n = 0; n < pw * ph_; n++) { const v = mv[n], c = v == 6 ? 4 : v < 2 ? v : v == qq + 2 ? 2 : 3; cs[n] = c; dd[n] = c == 0 || c == 3 ? 0 : 9; }
  // distancia de cada píxel de roca al hueco más cercano (dos pasadas): borde de luz y degradado
  for (let j = 1; j < ph_; j++) for (let i = 1; i < pw; i++) { const n = j * pw + i; dd[n] = min(dd[n], dd[n - 1] + 1, dd[n - pw] + 1); }
  for (let j = ph_ - 2; j >= 0; j--) for (let i = pw - 2; i >= 0; i--) { const n = j * pw + i; dd[n] = min(dd[n], dd[n + 1] + 1, dd[n + pw] + 1); }
  const C = (i, j) => cs[(j + MG_) * pw + i + MG_];
  const B = R.bi, K = [mix(ac, '#ffffff', .35), mix(ac, '#040309', .35), mix(ac, '#040309', .72), ['#040309', '#09040e', '#03060d', '#020207'][B], ['#0c0a17', '#1a0c24', '#0d1a2e', '#0a0a14'][B], mix(ac, '#040309', .55), mix(ac, '#ffffff', .6)].map(c => u32(c));
  const CRY = [mix(ac, '#ffffff', .8), mix(ac, '#ffffff', .15), mix(ac, '#ffffff', .45), mix(ac, '#05040b', .3), mix(ac, '#ffffff', .3)].map(c => u32(c)), MU = ['#f0d8ff', '#9a6cc0', '#7a4f9e', mix(ac, '#ffffff', .4)].map(c => u32(c));
  const MC = AX.map(a => [mix(a.c, '#05040b', .5), mix(a.c, '#05040b', .3), mix(a.c, '#ffffff', .6), a.c].map(c => u32(c))), GH = AX.map(a => [u32(a.c, 210), u32(a.c, 70)]);
  const set = (i, j, c) => { if (i >= 0 && j >= 0 && i < w && j < h) b[j * w + i] = c; };
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const N = (j + MG_) * pw + i + MG_, c = cs[N];
    if (!c) continue;
    const x_ = ox + i, y_ = oy + j, n = j * w + i;
    if (c == 1) {
      const e = dd[N], up = cs[N - pw];
      b[n] = up == 0 || up == 3 ? K[0] : e == 1 ? K[1] : e == 2 ? K[2] : e < 5 && (x_ + y_) & 1 ? K[2] : hs(x_ >> 1, y_ >> 1) < (B == 2 ? .1 : .045) ? K[4] : K[3];
      if (!up && C(i - 1, j) && C(i + 1, j) && !C(i - 1, j - 1) && !C(i + 1, j - 1)) { // hierba, hongos
        const g = hs(x_, y_ * 3), g2 = hs(y_, x_);
        if (B == 2) { if (g < .3) for (let k = 1; k <= 1 + (g2 * 3 | 0); k++) if (!C(i, j - k)) set(i, j - k, K[6]); } // brotes de cristal
        else if (g < (B == 1 ? .55 : .45)) { const hh = 1 + (g2 * (B == 1 ? 8 : 5) | 0); for (let k = 1; k <= hh; k++) if (!C(i, j - k)) set(i, j - k, k == hh && g < .08 ? K[0] : K[3]); }
        else if (g < (B == 1 ? .6 : .47) && !C(i, j - 7)) {
          const hh = 2 + (g2 * 3 | 0);
          for (let k = 1; k <= hh; k++) set(i, j - k, K[3]);
          for (let k = -2; k <= 2; k++) set(i + k, j - hh - 1, K[3]);
          for (let k = -1; k <= 1; k++) set(i + k, j - hh - 2, K[3]);
          set(i - 1, j - hh - 1, MC[qq][3]); set(i + 1, j - hh - 2, MC[qq][3]);
        }
      }
      if (!C(i, j + 1) && !C(i - 1, j + 1) && !C(i + 1, j + 1) && hs(x_ * 3, y_) < [.16, .3, .1, .12][B]) { // raíces colgantes (o estalactitas de cristal)
        const ln = 2 + (hs(y_, x_ * 7) * [16, 26, 4, 40][B] | 0);
        let k = 1;
        for (; k <= ln; k++) { const xo = B == 2 ? 0 : round(sin(k * .45 + x_) * 1.2); if (C(i + xo, j + k)) break; set(i + xo, j + k, B == 2 ? K[6] : K[3]); }
        if (B != 2 && k > ln && hs(x_, y_ * 5) < (B == 1 ? .5 : .2)) { set(i, j + k, K[0]); set(i + 1, j + k, K[0]); set(i, j + k + 1, K[5]); set(i + 1, j + k + 1, K[5]); }
      }
    } else if (c == 4) {
      // hongo gigante (carne lila con manchas que brillan) o cristal facetado
      const e1 = cs[N - 1] != 4 || cs[N + 1] != 4 || cs[N - pw] != 4 || cs[N + pw] != 4;
      b[n] = B == 2 ? e1 ? CRY[0] : CRY[1 + ((((x_ + y_) >> 2) + ((x_ - y_) >> 3)) & 3)] : e1 ? MU[0] : hs(x_ >> 1, y_ >> 1) < .1 ? MU[3] : x_ % 4 ? MU[1] : MU[2];
    } else {
      // materia de color: sólida con borde brillante y rayas; fantasma con borde a trazos
      const v = mv[N] - 2, df = k => cs[k] != c, e1 = df(N - 1) || df(N + 1) || df(N - pw) || df(N + pw), e2 = df(N - 2) || df(N + 2) || df(N - pw * 2) || df(N + pw * 2);
      if (c == 2) b[n] = e1 ? MC[v][2] : e2 ? MC[v][3] : ((x_ + y_) >> 2) % 3 ? MC[v][0] : MC[v][1];
      else b[n] = e1 ? (x_ + y_) >> 1 & 1 ? GH[v][0] : 0 : (x_ - y_ & 7) == 0 ? GH[v][1] : 0;
    }
  }
  // púas: rojas, grandes y con punta blanca
  const SPK = [u32('#2a0410'), u32('#c0163c'), u32('#ff2e55'), u32('#ff8aa2'), u32('#ffffff')];
  for (const [sx, sy, nx, ny] of R.sp) for (let s = 0; s < 10; s++) {
    const hw = [3, 3, 3, 2, 2, 2, 1, 1, 0, 0][s];
    for (let k = -hw; k <= hw; k++) set(sx + nx * s - ny * k - ox, sy + ny * s + nx * k - oy, SPK[s < 1 ? 0 : abs(k) == hw && hw ? 1 : s < 6 ? 2 : s < 9 ? 3 : 4]);
  }
  // lámparas: sólo se encienden en BRASA
  const on = qq == 2, LC_ = [u32('#040309'), u32(on ? '#ffe6a8' : '#4a3418'), u32('#ffffff')];
  for (const [lx, ly] of R.lp) {
    const i = lx - ox, j = ly - oy;
    for (let k = 0; k < 3; k++) set(i, j + k, LC_[0]);
    for (let a = -2; a <= 2; a++) for (let k = 3; k < 10; k++) set(i + a, j + k, abs(a) < 2 && k > 3 && k < 9 ? LC_[1] : LC_[0]);
    if (on) set(i, j + 5, LC_[2]);
  }
  x.putImageData(id, 0, 0); return cn;
};

// roca maciza (salas sin huecos): textura repetida con el mismo tono y motas que la roca pintada
const RK = {}, rock = B => RK[B] || (RK[B] = (() => {
  const [c, x] = mk(64, 64), id = x.createImageData(64, 64), b = new Uint32Array(id.data.buffer), k = [['#040309', '#09040e', '#03060d', '#020207'][B], ['#0c0a17', '#1a0c24', '#0d1a2e', '#0a0a14'][B]].map(c => u32(c));
  for (let n = 0; n < 4096; n++) b[n] = k[+(hs((n & 63) >> 1, n >> 7) < (B == 2 ? .1 : .045))];
  x.putImageData(id, 0, 0); return LX.createPattern(c, 'repeat');
})());
// fondo: dos capas de columnas en silueta que se repiten, con paralaje
const BG = {};
const vp = (x, y, px, py) => {
  const i = floor(x), j = floor(y), u = x - i, v = y - j, s = k => k * k * (3 - 2 * k), h = (a, b) => hs((a % px + px) % px + 77, (b % py + py) % py);
  return lp(lp(h(i, j), h(i + 1, j), s(u)), lp(h(i, j + 1), h(i + 1, j + 1), s(u)), s(v)) * 2 - 1;
};
const bgl = (l, f, B) => {
  const key = q * 8 + B * 2 + l;
  if (!BG[key]) {
    const [c, x] = mk(256, 256), id = x.createImageData(256, 256), b = new Uint32Array(id.data.buffer), ac = AX[q].c,
      k0 = u32(mix(ac, '#06040c', l ? .86 : .74)), k1 = u32(mix(ac, '#06040c', l ? .74 : .58)), f_ = B == 1 ? (x, y) => vp(x / 32 + l * 3, y / 32, 8, 8) + vp(x / 8, y / 8 + l * 5, 32, 32) * .3 > (l ? .3 : .4) // copas redondas
        : B == 2 ? (x, y) => { const u = (x + y) & 255, v = (x - y) & 255, i = u >> 6, j = v >> 6; return hs(j + l * 3, i + 40) < .45 && max(abs((u & 63) - 32), abs((v & 63) - 32)) < 8 + hs(i + l * 7, j) * 22; } // rombos
        : B == 3 ? (x, y) => vp(x / 64 + l * 2, y / 32, 4, 8) + vp(x / 16, y / 8 + l * 5, 16, 32) * .25 > (l ? .38 : .5) // islas lejanas
        : (x, y) => vp(x / 32 + l * 3, y / 64, 8, 4) + vp(x / 8, y / 16 + l * 5, 32, 16) * .3 > (l ? .32 : .42); // columnas
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) if (f_(x, y)) b[y * 256 + x] = f_(x - 1, y) && f_(x + 1, y) ? k0 : k1;
    x.putImageData(id, 0, 0); BG[key] = X.createPattern(c, 'repeat');
  }
  X.save(); view(0, 0, f); X.fillStyle = BG[key]; X.fillRect(round(camx * f) - 400, round(camy * f) - 400, 800, 800); X.restore();
};

const reset = () => {
  RM.clear(); CP = []; CO = []; EX = []; WP = []; FL = []; E = []; P = []; gr = 0; pc = 2; wi = 0;
  while (gr < 5) gen();
  const R0 = room(2, 0);
  p = { x: R0.c[0], y: R0.c[1], vx: 0, vy: 0, r: 6, g: 0, sq: 0, f: 1, ph: 0, nx: 0, ny: -1 };
  th = ca = rv = 0; q = pq = 0; L = 100; score = cr = depth = 0; vY = p.y - 250; camx = p.x; camy = p.y; rec = 0; hb = 0;
  pbi = bn = 0; DM = [...Array(46)].map(() => ({ x: rr(0, U), y: rr(0, V), ph: rnd() * 7, s: rnd() < .3 ? 2 : 1 }));
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
    if (sol(p.x, p.y)) { p.x -= sx * 1.5; p.y -= sy * 1.5; continue; } // dentro de materia que acaba de solidificarse
    let ax = 0, ay = 0, n = 0;
    for (const [cx, cy] of SA) if (sol(p.x + cx * r, p.y + cy * r)) { ax -= cx; ay -= cy; n++; }
    if (!n) break;
    const d = hypot(ax, ay); if (d < .01) break;
    ax /= d; ay /= d; p.x += ax * .55; p.y += ay * .55; nx += ax; ny += ay; hit = 1;
  }
  if (hit) {
    const d = hypot(nx, ny) || 1; nx /= d; ny /= d;
    const vn_ = p.vx * nx + p.vy * ny;
    if (vn_ < 0) { p.vx -= nx * vn_ * 1.08; p.vy -= ny * vn_ * 1.08; if (vn_ < -180) { sfx('ld'); p.sq = min(1, -vn_ / 450); } }
    if (-(nx * sx + ny * sy) > .45) { p.g = .1; p.nx = nx; p.ny = ny; p.vx *= 1 - 1.6 * dt; p.vy *= 1 - 1.6 * dt; }
  }
};

const die = w => {
  if (st != 'play') return;
  st = 'over'; ot = 0; why = w; sh = 5; fl = .4;
  burst(p.x, p.y, '#fff4d0', 50, 180); burst(p.x, p.y, AX[q].c, 25, 120); sfx('die');
  if (score > S.b) { S.b = score; rec = 1; }
  S.d = max(S.d, depth); save();
};
const near = f => { const rx = floor(p.x / RW), ry = floor(p.y / RH); for (let j = ry - 1; j <= ry + 1; j++) for (let i = rx - 1; i <= rx + 1; i++) { const R = room(i, j); if (R && R.m) f(R); } };

// el axioma (color) se elige con botones; girar sólo cambia la gravedad
const sel = k => {
  k = (k % 4 + 4) % 4; if (st != 'play' || k == q) return;
  q = pq = k; L -= 1; fl = .2; ban = 1.1; sfx('sw'); burst(p.x, p.y, AX[q].c, 14, 90);
};
const upd = dt => {
  t += dt;
  const dir = (K.ArrowRight || K.KeyD ? 1 : 0) - (K.ArrowLeft || K.KeyA ? 1 : 0);
  rv = lp(rv, dir * 3.3, min(1, dt * 14));
  const dth = rv * dt + drag; th += dth; drag = 0;
  ca = lp(ca, th, min(1, dt * 7)); // la cámara sigue el giro con suavidad (marea menos)
  const ts = q == 3 ? .7 : 1, dts = dt * ts;
  for (let n = ceil(dts / .004), k = n; k--;) phys(dts / n);
  p.g -= dts; p.sq = max(0, p.sq - dt * 5);
  const c_ = cos(th), s_ = sin(th), svx = p.vx * c_ - p.vy * s_;
  if (abs(svx) > 18) p.f = svx > 0 ? 1 : -1;
  if (p.g > 0) p.ph += abs(svx) * dt * .16;
  if ((jb -= dt) > 0 && p.g > 0) {
    const js = q == 1 ? 375 : 255, gx = sin(th), gy = cos(th), vg = p.vx * gx + p.vy * gy;
    p.vx -= gx * (vg + js); p.vy -= gy * (vg + js); p.g = 0; jb = 0; sfx('jp');
    burst(p.x + gx * 5, p.y + gy * 5, '#fff4d0', 6, 45);
  }
  // la luz: se gasta siempre, más al girar y más cuanto más hondo
  L -= dt * (2.4 + abs(dth / dt) * 1.3) * (1 + depth / 450) * (q == 3 ? 1.4 : 1);
  near(R => {
    for (const [x, y, nx, ny] of R.sp) if (hypot(x + nx * 5 - p.x, y + ny * 5 - p.y) < p.r + 3) die('TE PINCHASTE');
    if (q == 2) for (const [x, y] of R.lp) if (hypot(x - p.x, y + 6 - p.y) < 52) {
      L = min(100, L + 45 * dt); if (rnd() < dt * 20) pa(x, y + 6, (p.x - x) * 2, (p.y - y) * 2, .4, '#ffd27a');
      if ((lpT -= dt) < 0) { lpT = .09; sfx('lp'); }
    }
  });
  for (const e of E) if (!e.k && e.s && hypot(e.x - p.x, e.y - p.y) < p.r + 8) { e.k = 1; L = min(100, L + 2.5); score += 3; sfx('sp', .03); burst(e.x, e.y, AX[q].c, 4, 40); }
  for (const e of E) if (!e.k && !e.s && hypot(e.x - p.x, e.y - p.y) < p.r + 7) {
    e.k = 1; cr++; L = min(100, L + 16); score += 25; sfx('cr'); burst(e.x, e.y, '#e8fbff', 14, 90); burst(e.x, e.y, AX[q].c, 8, 60);
  }
  E = E.filter(e => !e.k && e.y > p.y - 600);
  // siguiente punto del camino (para la flecha guía)
  while (wi < WP.length - 1 && (hypot(WP[wi][0] - p.x, WP[wi][1] - p.y) < 45 || WP[wi][1] < p.y - 50)) wi++;
  const pj = floor(p.y / 12);
  if (pj > depth) { score += (pj - depth) * 2; depth = pj; }
  // la Sombra cae desde arriba y acelera
  vY += min(85, 20 + depth * .05) * dt; vY = max(vY, p.y - 320);
  if (p.y - p.r < vY) die('LA SOMBRA TE ALCANZO');
  if (L <= 0) { L = 0; die('TE QUEDASTE SIN LUZ'); }
  if (L < 25 && (hb -= dt) < 0) { hb = .7; sfx('hb'); }
  if (!rec && S.b > 50 && score > S.b) { rec = 1; ban = 0; sfx('go'); burst(p.x, p.y, '#ffd75e', 40, 130); }
  const pr = floor(p.y / RH);
  if (BI(max(0, pr)) != pbi) { pbi = BI(max(0, pr)); bn = 2.6; sfx('go'); }
  while (gr <= pr + 3) gen();
  for (const [k, R] of RM) if (R.ry < pr - 3) RM.delete(k);
  const top = (pr - 3) * RH; CP = CP.filter(c => c[9] > top); CO = CO.filter(c => c[4] > top); FL = FL.filter(f => f[3] > top); EX = EX.filter(e => e[1] > top - 60);
  camx = lp(camx, p.x, min(1, dt * 8)); camy = lp(camy, p.y, min(1, dt * 8));
  upP(dt); mus(dt);
};

// ---------- dibujo ----------
const ws = (x, y) => { const dx = x - camx, dy = y - camy, c = cos(ca), s = sin(ca); return [U / 2 + dx * c - dy * s, V / 2 + dx * s + dy * c]; };
const view = (ox, oy, f = 1) => { X.translate(U / 2 + ox, V / 2 + oy); X.rotate(ca); X.translate(-round(camx * f), -round(camy * f)); };
const VR = 290; // radio visible en px de mundo
// prepara por adelantado la materia y las imágenes de las salas cercanas, con un presupuesto de 4 ms por cuadro
const pre = () => {
  const t1 = performance.now(), ry = floor(camy / RH), late = () => performance.now() - t1 > 3;
  for (let j = ry - 1; j <= ry + 3; j++) for (let i = 0; i < NC; i++) { const R = room(i, j); if (R && !R.m) { mapR(R); if (late()) return; } }
  for (const qq of [q, (q + 1) % 4, (q + 3) % 4, (q + 2) % 4]) for (let j = ry - 1; j <= ry + 2; j++) for (let i = 0; i < NC; i++) {
    const R = room(i, j); if (R && R.m && !R.so && !R.img[qq]) { R.img[qq] = rend(R, qq); if (late()) return; }
  }
};

// oscuridad tramada en 4 niveles (Bayer 4x4) con huecos de luz
const DI = DX.createImageData(U, V), DB = new Uint32Array(DI.data.buffer), HU = U / 2, DV = new Float32Array(HU * V / 2), BY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const dark = (Ls, a0) => {
  DV.fill(1);
  for (let [cx, cy, r, s] of Ls) {
    cx /= 2; cy /= 2; r /= 2;
    const x0 = max(0, floor(cx - r)), x1 = min(HU, ceil(cx + r)), y0 = max(0, floor(cy - r)), y1 = min(V / 2, ceil(cy + r));
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const d = sqrt((x + .5 - cx) ** 2 + (y + .5 - cy) ** 2); if (d < r) DV[y * HU + x] -= (1 - d / r) * s; }
  }
  for (let y = 0, n = 0; y < V; y++) for (let x = 0; x < U; x++, n++) {
    const l = min(3, max(0, floor(DV[(y >> 1) * HU + (x >> 1)] * 3 + BY[(y & 3) * 4 + (x & 3)] / 16)));
    DB[n] = (l * a0 * 85 | 0) << 24 | 0x080203;
  }
  DX.putImageData(DI, 0, 0); X.drawImage(DC, 0, 0);
};

// la criatura: se dibuja en vectores a escala pequeña y se cuantiza a una paleta corta con contorno de 1 px
const [SPC, SPX] = mk(48, 40, 1), SPI = SPX.createImageData(48, 40), SPB = new Uint32Array(SPI.data.buffer);
const spr = (ph, air, cc, tt) => {
  const x = SPX; x.clearRect(0, 0, 48, 40); x.save(); x.translate(26, 27); x.scale(1.2, 1.2); x.lineCap = x.lineJoin = 'round';
  const E_ = (x_, y_, rx, ry) => { x.beginPath(); x.ellipse(x_, y_, rx, ry, 0, 0, 7); x.fill(); };
  const run = !air && abs(ph) > 0, fl_ = air ? -2.5 : sin(tt * 2.3) * .6;
  const leg = (hx_, hy_, a, c) => { x.strokeStyle = c; x.lineWidth = 1.9; x.beginPath(); x.moveTo(hx_, hy_); const kx = hx_ + sin(a) * 2.8, ky = hy_ + cos(a) * 2.8; x.lineTo(kx, ky); x.lineTo(kx + sin(a * .4) * 2.4 + .4, ky + 2.4); x.stroke(); };
  const la = k => air ? (k < 2 ? .9 : -.8) : run ? sin(ph + k * PI / 2 + (k > 1) * .6) * .75 : 0;
  const ear = (bx, by, tx_, ty_, w, c) => { x.fillStyle = c; x.beginPath(); x.moveTo(bx - w, by); x.quadraticCurveTo(bx - w - 1, (by + ty_) / 2, tx_, ty_); x.quadraticCurveTo(bx + w + 1.5, (by + ty_) / 2 + 1, bx + w, by + .5); x.fill(); };
  const C1 = '#f7f4ff', C2 = '#b9aee0';
  x.fillStyle = C1;
  for (let k = 0; k <= 8; k++) { const u = k / 8; x.beginPath(); x.arc(-5.5 - u * 9, -.5 - u * u * 7 + sin(tt * 5 - u * 3) * u * (air ? 1 : 2), 2.6 - u * 1.3, 0, 7); x.fill(); }
  leg(-3.6, 2.6, la(0), C2); leg(3.4, 2.6, la(2), C2);
  x.fillStyle = C1; E_(0, 0, 6.6, 4.5);
  leg(-2.6, 3, la(1), C1); leg(4.4, 3, la(3), C1);
  E_(6.4, -4, 4.7, 4.3); E_(10, -2.6, 2.5, 1.8);
  ear(4.6, -7, -2.5 + fl_, -16.5, 1.6, C2); ear(6.6, -7.4, .5 + fl_, -16, 1.7, C1); ear(6.6, -7.6, 1 + fl_, -14.2, .9, cc);
  x.fillStyle = cc; x.beginPath(); x.arc(-14.5, -7.5 + sin(tt * 5 - 3) * (air ? 1 : 2), 1.5, 0, 7); x.fill();
  x.restore();
  const d = x.getImageData(0, 0, 48, 40).data, o = new Uint8Array(48 * 40), pal = [[247, 244, 255], [185, 174, 224], hx(cc)];
  for (let n = 0; n < 48 * 40; n++) if (d[n * 4 + 3] > 110) {
    let bi = 0, bd = 1e9;
    pal.forEach((c, k) => { const e = (c[0] - d[n * 4]) ** 2 + (c[1] - d[n * 4 + 1]) ** 2 + (c[2] - d[n * 4 + 2]) ** 2; if (e < bd) { bd = e; bi = k; } });
    o[n] = bi + 1;
  }
  const PC = [0, u32('#f7f4ff'), u32('#b9aee0'), u32(cc)], DK = u32('#170b28'), SH = u32('#d6cdf2');
  for (let j = 0, n = 0; j < 40; j++) for (let i = 0; i < 48; i++, n++) {
    const v = o[n], g = (a, b) => a >= 0 && b >= 0 && a < 48 && b < 40 ? o[b * 48 + a] : 0;
    SPB[n] = v ? v == 1 && (!g(i, j + 2) || !g(i, j + 1)) ? SH : PC[v] : g(i - 1, j) || g(i + 1, j) || g(i, j - 1) || g(i, j + 1) ? DK : 0;
  }
  const px_ = (i, j, c) => SPB[j * 48 + i] = c, bl = tt % 3.4 < .13, ED = u32('#160b26');
  if (bl) { px_(35, 22, ED); px_(36, 22, ED); }
  else { for (let j = 20; j < 23; j++) { px_(35, j, ED); px_(36, j, ED); } px_(36, 20, u32('#ffffff')); px_(35, 22, u32(cc)); }
  px_(41, 23, ED); px_(37, 25, u32('#ff9ac8')); px_(38, 25, u32('#ff9ac8'));
  px_(30, 19, u32(cc)); px_(30, 20, u32(cc)); px_(31, 20, u32(cc)); px_(29, 20, u32(cc));
  x.putImageData(SPI, 0, 0);
};

const draw = () => {
  X = LX;
  const ax = AX[q], ox = round((rnd() - .5) * sh * 2), oy = round((rnd() - .5) * sh * 2);
  X.setTransform(1, 0, 0, 1, 0, 0); X.imageSmoothingEnabled = false;
  const g = X.createRadialGradient(U / 2, V / 2, 0, U / 2, V / 2, U * .7);
  g.addColorStop(0, mix(ax.c, '#07050f', .72)); g.addColorStop(.55, mix(ax.c, '#06040c', .87)); g.addColorStop(1, '#030208');
  X.fillStyle = g; X.fillRect(0, 0, U, V);
  const B = BI(max(0, floor(camy / RH))); bgl(0, .35, B); bgl(1, .6, B);
  X.globalCompositeOperation = 'lighter';
  for (const d of DM) { // esporas que suben, destellos, corrientes de caída...
    const a = ((d.x - camx * .7) % U + U) % U, b = ((d.y - camy * .7 - t * [2, 9, 2, 60][B] * d.s) % V + V) % V;
    ga(B == 2 ? max(0, sin(t * 3 + d.ph)) : .3 + .3 * sin(t * 2 + d.ph)); fr(round(a), round(b), d.s, B == 3 ? d.s * 4 : d.s, B == 1 ? '#e0b8ff' : mix(ax.c, '#ffffff', .5));
  }
  ga(1); X.globalCompositeOperation = 'source-over';
  // escenario
  X.save(); view(ox, oy);
  fr(-3000, camy - 3000, 3000, 6000, '#040309'); fr(WW, camy - 3000, 3000, 6000); fr(-3000, -3000, WW + 6000, 3000);
  const lamps = [], VS = [];
  for (let j = max(0, floor((camy - VR) / RH)); j <= floor((camy + VR) / RH); j++) for (let i = max(0, floor((camx - VR) / RW)); i <= min(NC - 1, floor((camx + VR) / RW)); i++) {
    const R = room(i, j); if (!R) continue;
    if (!R.m) mapR(R);
    VS.push(R); if (R.so) { X.fillStyle = rock(R.bi); X.fillRect(R.ox, R.oy, RW, RH); }
  }
  for (const R of VS) {
    if (!R.so) X.drawImage(R.img[q] || (R.img[q] = rend(R, q)), R.ox - PD, R.oy - PD);
    for (const [x, y] of R.lp) lamps.push(ws(x, y + 6));
  }
  const VE = E.filter(e => abs(e.x - camx) < VR && abs(e.y - camy) < VR);
  // semillas de luz
  for (const e of VE) {
    const ex = round(e.x), ey = round(e.y), a = t * 3 + e.ph, rd = 4 + round(sin(t * 5 + e.ph));
    if (e.s) { ga(.6 + .4 * sin(t * 6 - e.ph * .7)); fr(ex, ey, 1, 1, '#ffffff'); X.fillStyle = mix(ax.c, '#ffffff', .4); X.fillRect(ex - 1, ey, 1, 1); X.fillRect(ex + 1, ey, 1, 1); X.fillRect(ex, ey - 1, 1, 1); X.fillRect(ex, ey + 1, 1, 1); ga(1); continue; }
    fr(ex - 1, ey, 3, 1, '#ffffff'); fr(ex, ey - 1, 1, 3);
    X.fillStyle = mix(ax.c, '#ffffff', .5);
    for (let n = 0; n < 4; n++) { const aa = a + n * PI / 2; X.fillRect(round(ex + cos(aa) * rd), round(ey + sin(aa) * rd), 1, 1); }
  }
  // la Sombra: masa viva con tentáculos
  for (let x = floor((camx - 420) / 2) * 2; x < camx + 420; x += 2) {
    const yy = round(vY + sin(x * .09 + t * 4) * 4 + sin(x * .031 - t * 1.7) * 6 + max(0, sin(x * .23 + t)) ** 6 * 14);
    fr(x, yy - 1500, 2, 1500, '#000000'); fr(x, yy, 2, 1, '#9a3aff');
  }
  for (const e of P) { ga(e.l / e.m); fr(floor(e.x), floor(e.y), e.l > .4 ? 2 : 1, e.l > .4 ? 2 : 1, e.c); } ga(1);
  X.restore();
  // luz
  const [px, py] = ws(p.x, p.y), Ls = [];
  if (st != 'over') Ls.push([px + ox, py + oy, 60 + L * 1.6, 1.8]);
  for (const e of VE) if (!e.s) { const [a, b] = ws(e.x, e.y); Ls.push([a + ox, b + oy, 26, .8]); }
  if (q == 2) for (const [a, b] of lamps) Ls.push([a + ox, b + oy, 75, 1.8]);
  dark(Ls, lp(.93, .55, L / 100));
  X.globalCompositeOperation = 'lighter';
  if (st != 'over') { lt(X, '#fff0d0', px + ox, py + oy, 18 + L * .1, .45); lt(X, ax.c, px + ox, py + oy, 40, .14); }
  if (q == 2) for (const [a, b] of lamps) lt(X, '#ffb347', a + ox, b + oy, 30, .8);
  for (const e of VE) { const [a, b] = ws(e.x, e.y); lt(X, e.s ? ax.c : '#bfe6ff', a + ox, b + oy, e.s ? 6 : 12, e.s ? .5 : .6); }
  // los obstáculos brillan por encima de la oscuridad
  for (const R of VS) for (const [x, y, nx, ny] of R.sp) { const [a, b] = ws(x + nx * 6, y + ny * 6); lt(X, '#ff2e55', a + ox, b + oy, 9, .55); }
  for (const c of CO) if (c[0] == q && abs(c[1] - camx) < VR && abs(c[2] - camy) < VR) { const [a, b] = ws((c[1] + c[3]) / 2, (c[2] + c[4]) / 2); lt(X, ax.c, a + ox, b + oy, max(c[3] - c[1], c[4] - c[2]) * .75, .3 + .12 * sin(t * 6)); }
  X.globalCompositeOperation = 'source-over';
  if (st == 'play') { spr(p.ph, p.g <= 0, ax.c, t); X.save(); X.translate(round(px + ox), round(py + oy)); X.rotate(th - ca); X.scale(p.f, 1); X.drawImage(SPC, -26, -30); X.restore(); }
  if (st == 'play' && WP[wi]) {
    const [a, b] = ws(...WP[wi]), an = Math.atan2(b - py, a - px), dd_ = hypot(a - px, b - py);
    if (dd_ > 45) {
      X.save(); X.translate(round(px + ox + cos(an) * 34), round(py + oy + sin(an) * 34)); X.rotate(an); ga(.7 + .3 * sin(t * 7));
      X.fillStyle = mix(ax.c, '#ffffff', .6); for (let k = 0; k < 6; k++) { X.fillRect(-k, -k - 1, 3, 2); X.fillRect(-k, k - 1, 3, 2); }
      ga(1); X.restore();
    }
  }
  if (fl > 0) { ga(fl * .35); fr(0, 0, U, V, ax.c); ga(1); }
  if (st == 'title') {
    ga(.55); fr(0, 0, U, V, '#05040b'); ga(1);
    X.globalCompositeOperation = 'lighter'; lt(X, ax.c, U / 2, 145, 60, .35); X.globalCompositeOperation = 'source-over';
    spr(t * 9, 0, ax.c, t); X.save(); X.translate(U / 2, 157); X.scale(3, 3); X.drawImage(SPC, -26, -30); X.restore();
  }
  if (st == 'over') { ga(min(.7, ot * 2)); fr(0, 0, U, V, '#05040b'); ga(1); }
  // a pantalla: cada píxel del mundo es un bloque de 2x2, sin suavizado
  O.setTransform(1, 0, 0, 1, 0, 0); O.imageSmoothingEnabled = false; O.drawImage(LC, 0, 0, W, H);
  // interfaz nítida (en una rejilla de 480x270, a escala 2)
  X = O; X.setTransform(2, 0, 0, 2, 0, 0);
  if (st == 'title') {
    const lw = tx('AXIOMI', -999, 0, '#000', 9);
    let x = U / 2 - lw / 2; 'AXIOMI'.split('').forEach((ch, i) => { const c = AX[(i + floor(t * 2)) % 4].c, y = 34 + sin(t * 3 + i) * 3; tx(ch, x, y, c, 9); x += 6.4 * .95 * 9; });
    txs('GIRA EL MUNDO. CAMBIA SUS REGLAS.', U / 2, 96, '#e8e4ff', 2, 1);
    AX.forEach((a, k) => { tx(k + 1 + ' ' + a.n, 90 + k * 100, 176, a.c, 1, 1); });
    txs('<  >  GIRAR EL MUNDO      ESPACIO  SALTAR', U / 2, 194, '#b8b0e0', 1, 1);
    txs('1 2 3 4  O  Q E  CAMBIAR DE COLOR', U / 2, 206, '#b8b0e0', 1, 1);
    txs('SOLO LO DE TU COLOR ES SOLIDO', U / 2, 218, '#8a84b8', 1, 1);
    if (t % 1 < .65) txs('PULSA ESPACIO', U / 2, 236, '#ffffff', 2, 1);
    if (S.b) txs('RECORD ' + S.b + '   PROF ' + S.d + 'M', U / 2, 258, '#ffd75e', 1, 1);
    return;
  }
  // barra de luz
  const lc = L < 25 && t % .4 < .2 ? '#ff4060' : '#ffe9a8';
  X.lineCap = 'round'; X.lineWidth = 3; X.strokeStyle = '#ffffff22'; X.beginPath(); X.moveTo(12, 13); X.lineTo(108, 13); X.stroke();
  X.save(); X.shadowColor = lc; X.shadowBlur = 10; X.strokeStyle = lc; X.beginPath(); X.moveTo(12, 13); X.lineTo(12 + 96 * L / 100, 13); X.stroke(); X.restore();
  txs('LUZ', 116, 10, lc);
  txs(depth + 'M', U - 10, 8, '#ffffff', 3, 2); txs(score + ' PTS', U - 10, 33, '#9ad8ff', 1, 2); txs(BN[pbi], U - 10, 45, '#8a84b8', 1, 2);
  // selector de color: 1 2 3 4 (en pantallas táctiles también son botones)
  for (let k = 0; k < 4; k++) {
    const x = U - 98 + k * 23, y = V - 26, on = k == q;
    X.save(); if (on) { X.shadowColor = AX[k].c; X.shadowBlur = 12; }
    X.fillStyle = on ? AX[k].c : AX[k].k; X.beginPath(); X.roundRect(x, y, 19, 19, 4); X.fill(); X.restore();
    if (on) { X.strokeStyle = '#ffffff'; X.lineWidth = 1; X.beginPath(); X.roundRect(x - 1.5, y - 1.5, 22, 22, 5); X.stroke(); }
    tx(k + 1, x + 9.5, y + 6.5, on ? '#000000' : '#ffffffaa', 1, 1);
  }
  txs(ax.n, U - 8, V - 38, ax.c, 1, 2);
  if (bn > 0 && st == 'play') { ga(min(1, bn)); txs(BN[pbi], U / 2, 112, '#ffffff', 3, 1); ga(1); }
  if (ban > 0 && st == 'play') { ga(min(1, ban * 2)); txs(ax.n, U / 2, 44, ax.c, 4, 1); txs(ax.h, U / 2, 72, '#e8e4ff', 1, 1); ga(1); }
  if (st == 'play' && t < 8 && S.n < 5) { txs('< > GIRA EL MUNDO PARA CAER HACIA LOS LADOS', U / 2, V - 58, '#e8e4ff', 1, 1); txs('1 2 3 4 CAMBIA DE COLOR: SOLO TU COLOR ES SOLIDO', U / 2, V - 46, '#e8e4ff', 1, 1); }
  if (st == 'over') {
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
  const dg = /^(Digit|Numpad)([1-4])$/.exec(e.code);
  if (dg) sel(dg[2] - 1);
  if (e.code == 'KeyQ') sel(q - 1);
  if (e.code == 'KeyE') sel(q + 1);
  if (e.code == 'KeyM') { S.m ^= 1; save(); if (MG) MG.gain.value = S.m ? 0 : .5; }
};
onkeyup = e => K[e.code] = 0;
let pd = 0;
cv.onpointerdown = e => {
  au();
  const r = cv.getBoundingClientRect(), gx = (e.clientX - r.left) / r.width * U, gy = (e.clientY - r.top) / r.height * V, k = floor((gx - U + 99.5) / 23);
  if (st == 'play' && gy > V - 30 && k >= 0 && k < 4) { sel(k); pd = 0; return; } // botones de color
  pd = { x: e.clientX, m: 0 };
};
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
    if (st == 'title') { th = ca = sin(t * .45) * .7; q = pq = floor(t * .7) % 4; camx = p.x + sin(t * .2) * 40; camy = p.y + 30 + sin(t * .3) * 30; }
  }
  sh = max(0, sh - dt * 12); fl = max(0, fl - dt * 2.5); ban -= dt; bn -= dt;
  pre(); draw();
};
reset();
requestAnimationFrame(loop);
})();
