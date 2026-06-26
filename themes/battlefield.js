// Auto-generated theme pack.
// Contract: registerTheme({ key, emoji, title, order?, seed(env), draw(env, t, dt) })
// env = { ctx, W, H, rnd, pick }. Keep per-theme state in module scope.
let ctx, W, H, rnd, pick
function B (e) { ctx = e.ctx; W = e.W; H = e.H; rnd = e.rnd; pick = e.pick }

const TAU = 6.2832
const FLOOR = 14 // dirt band height; ground surface = H - FLOOR

// --- state ---
let units = [], tracers = [], bombs = [], shells = [], booms = [], smoke = [], debris = [], craters = []
let buildings = [], aa = [], flak = []
let plane = null, artTimer = 0

function seed (env) {
  B(env)
  const mk = (fac, type, baseX) => ({
    fac, type, baseX, x: baseX, ph: rnd(0, TAU), wspd: rnd(0.4, 0.9), range: rnd(6, 16),
    face: fac === 'l' ? 1 : -1, cd: rnd(0.4, 1.4),
    col: fac === 'l' ? '#5f7a8c' : '#8c6b5a',
    dark: fac === 'l' ? '#3f5566' : '#5e4639',
    tracer: fac === 'l' ? '#6fd0e0' : '#e0a04a'
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
  plane = { state: 'wait', timer: rnd(3, 7), x: 0, y: 0, dir: 1, spd: 70, dropCd: 0 }
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
  // anti-air emplacements that track the bomber
  aa = [
    { x: rnd(W * 0.20, W * 0.30), ang: -Math.PI / 2, cd: rnd(0.4, 1) },
    { x: rnd(W * 0.70, W * 0.80), ang: -Math.PI / 2, cd: rnd(0.4, 1) }
  ]
  flak = []
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
function drawPlane (p) {
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.dir, 1); ctx.globalAlpha = 0.95
  ctx.fillStyle = '#56606e'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 3, 0, 0, TAU); ctx.fill()
  ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-13, -4); ctx.lineTo(-8, -0.5); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#444c58'; ctx.beginPath(); ctx.moveTo(-1, 1); ctx.lineTo(-6, 7); ctx.lineTo(2, 2); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#8fb6d6'; ctx.beginPath(); ctx.arc(6, -0.6, 1.6, 0, TAU); ctx.fill()
  ctx.restore(); ctx.globalAlpha = 1
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
  ctx.fillStyle = '#444c58'; ctx.beginPath(); ctx.arc(0, -5, 3.5, Math.PI, TAU); ctx.fill()
  ctx.translate(0, -6); ctx.rotate(a.ang)
  ctx.strokeStyle = '#5a6470'; ctx.lineWidth = 2; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(9, 0); ctx.stroke()
  ctx.restore(); ctx.globalAlpha = 1
}

function draw (env, t, dt) {
  B(env)
  const gY = H - FLOOR
  // smoky war sky
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, 'rgba(60,52,58,0.32)')
  g.addColorStop(1, 'rgba(95,72,55,0.20)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
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

  // bomber run dropping bombs
  if (plane) {
    if (plane.state === 'wait') {
      plane.timer -= dt
      if (plane.timer <= 0) { plane.state = 'cross'; plane.dir = Math.random() < 0.5 ? 1 : -1; plane.x = plane.dir > 0 ? -30 : W + 30; plane.y = Math.max(14, gY - rnd(110, 170)); plane.spd = rnd(60, 85); plane.dropCd = rnd(0.3, 0.8) }
    } else {
      plane.x += plane.dir * plane.spd * dt; plane.dropCd -= dt
      if (plane.dropCd <= 0 && plane.x > W * 0.12 && plane.x < W * 0.88) { bombs.push({ x: plane.x, y: plane.y + 3, vx: plane.dir * plane.spd * 0.3, vy: 20 }); plane.dropCd = rnd(0.35, 0.8) }
      if (plane.x < -40 || plane.x > W + 40) { plane.state = 'wait'; plane.timer = rnd(7, 14) } else drawPlane(plane)
    }
  }

  // self-propelled artillery raining from above
  artTimer -= dt
  if (artTimer <= 0) { shells.push({ x: rnd(W * 0.1, W * 0.9), y: -10, vx: rnd(-25, 25), vy: rnd(60, 95), trail: [] }); artTimer = rnd(1.4, 3.4) }
  for (let i = shells.length - 1; i >= 0; i--) {
    const sh = shells[i]
    sh.vy += 60 * dt; sh.x += sh.vx * dt; sh.y += sh.vy * dt
    sh.trail.push({ x: sh.x, y: sh.y }); if (sh.trail.length > 8) sh.trail.shift()
    if (sh.y >= gY) { explode(sh.x, gY, rnd(9, 14), true); shells.splice(i, 1); continue }
    drawShell(sh)
  }

  // bombs falling
  for (let i = bombs.length - 1; i >= 0; i--) {
    const b = bombs[i]
    b.vy += 140 * dt; b.x += b.vx * dt; b.y += b.vy * dt
    if (b.y >= gY) { explode(b.x, gY, rnd(13, 18), true); bombs.splice(i, 1); continue }
    drawBomb(b)
  }

  // units patrol + fire
  for (const u of units) {
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
    const target = (plane && plane.state === 'cross') ? plane : null
    const py = gY - 6
    a.ang = target ? Math.atan2(target.y - py, target.x - a.x) : -Math.PI / 2
    if (target) {
      a.cd -= dt
      if (a.cd <= 0) {
        const sp = rnd(170, 210)
        flak.push({ x: a.x, y: py, vx: Math.cos(a.ang) * sp, vy: Math.sin(a.ang) * sp, life: rnd(0.7, 1.15) })
        booms.push({ x: a.x, y: py - 1, t: 0, max: 0.1, r0: 3 })
        a.cd = rnd(0.5, 1.1)
      }
    }
  }
  // flak shells -> airburst near the plane or when fuse runs out
  for (let i = flak.length - 1; i >= 0; i--) {
    const f = flak[i]
    f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 30 * dt; f.life -= dt
    const near = plane && plane.state === 'cross' && Math.hypot(plane.x - f.x, plane.y - f.y) < 14
    if (f.life <= 0 || near || f.y < -6) { explode(f.x, f.y, rnd(3, 6), false); flak.splice(i, 1); continue }
    ctx.globalAlpha = 0.9; ctx.fillStyle = '#ffd36a'; ctx.beginPath(); ctx.arc(f.x, f.y, 1.6, 0, TAU); ctx.fill(); ctx.globalAlpha = 1
  }

  // tracers
  for (let i = tracers.length - 1; i >= 0; i--) {
    const tr = tracers[i]
    tr.x += tr.vx * dt; tr.y += tr.vy * dt; tr.vy += 20 * dt; tr.life -= dt
    let hit = false
    for (const u of units) {
      if (u.fac === tr.fac) continue
      if (Math.abs(u.x - tr.x) < 5 && Math.abs((gY - 8) - tr.y) < 8) { explode(tr.x, tr.y, rnd(2, 4), false); hit = true; break }
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

  // units + AA guns on top
  for (const u of units) (u.type === 'tank' ? drawTank : u.type === 'robot' ? drawRobot : drawSoldier)(u, t)
  for (const a of aa) drawAA(a)
}

registerTheme({ key: 'battle', emoji: '🤖', title: 'Battlefield', order: 5, seed, draw })
