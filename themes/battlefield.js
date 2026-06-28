// Auto-generated theme pack.
// Contract: registerTheme({ key, emoji, title, order?, seed(env), draw(env, t, dt) })
// env = { ctx, W, H, rnd, pick }. Keep per-theme state in module scope.
let ctx, W, H, rnd, pick
function B (e) { ctx = e.ctx; W = e.W; H = e.H; rnd = e.rnd; pick = e.pick }

const TAU = 6.2832
const FLOOR = 14 // dirt band height; ground surface = H - FLOOR
const HP = { tank: 4, robot: 3, soldier: 2 }

// --- state ---
let units = [], tracers = [], bombs = [], shells = [], booms = [], smoke = [], debris = [], craters = []
let buildings = [], aa = [], flak = []
let plane = null, artTimer = 0
// sky dressing (fills the big empty upper area + adds depth)
let stars = [], clouds = [], lights = [], farPlanes = [], moon = null, farTimer = 0

function seed (env) {
  B(env)
  const gY = H - FLOOR
  const mk = (fac, type, baseX) => ({
    fac, type, baseX, x: baseX, ph: rnd(0, TAU), wspd: rnd(0.4, 0.9), range: rnd(6, 16),
    face: fac === 'l' ? 1 : -1, cd: rnd(0.4, 1.4),
    col: fac === 'l' ? '#5f7a8c' : '#8c6b5a',
    dark: fac === 'l' ? '#3f5566' : '#5e4639',
    tracer: fac === 'l' ? '#6fd0e0' : '#e0a04a',
    hp: HP[type], maxHp: HP[type], dead: false, respawn: 0, flash: 0
  })
  units = [
    mk('l', 'tank', rnd(W * 0.08, W * 0.18)),
    mk('l', 'robot', rnd(W * 0.18, W * 0.30)),
    mk('l', 'soldier', rnd(W * 0.10, W * 0.34)),
    mk('l', 'soldier', rnd(W * 0.10, W * 0.34)),
    mk('r', 'tank', rnd(W * 0.82, W * 0.92)),
    mk('r', 'robot', rnd(W * 0.70, W * 0.82)),
    mk('r', 'soldier', rnd(W * 0.66, W * 0.90)),
    mk('r', 'soldier', rnd(W * 0.66, W * 0.90))
  ]
  tracers = []; bombs = []; shells = []; booms = []; smoke = []; debris = []; craters = []
  plane = { state: 'wait', timer: rnd(3, 7), x: 0, y: 0, dir: 1, spd: 70, dropCd: 0, hp: 0, roll: 0, vy: 0 }
  artTimer = rnd(1.5, 3)
  // background city skyline (left to right), with a scatter of lit windows
  buildings = []
  let bx = rnd(-12, 2)
  while (bx < W + 12) {
    const w = rnd(16, 34)
    const bh = rnd(26, Math.min(Math.max(40, H * 0.42), 100))
    const win = []
    for (let wy = 6; wy < bh - 4; wy += 7) for (let wx = 3; wx < w - 3; wx += 6) if (Math.random() < 0.5) win.push({ x: wx, y: wy })
    buildings.push({ x: bx, w, h: bh, col: pick(['#23262e', '#2a2e38', '#1e2128']), win })
    bx += w + rnd(1, 7)
  }
  // anti-air emplacements (one per side) that track ENEMY bombers only
  aa = [
    { x: rnd(W * 0.20, W * 0.30), fac: 'l', ang: -Math.PI / 2, cd: rnd(0.4, 1) },
    { x: rnd(W * 0.70, W * 0.80), fac: 'r', ang: -Math.PI / 2, cd: rnd(0.4, 1) }
  ]
  flak = []

  // --- sky dressing ---
  const skyH = Math.max(20, gY)
  const n = Math.min(70, Math.round(W * skyH / 2600))
  stars = []
  for (let i = 0; i < n; i++) stars.push({ x: rnd(0, W), y: rnd(3, skyH * 0.85), a: rnd(0.2, 0.7), tw: rnd(0, TAU) })
  clouds = []
  const cn = 4 + Math.round(H / 220)
  for (let i = 0; i < cn; i++) clouds.push({ x: rnd(0, W), y: rnd(8, Math.max(20, skyH * 0.55)), r: rnd(14, 30), spd: rnd(-5, 5) || 3, a: rnd(0.06, 0.16) })
  lights = [
    { x: rnd(W * 0.10, W * 0.22), ph: rnd(0, TAU), spd: rnd(0.18, 0.32), spread: rnd(0.5, 0.8) },
    { x: rnd(W * 0.78, W * 0.90), ph: rnd(0, TAU), spd: rnd(0.18, 0.32), spread: rnd(0.5, 0.8) }
  ]
  farPlanes = []; farTimer = rnd(3, 7)
  moon = { x: rnd(W * 0.6, W * 0.85), y: rnd(14, Math.max(22, skyH * 0.25)), r: rnd(8, 12) }
}

