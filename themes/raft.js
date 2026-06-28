// Auto-generated theme pack.
// Contract: registerTheme({ key, emoji, title, order?, seed(env), draw(env, t, dt) })
// env = { ctx, W, H, rnd, pick }. Keep per-theme state in module scope.
//
// A lone castaway on a bamboo raft, riding the moods of the open sea:
//  - sunny : calm water, the captain fishes; gulls, the odd leaping fish
//  - storm : huge swell + tsunami heaves, slashing rain, lightning; he white-knuckles the steering oar
//  - snow  : he curls into a shivering ball around a campfire amidships
//  - night : stars + moon; either grilling a fish over the fire, or asleep in his bag
let ctx, W, H, rnd, pick
function B (e) { ctx = e.ctx; W = e.W; H = e.H; rnd = e.rnd; pick = e.pick }

const TAU = 6.2832
const PHASE_KEYS = ['sunny', 'storm', 'snow', 'night']
const PHASES = {
  sunny: { amp: 4, skyT: [120, 180, 225], skyB: [206, 232, 246], sea: [42, 122, 165] },
  storm: { amp: 22, skyT: [38, 42, 52], skyB: [74, 80, 92], sea: [34, 52, 66] },
  snow: { amp: 7, skyT: [150, 158, 172], skyB: [202, 208, 218], sea: [82, 106, 122] },
  night: { amp: 4, skyT: [12, 16, 38], skyB: [30, 40, 70], sea: [20, 34, 58] }
}

// --- state ---
let phase = 'sunny', phaseT = 0, nightMode = 'grill'
let curAmp, curSkyT, curSkyB, curSea
let sunAmt, moonAmt, rainAmt, snowAmt, fireAmt // smooth 0..1 presences for crossfades
let surge = 0, surgeCd = 0, surgePeak = 0, surgeT = 0 // tsunami heave (swells in/out smoothly)
let rain = [], snow = [], stars = [], clouds = [], gulls = [], leapers = []
let fishState = 'wait', fishTimer = 0, biteDur = 0, flingStart = [0, 0] // fishing: wait -> bite -> fling-into-box
let ripples = []
let light = { cd: 0, flash: 0, bolt: null, hold: 0 }
let WATER = 0, now = 0

// --- helpers ---
function mix (a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k] }
function rgb (c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a == null ? 1 : a) + ')' }
function approach (c, target, k) { return c + (target - c) * k }
function seaY (x) {
  return WATER +
    Math.sin(x * 0.030 + now * 1.1) * curAmp +
    Math.sin(x * 0.017 - now * 0.7) * curAmp * 0.6 +
    Math.sin(x * 0.071 + now * 2.0) * curAmp * 0.25 +
    (surge > 0.2 ? Math.sin(x * 0.012 + now * 0.9) * surge : 0)
}
function seaSlope (x) { return (seaY(x + 2) - seaY(x - 2)) / 4 }

function seed (env) {
  B(env)
  WATER = H * 0.6
  phase = 'sunny'; phaseT = 60; nightMode = 'grill'
  const P = PHASES.sunny
  curAmp = P.amp; curSkyT = P.skyT.slice(); curSkyB = P.skyB.slice(); curSea = P.sea.slice()
  sunAmt = 1; moonAmt = 0; rainAmt = 0; snowAmt = 0; fireAmt = 0
  surge = 0; surgeCd = 0; surgePeak = 0; surgeT = 0
  rain = []; snow = []; leapers = []; ripples = []
  fishState = 'wait'; fishTimer = rnd(3, 7); biteDur = 0
  light = { cd: rnd(2, 4), flash: 0, bolt: null, hold: 0 }
  stars = []
  const sn = Math.min(60, Math.round(W * H * 0.6 / 3000))
  for (let i = 0; i < sn; i++) stars.push({ x: rnd(0, W), y: rnd(2, H * 0.5), a: rnd(0.2, 0.7), tw: rnd(0, TAU) })
  clouds = []
  const cn = 3 + Math.round(H / 260)
  for (let i = 0; i < cn; i++) clouds.push({ x: rnd(0, W), y: rnd(8, Math.max(20, H * 0.3)), r: rnd(14, 30), spd: rnd(-6, 6) || 4, a: rnd(0.08, 0.18) })
  gulls = []
  for (let i = 0; i < 3; i++) gulls.push({ x: rnd(0, W), y: rnd(14, Math.max(24, H * 0.28)), spd: rnd(8, 16) * (Math.random() < 0.5 ? 1 : -1), ph: rnd(0, TAU) })
}

// --- celestial / weather draws ---
function drawSun (x, y, a) {
  const grd = ctx.createRadialGradient(x, y, 3, x, y, 26)
  grd.addColorStop(0, 'rgba(255,240,190,' + (0.9 * a) + ')'); grd.addColorStop(1, 'rgba(255,240,190,0)')
  ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(x, y, 26, 0, TAU); ctx.fill()
  ctx.globalAlpha = a; ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill(); ctx.globalAlpha = 1
}
function drawMoon (x, y, a) {
  const grd = ctx.createRadialGradient(x, y, 4, x, y, 24)
  grd.addColorStop(0, 'rgba(220,226,210,' + (0.5 * a) + ')'); grd.addColorStop(1, 'rgba(220,226,210,0)')
  ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(x, y, 24, 0, TAU); ctx.fill()
  ctx.globalAlpha = a; ctx.fillStyle = '#d7dac8'; ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill()
  ctx.fillStyle = rgb(curSkyT, 1); ctx.beginPath(); ctx.arc(x + 3, y - 2, 7, 0, TAU); ctx.fill() // crescent bite
  ctx.globalAlpha = 1
}
function drawCloud (c, dark) {
  ctx.globalAlpha = c.a * (dark ? 1.6 : 1); ctx.fillStyle = dark ? '#5a5e68' : '#eef3f7'
  for (const o of [[0, 0, 1], [c.r * 0.6, 2, 0.7], [-c.r * 0.6, 2, 0.7]]) {
    ctx.beginPath(); ctx.ellipse(c.x + o[0], c.y + o[1], c.r * o[2], c.r * o[2] * 0.55, 0, 0, TAU); ctx.fill()
  }
  ctx.globalAlpha = 1
}
function makeBolt () {
  const x0 = rnd(W * 0.15, W * 0.85)
  const pts = [{ x: x0, y: 0 }]
  let y = 0, x = x0
  const end = WATER - rnd(0, 30)
  while (y < end) { y += rnd(10, 22); x += rnd(-14, 14); pts.push({ x, y }) }
  return pts
}
function drawBolt (pts, a) {
  ctx.globalAlpha = a; ctx.strokeStyle = '#eaf2ff'; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  ctx.shadowColor = '#bcd2ff'; ctx.shadowBlur = 8
  ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke()
  ctx.shadowBlur = 0; ctx.globalAlpha = 1
}

// --- campfire (drawn in raft-local coords) ---
function drawFire (x, t, amt) {
  const gy = -3
  const grd = ctx.createRadialGradient(x, gy - 3, 1, x, gy - 3, 16)
  grd.addColorStop(0, 'rgba(255,170,70,' + (0.5 * amt) + ')'); grd.addColorStop(1, 'rgba(255,170,70,0)')
  ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(x, gy - 3, 16, 0, TAU); ctx.fill()
  ctx.globalAlpha = amt
  ctx.strokeStyle = '#5b3a1e'; ctx.lineWidth = 1.8; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(x - 4, gy); ctx.lineTo(x + 4, gy - 2); ctx.moveTo(x + 4, gy); ctx.lineTo(x - 4, gy - 2); ctx.stroke()
  for (let i = 0; i < 3; i++) {
    const fx = x + (i - 1) * 2.4
    const h = (5 + i % 2 * 2) * (0.7 + 0.3 * Math.sin(t * 11 + i * 2)) + Math.random() * 1.5
    ctx.fillStyle = i === 1 ? '#ffd24a' : '#ff8a3a'
    ctx.beginPath(); ctx.moveTo(fx - 1.8, gy - 1); ctx.quadraticCurveTo(fx, gy - h, fx + 1.8, gy - 1); ctx.closePath(); ctx.fill()
  }
  for (let i = 0; i < 2; i++) if (Math.random() < 0.5) { ctx.fillStyle = '#ffcf7a'; ctx.fillRect(x + rnd(-3, 3), gy - rnd(6, 12), 1, 1) }
  ctx.globalAlpha = 1
}