// --- helpers ---
function explode (x, y, r0, ground) {
  booms.push({ x, y, t: 0, max: rnd(0.45, 0.8), r0 })
  const n = ground ? 8 : 5
  for (let i = 0; i < n; i++) {
    const a = ground ? (-Math.PI + Math.random() * Math.PI) : Math.random() * TAU
    const sp = rnd(30, 90)
    debris.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: rnd(0.5, 1.1) })
  }
  for (let i = 0; i < 3; i++) smoke.push({ x: x + rnd(-4, 4), y: y + rnd(-4, 4), r: rnd(3, 6), life: 0, max: rnd(0.9, 1.7) })
  if (ground) { craters.push({ x, r: rnd(4, 8) }); if (craters.length > 14) craters.shift() }
}
function killUnit (u) {
  const gY = H - FLOOR
  explode(u.x, gY - 6, rnd(7, 11), true)
  u.dead = true; u.respawn = rnd(3.5, 6.5)
}
function hurt (u, dmg) {
  if (u.dead) return
  u.hp -= dmg; u.flash = 0.14
  if (u.hp <= 0) killUnit(u)
}
function hurtArea (x, r, dmg) { for (const u of units) { if (!u.dead && Math.abs(u.x - x) < r) hurt(u, dmg) } }

// --- draw bits (units stand with feet on the ground line) ---
function drawRobot (u, t) {
  const gY = H - FLOOR, lp = Math.sin(t * 6 + u.ph)
  ctx.save(); ctx.translate(u.x, gY); ctx.scale(u.face, 1); ctx.globalAlpha = 0.95
  ctx.strokeStyle = u.dark; ctx.lineWidth = 2.4; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(-1, -6); ctx.lineTo(-2 + lp * 2, 0); ctx.moveTo(1, -6); ctx.lineTo(2 - lp * 2, 0); ctx.stroke()
  ctx.fillStyle = u.col; ctx.fillRect(-3, -14, 6, 8)
  ctx.fillStyle = u.dark; ctx.fillRect(-2.5, -18, 5, 4)
  ctx.fillStyle = '#d6504a'; ctx.fillRect(-1.5, -17, 3, 1.2)
  ctx.fillStyle = u.dark; ctx.fillRect(2, -12, 6, 2.4) // arm cannon
  ctx.restore(); ctx.globalAlpha = 1
}
function drawSoldier (u, t) {
  const gY = H - FLOOR, lp = Math.sin(t * 8 + u.ph)
  ctx.save(); ctx.translate(u.x, gY); ctx.scale(u.face, 1); ctx.globalAlpha = 0.95
  ctx.strokeStyle = u.dark; ctx.lineWidth = 1.6; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(-2 + lp * 2, 0); ctx.moveTo(0, -5); ctx.lineTo(2 - lp * 2, 0); ctx.stroke()
  ctx.fillStyle = u.col; ctx.fillRect(-1.6, -11, 3.2, 6)
  ctx.fillStyle = '#caa06f'; ctx.beginPath(); ctx.arc(0, -12.4, 1.8, 0, TAU); ctx.fill()
  ctx.fillStyle = u.dark; ctx.beginPath(); ctx.arc(0, -13, 2.2, Math.PI, TAU); ctx.fill()
  ctx.strokeStyle = '#333'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(6, -9.5); ctx.stroke()
  ctx.restore(); ctx.globalAlpha = 1
}
function drawTank (u, t) {
  const gY = H - FLOOR
  ctx.save(); ctx.translate(u.x, gY); ctx.scale(u.face, 1); ctx.globalAlpha = 0.95
  ctx.fillStyle = '#2b2f36'; ctx.fillRect(-10, -4, 20, 4) // tracks
  ctx.fillStyle = '#555b66'
  for (let wx = -8; wx <= 8; wx += 4) { ctx.beginPath(); ctx.arc(wx, -1.5, 1.5, 0, TAU); ctx.fill() }
  ctx.fillStyle = u.col; ctx.fillRect(-9, -9, 18, 5) // hull
  ctx.fillStyle = u.dark; ctx.fillRect(-4, -13, 9, 4) // turret
  ctx.fillRect(4, -12, 11, 1.8) // barrel
  ctx.restore(); ctx.globalAlpha = 1
}
function drawWreck (u) {
  const gY = H - FLOOR
  ctx.save(); ctx.translate(u.x, gY); ctx.globalAlpha = 0.85
  if (u.type === 'tank') {
    ctx.fillStyle = '#26221c'; ctx.fillRect(-9, -6, 18, 6)
    ctx.fillStyle = '#1c1916'; ctx.fillRect(-4, -9, 9, 3)
    ctx.save(); ctx.rotate(-0.5); ctx.fillRect(2, -9, 10, 1.6); ctx.restore() // canted barrel
  } else {
    ctx.fillStyle = '#2a2620'; ctx.fillRect(-4, -2, 8, 2) // prone body
  }
  ctx.restore(); ctx.globalAlpha = 1
  if (Math.random() < 0.18) smoke.push({ x: u.x + rnd(-3, 3), y: gY - 4, r: rnd(2, 3.5), life: 0, max: rnd(1, 2) })
}
function drawTracer (tr) {
  const a = Math.atan2(tr.vy, tr.vx), len = tr.big ? 8 : 6
  ctx.globalAlpha = 0.9; ctx.strokeStyle = tr.col; ctx.lineWidth = tr.big ? 2.4 : 1.6; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(tr.x, tr.y); ctx.lineTo(tr.x - Math.cos(a) * len, tr.y - Math.sin(a) * len); ctx.stroke()
  ctx.globalAlpha = 1
}
function drawBomb (b) {
  ctx.save(); ctx.translate(b.x, b.y); ctx.globalAlpha = 0.95
  ctx.fillStyle = '#33373f'; ctx.beginPath(); ctx.ellipse(0, 0, 2.2, 3.4, 0, 0, TAU); ctx.fill()
  ctx.fillStyle = '#22252b'; ctx.beginPath(); ctx.moveTo(-2, -3); ctx.lineTo(2, -3); ctx.lineTo(0, -5); ctx.closePath(); ctx.fill()
  ctx.restore(); ctx.globalAlpha = 1
}
function drawShell (sh) {
  for (let i = 0; i < sh.trail.length; i++) {
    const p = sh.trail[i], k = i / sh.trail.length
    ctx.globalAlpha = k * 0.4; ctx.fillStyle = '#c9b8a0'
    ctx.beginPath(); ctx.arc(p.x, p.y, 1 * (k + 0.3), 0, TAU); ctx.fill()
  }
  ctx.globalAlpha = 1; ctx.fillStyle = '#2b2f36'
  ctx.beginPath(); ctx.arc(sh.x, sh.y, 1.8, 0, TAU); ctx.fill()
}
function drawPlane (p, burning) {
  const body = p.fac === 'r' ? '#8c6b5a' : '#5f7a8c'
  const wing = p.fac === 'r' ? '#5e4639' : '#3f5566'
  ctx.save(); ctx.translate(p.x, p.y); if (p.roll) ctx.rotate(p.roll); ctx.scale(p.dir, 1); ctx.globalAlpha = 0.95
  ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(0, 0, 11, 3, 0, 0, TAU); ctx.fill()
  ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-13, -4); ctx.lineTo(-8, -0.5); ctx.closePath(); ctx.fill()
  ctx.fillStyle = wing; ctx.beginPath(); ctx.moveTo(-1, 1); ctx.lineTo(-6, 7); ctx.lineTo(2, 2); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#8fb6d6'; ctx.beginPath(); ctx.arc(6, -0.6, 1.6, 0, TAU); ctx.fill()
  ctx.restore(); ctx.globalAlpha = 1
  if (burning) {
    ctx.globalAlpha = 0.9; ctx.fillStyle = '#ffb24a'
    ctx.beginPath(); ctx.arc(p.x - p.dir * 8, p.y, rnd(2, 4), 0, TAU); ctx.fill()
    ctx.fillStyle = '#d6504a'; ctx.beginPath(); ctx.arc(p.x - p.dir * 10, p.y + 1, rnd(1, 2.5), 0, TAU); ctx.fill()
    ctx.globalAlpha = 1
  }
}
function drawBoom (e) {
  const k = e.t / e.max, r = e.r0 * (0.4 + k * 1.7), a = 1 - k
  ctx.globalAlpha = a
  ctx.fillStyle = '#ffd36a'; ctx.beginPath(); ctx.arc(e.x, e.y, r * 0.55, 0, TAU); ctx.fill()
  ctx.fillStyle = 'rgba(230,110,40,' + a.toFixed(2) + ')'; ctx.beginPath(); ctx.arc(e.x, e.y, r, 0, TAU); ctx.fill()
  ctx.globalAlpha = 1
}
function drawAA (a) {
  const gY = H - FLOOR
  ctx.save(); ctx.translate(a.x, gY); ctx.globalAlpha = 0.95
  ctx.fillStyle = '#33373f'; ctx.fillRect(-5, -5, 10, 5)
  ctx.fillStyle = a.fac === 'r' ? '#7a5642' : '#42647a'; ctx.beginPath(); ctx.arc(0, -5, 3.5, Math.PI, TAU); ctx.fill()
  ctx.translate(0, -6); ctx.rotate(a.ang)
  ctx.strokeStyle = '#5a6470'; ctx.lineWidth = 2; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(9, 0); ctx.stroke()
  ctx.restore(); ctx.globalAlpha = 1
}
// --- sky dressing draws ---
function drawMoon () {
  if (!moon) return
  const grd = ctx.createRadialGradient(moon.x, moon.y, moon.r * 0.4, moon.x, moon.y, moon.r * 2.6)
  grd.addColorStop(0, 'rgba(220,225,210,0.26)'); grd.addColorStop(1, 'rgba(220,225,210,0)')
  ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(moon.x, moon.y, moon.r * 2.6, 0, TAU); ctx.fill()
  ctx.globalAlpha = 0.5; ctx.fillStyle = '#cfd2c4'; ctx.beginPath(); ctx.arc(moon.x, moon.y, moon.r, 0, TAU); ctx.fill()
  ctx.globalAlpha = 1
}
function drawCloud (c) {
  ctx.globalAlpha = c.a; ctx.fillStyle = '#6a6470'
  ctx.beginPath(); ctx.ellipse(c.x, c.y, c.r, c.r * 0.5, 0, 0, TAU); ctx.fill()
  ctx.beginPath(); ctx.ellipse(c.x + c.r * 0.6, c.y + 2, c.r * 0.7, c.r * 0.4, 0, 0, TAU); ctx.fill()
  ctx.beginPath(); ctx.ellipse(c.x - c.r * 0.6, c.y + 2, c.r * 0.7, c.r * 0.4, 0, 0, TAU); ctx.fill()
  ctx.globalAlpha = 1
}
function drawLight (l, t) {
  const gY = H - FLOOR
  const ang = -Math.PI / 2 + Math.sin(t * l.spd + l.ph) * l.spread
  const len = H * 1.15, half = 28
  const ex = l.x + Math.cos(ang) * len, ey = gY + Math.sin(ang) * len
  const px = Math.cos(ang + Math.PI / 2), py = Math.sin(ang + Math.PI / 2)
  const grad = ctx.createLinearGradient(l.x, gY, ex, ey)
  grad.addColorStop(0, 'rgba(255,242,190,0.16)'); grad.addColorStop(1, 'rgba(255,242,190,0)')
  ctx.fillStyle = grad
  ctx.beginPath(); ctx.moveTo(l.x, gY); ctx.lineTo(ex + px * half, ey + py * half); ctx.lineTo(ex - px * half, ey - py * half); ctx.closePath(); ctx.fill()
}
function drawFar (f) {
  ctx.globalAlpha = 0.5; ctx.fillStyle = '#3a3f48'
  ctx.fillRect(f.x - 3, f.y - 0.5, 6, 1) // wings
  ctx.fillRect(f.x - 0.6, f.y - 1.6, 1.4, 3.4) // fuselage
  ctx.globalAlpha = 1
}