// --- the captain, per mood (raft-local coords; deck top at y = -3) ---
function skin () { ctx.fillStyle = '#caa06f' }
function clothes () { ctx.fillStyle = '#7a4a3a' }
function drawBox () {
  // wooden catch crate on the deck, open at the top
  ctx.fillStyle = '#7a5230'; ctx.beginPath(); ctx.roundRect(6, -9, 11, 7, 1.5); ctx.fill()
  ctx.fillStyle = '#2a1c10'; ctx.beginPath(); ctx.ellipse(11.5, -9, 5, 1.4, 0, 0, TAU); ctx.fill() // open top
  ctx.strokeStyle = '#5e3d20'; ctx.lineWidth = 0.8; ctx.strokeRect(6, -9, 11, 7)
  ctx.beginPath(); ctx.moveTo(6, -5.5); ctx.lineTo(17, -5.5); ctx.stroke() // plank seam
  ctx.fillStyle = '#9fb8c4'; ctx.beginPath(); ctx.ellipse(13, -9.2, 1.8, 0.8, -0.5, 0, TAU); ctx.fill() // a tail poking out
}
function drawCaptainFishing (t, recoil) {
  const bob = Math.sin(t * 2) * 0.6, r = recoil || 0
  ctx.save(); ctx.translate(-9, bob)
  clothes(); ctx.fillRect(-2, -11, 4, 8) // torso
  skin(); ctx.beginPath(); ctx.arc(0, -13, 2.2, 0, TAU); ctx.fill() // head
  ctx.fillStyle = '#caa46a'; ctx.beginPath(); ctx.ellipse(0, -14.4, 3.6, 1.2, 0, 0, TAU); ctx.fill() // straw hat
  // arm + rod swing from cast (r=0) back over the shoulder (r=1) for the yank
  const hx = -7 + r * 7, hy = -12 - r * 4, tx = -20 + r * 28, ty = -17 - r * 6
  ctx.strokeStyle = '#caa06f'; ctx.lineWidth = 1.4; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(-1, -9); ctx.lineTo(hx, hy); ctx.stroke() // arm
  ctx.strokeStyle = '#7a5a2a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(tx, ty); ctx.stroke() // rod
  ctx.restore()
}
function drawCaptainTiller (t) {
  const jx = rnd(-0.6, 0.6), jy = rnd(-0.4, 0.4) // nervous tremble
  ctx.save(); ctx.translate(10 + jx, jy)
  // steering oar: handle up by the hands, blade down into the water behind
  ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(6, -14); ctx.lineTo(13, 6); ctx.stroke()
  ctx.fillStyle = '#8a6a3a'; ctx.beginPath(); ctx.ellipse(13, 7, 1.6, 3.2, -0.3, 0, TAU); ctx.fill()
  clothes(); ctx.save(); ctx.rotate(0.18); ctx.fillRect(-2, -11, 4, 8); ctx.restore() // leaning torso
  skin(); ctx.beginPath(); ctx.arc(-1, -13, 2.2, 0, TAU); ctx.fill()
  ctx.strokeStyle = '#caa06f'; ctx.lineWidth = 1.4; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(-1, -10); ctx.lineTo(6, -13); ctx.stroke() // arms grip handle
  if (Math.random() < 0.25) { ctx.fillStyle = 'rgba(150,200,235,0.8)'; ctx.beginPath(); ctx.ellipse(-3, -12 + (t * 30 % 6), 0.8, 1.3, 0, 0, TAU); ctx.fill() } // sweat
  ctx.restore()
}
function drawCaptainCurled (t) {
  const sh = rnd(-0.4, 0.4)
  ctx.save(); ctx.translate(-8 + sh, 0)
  clothes(); ctx.beginPath(); ctx.moveTo(-6, -3); ctx.quadraticCurveTo(-6, -12, 0, -12); ctx.quadraticCurveTo(6, -12, 6, -3); ctx.closePath(); ctx.fill() // hunched blanket
  skin(); ctx.beginPath(); ctx.arc(-3, -9, 2, 0, TAU); ctx.fill() // tucked head
  ctx.restore()
}
function drawCaptainGrill (t) {
  ctx.save(); ctx.translate(-9, 0)
  clothes(); ctx.fillRect(-2, -10, 4, 7)
  skin(); ctx.beginPath(); ctx.arc(0, -12, 2.2, 0, TAU); ctx.fill()
  ctx.strokeStyle = '#caa06f'; ctx.lineWidth = 1.4; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(7, -10); ctx.stroke() // arm with skewer
  ctx.strokeStyle = '#9a7a4a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(7, -10); ctx.lineTo(13, -9); ctx.stroke()
  ctx.fillStyle = '#b98a55'; ctx.beginPath(); ctx.ellipse(12.5, -9.5, 2.2, 1.1, -0.2, 0, TAU); ctx.fill() // fish on skewer
  ctx.restore()
}
function drawCaptainSleep (t) {
  ctx.save()
  ctx.fillStyle = '#3f5566'; ctx.beginPath(); ctx.roundRect(-12, -8, 22, 5, 2.5); ctx.fill() // sleeping bag
  skin(); ctx.beginPath(); ctx.arc(-11, -7, 2.2, 0, TAU); ctx.fill() // head poking out
  ctx.fillStyle = 'rgba(230,235,245,' + (0.5 + 0.5 * Math.sin(t * 2)) + ')'
  ctx.font = '6px sans-serif'; ctx.fillText('z', -6 + Math.sin(t) * 1.5, -12 - (t * 6 % 8))
  ctx.fillText('z', -3 + Math.sin(t + 1) * 1.5, -9 - (t * 5 % 7))
  ctx.globalAlpha = 1
  ctx.restore()
}

function draw (env, t, dt) {
  B(env)
  now = t; WATER = H * 0.6
  const k = Math.min(1, dt / 1.4)

  // ---- phase scheduler ----
  phaseT -= dt
  if (phaseT <= 0) {
    phase = pick(PHASE_KEYS.filter(p => p !== phase))
    phaseT = 60
    if (phase === 'night') nightMode = Math.random() < 0.5 ? 'grill' : 'sleep'
    if (phase === 'storm') { light.cd = rnd(1.2, 2.6); surgeCd = rnd(3, 6) }
    if (phase === 'sunny') { fishState = 'wait'; fishTimer = rnd(3, 7) }
  }
  const P = PHASES[phase]
  curAmp = approach(curAmp, P.amp, k)
  curSkyT = mix(curSkyT, P.skyT, k); curSkyB = mix(curSkyB, P.skyB, k); curSea = mix(curSea, P.sea, k)
  sunAmt = approach(sunAmt, phase === 'sunny' ? 1 : 0, k)
  moonAmt = approach(moonAmt, phase === 'night' ? 1 : 0, k)
  rainAmt = approach(rainAmt, phase === 'storm' ? 1 : 0, k)
  snowAmt = approach(snowAmt, phase === 'snow' ? 1 : 0, k)
  fireAmt = approach(fireAmt, (phase === 'snow' || (phase === 'night' && nightMode === 'grill')) ? 1 : 0, k)

  // ---- sky ----
  const sg = ctx.createLinearGradient(0, 0, 0, WATER)
  sg.addColorStop(0, rgb(curSkyT, 0.5)); sg.addColorStop(1, rgb(curSkyB, 0.42))
  ctx.fillStyle = sg; ctx.fillRect(0, 0, W, WATER + 2)

  // sun / moon / stars
  if (sunAmt > 0.02) drawSun(W * 0.8, H * 0.16, sunAmt)
  if (moonAmt > 0.02) {
    drawMoon(W * 0.78, H * 0.15, moonAmt)
    for (const s of stars) { const a = s.a * moonAmt * (0.5 + 0.5 * Math.sin(t * 2 + s.tw)); ctx.globalAlpha = a; ctx.fillStyle = '#cfd6e0'; ctx.fillRect(s.x, s.y, 1, 1) }
    ctx.globalAlpha = 1
  }

  // clouds (darker + heavier-looking in storm)
  const dark = rainAmt > 0.4
  for (const c of clouds) {
    c.x += c.spd * dt * (1 + rainAmt); if (c.x - c.r > W) c.x = -c.r; else if (c.x + c.r < 0) c.x = W + c.r
    drawCloud(c, dark)
  }

  // gulls in fair weather
  for (const g of gulls) {
    g.x += g.spd * dt; if (g.x < -12) g.x = W + 12; else if (g.x > W + 12) g.x = -12
    const a = sunAmt * 0.7; if (a < 0.05) continue
    const flap = Math.sin(t * 6 + g.ph) * 2
    ctx.globalAlpha = a; ctx.strokeStyle = '#33414e'; ctx.lineWidth = 1.2; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(g.x - 4, g.y + flap); ctx.lineTo(g.x, g.y); ctx.lineTo(g.x + 4, g.y + flap); ctx.stroke()
    ctx.globalAlpha = 1
  }

  // ---- lightning (storm) ----
  if (rainAmt > 0.4) {
    light.cd -= dt
    if (light.cd <= 0) { light.bolt = makeBolt(); light.flash = 1; light.hold = rnd(0.06, 0.16); light.cd = rnd(2.5, 6) }
  }
  if (light.hold > 0) { light.hold -= dt } else { light.flash = Math.max(0, light.flash - dt * 4) }
  if (light.flash > 0) {
    ctx.fillStyle = 'rgba(225,235,255,' + (0.45 * light.flash) + ')'; ctx.fillRect(0, 0, W, H)
    if (light.bolt) drawBolt(light.bolt, Math.min(1, light.flash + 0.3))
  }

  // ---- tsunami heave (storm): swell in and recede smoothly so the sea never pops ----
  if (rainAmt > 0.5) {
    surgeCd -= dt
    if (surgeCd <= 0) { surgePeak = rnd(14, 24); surgeT = rnd(1.5, 3); surgeCd = rnd(7, 13) }
  }
  surgeT -= dt
  surge = approach(surge, surgeT > 0 ? surgePeak : 0, Math.min(1, dt * 1.6))

  // ---- sea ----
  const seaG = ctx.createLinearGradient(0, WATER - 20, 0, H)
  seaG.addColorStop(0, rgb(curSea, 0.78)); seaG.addColorStop(1, rgb(mix(curSea, [0, 0, 0], 0.5), 0.85))
  ctx.fillStyle = seaG
  ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, seaY(0))
  for (let x = 0; x <= W; x += 6) ctx.lineTo(x, seaY(x))
  ctx.lineTo(W, H); ctx.closePath(); ctx.fill()
  // foam crest
  ctx.strokeStyle = 'rgba(235,245,250,' + (0.25 + rainAmt * 0.3) + ')'; ctx.lineWidth = 1.4
  ctx.beginPath(); ctx.moveTo(0, seaY(0)); for (let x = 6; x <= W; x += 6) ctx.lineTo(x, seaY(x)); ctx.stroke()
  // glints under a low sun/moon on calmer water
  const glint = Math.max(sunAmt, moonAmt) * (1 - rainAmt)
  if (glint > 0.1) {
    ctx.fillStyle = 'rgba(255,250,225,' + (0.35 * glint) + ')'
    for (let x = W * 0.62; x < W * 0.92; x += 9) { const yy = seaY(x); ctx.fillRect(x, yy + 1, rnd(3, 7), 1) }
  }

  // ---- raft geometry ----
  const rx = W * 0.5 + Math.sin(t * 0.3) * W * 0.05 * (1 + rainAmt)
  const ry = seaY(rx) - 1
  const tilt = Math.atan(seaSlope(rx))
  const cT = Math.cos(tilt), sT = Math.sin(tilt)
  const toW = (lx, ly) => [rx + lx * cT - ly * sT, ry + lx * sT + ly * cT]
  const bob = Math.sin(t * 2) * 0.6
  const rodWorld = toW(-29, -17 + bob) // rod tip in world space
  const boxWorld = toW(11, -8)         // mouth of the deck crate

  // ---- fishing cycle (sunny): bobber bobs, ripples fan out and fade, then the catch is flicked into the box ----
  let recoil = 0, lineEnd = null, bobberAt = null, flungFish = null
  if (phase === 'sunny') {
    const bx = rx - 40, byW = seaY(bx)
    fishTimer -= dt
    if (fishState === 'wait') {
      bobberAt = [bx, byW + Math.sin(t * 3) * 0.8]; lineEnd = bobberAt
      if (Math.random() < dt * 1.4) ripples.push({ x: bx, r0: rnd(9, 14), life: 0, dur: rnd(1.8, 2.6), str: 0.22 })
      if (fishTimer <= 0) { fishState = 'bite'; biteDur = rnd(1.3, 1.9); fishTimer = biteDur }
    } else if (fishState === 'bite') {
      bobberAt = [bx, byW + Math.sin(t * 18) * 1.9]; lineEnd = bobberAt // sharp up/down jiggle
      const bp = 1 - Math.max(0, fishTimer / biteDur) // strike builds 0 -> 1
      if (Math.random() < dt * 7) ripples.push({ x: bx, r0: rnd(10, 16), life: 0, dur: rnd(1.8, 2.6), str: 0.35 + bp * 0.4 })
      if (fishTimer <= 0) { fishState = 'fling'; fishTimer = 0.6; flingStart = [bx, byW] }
    } else { // fling: yank the fish in an arc, back onto the deck crate
      const p = Math.min(1, 1 - Math.max(0, fishTimer) / 0.6)
      const fx = flingStart[0] + (boxWorld[0] - flingStart[0]) * p
      const fy = flingStart[1] + (boxWorld[1] - flingStart[1]) * p - 42 * Math.sin(p * Math.PI)
      flungFish = [fx, fy, p * 9] // arcs through the air, spinning
      recoil = Math.max(0, 1 - p * 1.4) // rod snaps back hardest at the start of the flick
      if (fishTimer <= 0) { fishState = 'wait'; fishTimer = rnd(3, 7) }
    }
  }

  // ---- ripples on the water: flat, expanding, fading out as they spread ----
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i]; r.life += dt; const k = r.life / r.dur
    if (k >= 1) { ripples.splice(i, 1); continue }
    const rr = 2 + k * r.r0, yy = seaY(r.x) + 2.5 // ride the wave, sitting a touch lower on the surface
    ctx.globalAlpha = r.str * (1 - k) // most visible at the centre, fainter as it widens
    ctx.strokeStyle = '#eaf4f8'; ctx.lineWidth = 0.9
    ctx.beginPath(); ctx.ellipse(r.x, yy, rr, rr * 0.18, 0, 0, TAU); ctx.stroke()
  }
  ctx.globalAlpha = 1

  // ---- raft + captain + catch box ----
  ctx.save(); ctx.translate(rx, ry); ctx.rotate(tilt)
  ctx.fillStyle = '#bd8e4f'; ctx.beginPath(); ctx.roundRect(-24, -4, 48, 6, 3); ctx.fill() // bamboo bundle
  ctx.strokeStyle = '#7c5a28'; ctx.lineWidth = 0.8
  for (let lx = -20; lx <= 20; lx += 6) { ctx.beginPath(); ctx.moveTo(lx, -4); ctx.lineTo(lx, 2); ctx.stroke() }
  ctx.fillStyle = '#5e421d'; ctx.fillRect(-14, -4.5, 2, 7); ctx.fillRect(12, -4.5, 2, 7) // lashings
  if (fireAmt > 0.05) drawFire(2, t, fireAmt)
  if (phase === 'sunny') { drawBox(); drawCaptainFishing(t, recoil) }
  else if (phase === 'storm') drawCaptainTiller(t)
  else if (phase === 'snow') drawCaptainCurled(t)
  else if (nightMode === 'grill') drawCaptainGrill(t)
  else drawCaptainSleep(t)
  ctx.restore()

  // ---- fishing line / bobber / flung catch (world space, drawn over the raft) ----
  if (lineEnd) {
    ctx.strokeStyle = 'rgba(240,240,240,0.6)'; ctx.lineWidth = 0.7
    ctx.beginPath(); ctx.moveTo(rodWorld[0], rodWorld[1]); ctx.lineTo(lineEnd[0], lineEnd[1]); ctx.stroke()
  }
  if (bobberAt) {
    ctx.fillStyle = '#d6504a'; ctx.beginPath(); ctx.arc(bobberAt[0], bobberAt[1], 1.6, 0, TAU); ctx.fill()
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bobberAt[0], bobberAt[1] - 0.4, 0.7, 0, TAU); ctx.fill()
  }
  if (flungFish) {
    ctx.save(); ctx.translate(flungFish[0], flungFish[1]); ctx.rotate(flungFish[2]); ctx.fillStyle = '#9fb8c4'
    ctx.beginPath(); ctx.ellipse(0, 0, 3.4, 1.6, 0, 0, TAU); ctx.fill()
    ctx.beginPath(); ctx.moveTo(-3.4, 0); ctx.lineTo(-5.4, -1.6); ctx.lineTo(-5.4, 1.6); ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#22303a'; ctx.beginPath(); ctx.arc(2, -0.4, 0.5, 0, TAU); ctx.fill()
    ctx.restore()
  }

  // ---- leaping fish (calm weather) ----
  if (sunAmt > 0.5 && Math.random() < 0.01) { const fx = rnd(W * 0.1, W * 0.9); leapers.push({ x: fx, y: seaY(fx), vx: rnd(-20, 20), vy: rnd(-70, -45), life: 0 }) }
  for (let i = leapers.length - 1; i >= 0; i--) {
    const f = leapers[i]; f.vy += 120 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.life += dt
    if (f.y > seaY(f.x) + 2 || f.life > 2.5) { leapers.splice(i, 1); continue }
    ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(Math.atan2(f.vy, f.vx)); ctx.fillStyle = '#9fb8c4'
    ctx.beginPath(); ctx.ellipse(0, 0, 3.4, 1.5, 0, 0, TAU); ctx.fill()
    ctx.beginPath(); ctx.moveTo(-3.4, 0); ctx.lineTo(-5.2, -1.6); ctx.lineTo(-5.2, 1.6); ctx.closePath(); ctx.fill()
    ctx.restore()
  }

  // ---- rain (storm) ----
  if (rainAmt > 0.05) {
    const maxR = Math.round(W * H / 1400 * rainAmt)
    while (rain.length < maxR) rain.push({ x: rnd(0, W), y: rnd(-H, H), len: rnd(7, 13), vy: rnd(420, 560) })
    ctx.strokeStyle = 'rgba(180,200,220,' + (0.5 * rainAmt) + ')'; ctx.lineWidth = 1
    const wind = 90
    ctx.beginPath()
    for (const d of rain) {
      d.y += d.vy * dt; d.x += wind * dt
      if (d.y > H || d.x > W + 10) { d.y = rnd(-20, 0); d.x = rnd(-10, W) }
      ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - wind * 0.02, d.y - d.len)
    }
    ctx.stroke()
  } else if (rain.length) rain.length = 0

  // ---- snow ----
  if (snowAmt > 0.05) {
    const maxS = Math.round(W * H / 2200 * snowAmt)
    while (snow.length < maxS) snow.push({ x: rnd(0, W), y: rnd(-H, H), r: rnd(0.8, 2), vy: rnd(20, 45), ph: rnd(0, TAU) })
    ctx.fillStyle = 'rgba(255,255,255,' + (0.85 * snowAmt) + ')'
    for (const f of snow) {
      f.y += f.vy * dt; f.x += Math.sin(t * 1.5 + f.ph) * 8 * dt
      if (f.y > H) { f.y = rnd(-20, 0); f.x = rnd(0, W) }
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, TAU); ctx.fill()
    }
  } else if (snow.length) snow.length = 0
}

registerTheme({ key: 'raft', emoji: '🛶', title: 'Castaway Raft', order: 6, seed, draw })