function draw (env, t, dt) {
  B(env)
  const gY = H - FLOOR
  // smoky war sky — deep night blue up top fading to ember glow at the horizon
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, 'rgba(26,30,46,0.40)')
  g.addColorStop(0.55, 'rgba(62,52,58,0.30)')
  g.addColorStop(1, 'rgba(120,72,46,0.26)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)

  // sky dressing (behind the skyline): moon, stars, drifting clouds, sweeping searchlights, high bombers
  drawMoon()
  for (const s of stars) { const a = s.a * (0.5 + 0.5 * Math.sin(t * 2 + s.tw)); ctx.globalAlpha = a; ctx.fillStyle = '#cfd6e0'; ctx.fillRect(s.x, s.y, 1, 1) }
  ctx.globalAlpha = 1
  for (const c of clouds) {
    c.x += c.spd * dt
    if (c.x - c.r > W) c.x = -c.r; else if (c.x + c.r < 0) c.x = W + c.r
    drawCloud(c)
  }
  for (const l of lights) drawLight(l, t)
  // far high-altitude bomber formations crossing the sky
  farTimer -= dt
  if (farTimer <= 0) {
    const dir = Math.random() < 0.5 ? 1 : -1, y = rnd(8, Math.max(16, gY * 0.32))
    for (let i = 0; i < 3; i++) farPlanes.push({ x: (dir > 0 ? -10 : W + 10) - dir * i * 13, y: y + i * 3, dir, spd: rnd(14, 22) })
    farTimer = rnd(8, 16)
  }
  for (let i = farPlanes.length - 1; i >= 0; i--) {
    const f = farPlanes[i]; f.x += f.dir * f.spd * dt
    if (f.x < -20 || f.x > W + 20) { farPlanes.splice(i, 1); continue }
    drawFar(f)
  }

  // ambient battlefield haze rising off the ground
  if (Math.random() < 0.08) smoke.push({ x: rnd(0, W), y: gY - rnd(0, 6), r: rnd(2, 4), life: 0, max: rnd(1.4, 2.6) })

  // background city skyline
  for (const b of buildings) {
    ctx.fillStyle = b.col; ctx.fillRect(b.x, gY - b.h, b.w, b.h)
    ctx.fillStyle = 'rgba(230,200,120,0.45)'
    for (const w of b.win) ctx.fillRect(b.x + w.x, gY - b.h + w.y, 2, 2.4)
  }

  // ground + craters
  ctx.fillStyle = '#3a3328'
  ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, gY)
  for (let x = 0; x <= W; x += 12) ctx.lineTo(x, gY + Math.sin(x * 0.05) * 2)
  ctx.lineTo(W, H); ctx.closePath(); ctx.fill()
  for (const c of craters) { ctx.fillStyle = '#2a251c'; ctx.beginPath(); ctx.ellipse(c.x, gY + 1, c.r, c.r * 0.4, 0, 0, TAU); ctx.fill() }

  // bomber run dropping bombs — now shootable: enough flak downs it
  if (plane) {
    if (plane.state === 'wait') {
      plane.timer -= dt
      if (plane.timer <= 0) {
        plane.state = 'cross'
        plane.fac = Math.random() < 0.5 ? 'l' : 'r' // which side this bomber belongs to
        plane.dir = plane.fac === 'l' ? 1 : -1      // takes off from its own side, heading for the enemy half
        plane.x = plane.dir > 0 ? -30 : W + 30
        plane.y = Math.max(14, gY - rnd(110, 170)); plane.spd = rnd(60, 85); plane.dropCd = rnd(0.3, 0.8)
        plane.hp = 2 + (Math.random() < 0.5 ? 1 : 0); plane.roll = 0; plane.vy = 0
      }
    } else if (plane.state === 'cross') {
      plane.x += plane.dir * plane.spd * dt; plane.dropCd -= dt
      // only drop over the enemy half: 'l' bombs the right side, 'r' bombs the left
      const overEnemy = plane.fac === 'l' ? (plane.x > W * 0.5 && plane.x < W * 0.92) : (plane.x > W * 0.08 && plane.x < W * 0.5)
      if (plane.dropCd <= 0 && overEnemy) { bombs.push({ x: plane.x, y: plane.y + 3, vx: plane.dir * plane.spd * 0.3, vy: 20 }); plane.dropCd = rnd(0.35, 0.8) }
      if (plane.x < -40 || plane.x > W + 40) { plane.state = 'wait'; plane.timer = rnd(7, 14) } else drawPlane(plane, false)
    } else { // falling — hit by flak, spiralling down on fire
      plane.vy += 120 * dt; plane.x += plane.dir * plane.spd * 0.5 * dt; plane.y += plane.vy * dt
      plane.roll += dt * 3 * plane.dir
      if (Math.random() < 0.6) smoke.push({ x: plane.x + rnd(-2, 2), y: plane.y, r: rnd(2, 4), life: 0, max: rnd(0.6, 1.2) })
      if (plane.y >= gY) { explode(plane.x, gY, rnd(16, 22), true); hurtArea(plane.x, 20, 3); plane.state = 'wait'; plane.timer = rnd(7, 14) } else drawPlane(plane, true)
    }
  }

  // self-propelled artillery raining from above
  artTimer -= dt
  if (artTimer <= 0) { shells.push({ x: rnd(W * 0.1, W * 0.9), y: -10, vx: rnd(-25, 25), vy: rnd(60, 95), trail: [] }); artTimer = rnd(1.4, 3.4) }
  for (let i = shells.length - 1; i >= 0; i--) {
    const sh = shells[i]
    sh.vy += 60 * dt; sh.x += sh.vx * dt; sh.y += sh.vy * dt
    sh.trail.push({ x: sh.x, y: sh.y }); if (sh.trail.length > 8) sh.trail.shift()
    if (sh.y >= gY) { explode(sh.x, gY, rnd(9, 14), true); hurtArea(sh.x, 13, 2); shells.splice(i, 1); continue }
    drawShell(sh)
  }

  // bombs falling
  for (let i = bombs.length - 1; i >= 0; i--) {
    const b = bombs[i]
    b.vy += 140 * dt; b.x += b.vx * dt; b.y += b.vy * dt
    if (b.y >= gY) { explode(b.x, gY, rnd(13, 18), true); hurtArea(b.x, 16, 3); bombs.splice(i, 1); continue }
    drawBomb(b)
  }

  // units patrol + fire (dead ones lie as wreckage, then respawn)
  for (const u of units) {
    if (u.dead) { u.respawn -= dt; if (u.respawn <= 0) { u.dead = false; u.hp = u.maxHp; u.flash = 0 } continue }
    if (u.flash > 0) u.flash -= dt
    u.x = u.baseX + Math.sin(t * u.wspd + u.ph) * u.range
    u.cd -= dt
    if (u.cd <= 0) {
      const dirx = u.face
      const my = gY - (u.type === 'tank' ? 11 : u.type === 'robot' ? 11 : 9)
      const mx = u.x + dirx * (u.type === 'tank' ? 14 : 8)
      const spd = u.type === 'tank' ? 160 : 240
      tracers.push({ x: mx, y: my, vx: dirx * spd, vy: rnd(-12, 4), col: u.tracer, fac: u.fac, life: 1.2, big: u.type === 'tank' })
      booms.push({ x: mx, y: my, t: 0, max: 0.12, r0: u.type === 'tank' ? 4 : 2 }) // muzzle flash
      u.cd = u.type === 'tank' ? rnd(1.6, 2.8) : u.type === 'soldier' ? rnd(0.5, 1.2) : rnd(0.9, 1.8)
    }
  }

  // anti-air guns track the bomber and throw up flak
  for (const a of aa) {
    // only fire on an enemy bomber; a friendly plane flies over untouched
    const target = (plane && plane.state === 'cross' && plane.fac !== a.fac) ? plane : null
    const py = gY - 6
    a.ang = target ? Math.atan2(target.y - py, target.x - a.x) : -Math.PI / 2
    if (target) {
      a.cd -= dt
      if (a.cd <= 0) {
        const sp = rnd(170, 210)
        // lead the bomber: estimate the shell's time-of-flight and aim where the
        // plane WILL be (a couple of iterations converge), then spread the shot so
        // it isn't a guaranteed hit — farther targets are aimed less accurately.
        let tof = Math.hypot(target.x - a.x, target.y - py) / sp
        for (let k = 0; k < 2; k++) tof = Math.hypot((target.x + target.dir * target.spd * tof) - a.x, target.y - py) / sp
        const spread = 14 + Math.hypot(target.x - a.x, target.y - py) * 0.12
        const drop = 0.5 * 30 * tof * tof // compensate gravity on the shell
        const aimX = target.x + target.dir * target.spd * tof + rnd(-spread, spread)
        const aimY = target.y - drop + rnd(-spread * 0.5, spread * 0.5)
        const ang = Math.atan2(aimY - py, aimX - a.x)
        flak.push({ x: a.x, y: py, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: rnd(0.7, 1.15) })
        booms.push({ x: a.x, y: py - 1, t: 0, max: 0.1, r0: 3 })
        a.cd = rnd(0.22, 0.5)
      }
    }
  }
  // flak shells -> airburst near the plane or when fuse runs out; a near burst chips the plane's hp and eventually downs it
  for (let i = flak.length - 1; i >= 0; i--) {
    const f = flak[i]
    f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 30 * dt; f.life -= dt
    const near = plane && plane.state === 'cross' && Math.hypot(plane.x - f.x, plane.y - f.y) < 16
    if (f.life <= 0 || near || f.y < -6) {
      explode(f.x, f.y, rnd(3, 6), false)
      if (near) { plane.hp -= 1; if (plane.hp <= 0) { plane.state = 'falling'; plane.vy = 20 } }
      flak.splice(i, 1); continue
    }
    ctx.globalAlpha = 0.9; ctx.fillStyle = '#ffd36a'; ctx.beginPath(); ctx.arc(f.x, f.y, 1.6, 0, TAU); ctx.fill(); ctx.globalAlpha = 1
  }

  // tracers — now do damage; enemies take hits and die
  for (let i = tracers.length - 1; i >= 0; i--) {
    const tr = tracers[i]
    tr.x += tr.vx * dt; tr.y += tr.vy * dt; tr.vy += 20 * dt; tr.life -= dt
    let hit = false
    for (const u of units) {
      if (u.fac === tr.fac || u.dead) continue
      if (Math.abs(u.x - tr.x) < 5 && Math.abs((gY - 8) - tr.y) < 8) { explode(tr.x, tr.y, rnd(2, 4), false); hurt(u, 1); hit = true; break }
    }
    if (hit || tr.life <= 0 || tr.x < -10 || tr.x > W + 10 || tr.y > gY + 2) { tracers.splice(i, 1); continue }
    drawTracer(tr)
  }

  // debris
  for (let i = debris.length - 1; i >= 0; i--) {
    const d = debris[i]
    d.vy += 120 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.life += dt
    if (d.life >= d.max || d.y > gY + 2) { debris.splice(i, 1); continue }
    ctx.globalAlpha = Math.max(0, 1 - d.life / d.max); ctx.fillStyle = '#3a3328'; ctx.fillRect(d.x - 1, d.y - 1, 2, 2); ctx.globalAlpha = 1
  }

  // smoke
  for (let i = smoke.length - 1; i >= 0; i--) {
    const p = smoke[i]; p.life += dt
    if (p.life >= p.max) { smoke.splice(i, 1); continue }
    const k = p.life / p.max
    ctx.globalAlpha = (1 - k) * 0.4; ctx.fillStyle = '#7a7068'
    ctx.beginPath(); ctx.arc(p.x, p.y - k * 10, p.r * (1 + k * 1.8), 0, TAU); ctx.fill()
    ctx.globalAlpha = 1
  }

  // explosions
  for (let i = booms.length - 1; i >= 0; i--) {
    const e = booms[i]; e.t += dt
    if (e.t >= e.max) { booms.splice(i, 1); continue }
    drawBoom(e)
  }

  // units (or their wreckage) + a white hit-flash + AA guns on top
  for (const u of units) {
    if (u.dead) { drawWreck(u); continue }
    ;(u.type === 'tank' ? drawTank : u.type === 'robot' ? drawRobot : drawSoldier)(u, t)
    if (u.flash > 0) { ctx.globalAlpha = Math.min(0.6, u.flash * 4); ctx.fillStyle = '#fff'; ctx.fillRect(u.x - 4, gY - 14, 8, 12); ctx.globalAlpha = 1 }
  }
  for (const a of aa) drawAA(a)
}

registerTheme({ key: 'battle', emoji: '🤖', title: 'Battlefield', order: 5, seed, draw })
