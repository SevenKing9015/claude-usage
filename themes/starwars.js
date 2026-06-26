// Auto-generated theme pack.
// Contract: registerTheme({ key, emoji, title, order?, seed(env), draw(env, t, dt) })
// env = { ctx, W, H, rnd, pick }. Keep per-theme state in module scope.
let ctx, W, H, rnd, pick
function B (e) { ctx = e.ctx; W = e.W; H = e.H; rnd = e.rnd; pick = e.pick }

// --- state ---
let stars = [], ships = [], bolts = [], missiles = [], booms = [], mTimer = 0
let capitals = [], smoke = []

const TAU = 6.2832
const angNorm = a => Math.atan2(Math.sin(a), Math.cos(a))

function seed (env) {
  B(env)
  stars = Array.from({ length: 44 }, () => ({ x: rnd(0, W), y: rnd(0, H), r: rnd(0.4, 1.3), ph: rnd(0, TAU), tw: rnd(1.5, 3.5) }))
  const mk = fac => ({ fac, x: rnd(0, W), y: rnd(0, H), ang: rnd(0, TAU), spd: fac === 'reb' ? rnd(56, 72) : rnd(50, 66), cd: rnd(0.3, 1.2), wob: rnd(0, TAU) })
  ships = [mk('reb'), mk('reb'), mk('emp'), mk('emp')]
  bolts = []; missiles = []; booms = []; smoke = []
  mTimer = rnd(2, 5)
  capitals = [
    { side: 'imp', fac: 'emp', dir: 1, state: 'wait', timer: rnd(3, 8), x: -999, y: 0, spd: 10 },
    { side: 'reb', fac: 'reb', dir: -1, state: 'wait', timer: rnd(8, 14), x: -999, y: 0, spd: 10 }
  ]
}

// --- helpers ---
function nearestEnemy (s) {
  let best = null, bd = 1e9
  for (const o of ships) {
    if (o.fac === s.fac || o.dead || o.depart || o.launching) continue
    const dx = o.x - s.x, dy = o.y - s.y, d = dx * dx + dy * dy
    if (d < bd) { bd = d; best = o }
  }
  return best
}
function killShip (s) {
  if (s.dead) return
  s.dead = true; s.deadT = 0; s.deadDur = rnd(1.8, 2.6)
  s.vx = Math.cos(s.ang) * s.spd * 0.5 + rnd(-12, 12)
  s.vy = Math.sin(s.ang) * s.spd * 0.5 + 18 // tumble downward
  s.spin = rnd(-4, 4)
  booms.push(boom(s.x, s.y, rnd(10, 14)))
}
function respawn (s) {
  s.dead = false; s.cd = rnd(0.3, 1.0); s.ang = rnd(0, TAU)
  if (Math.random() < 0.5) { s.x = Math.random() < 0.5 ? -16 : W + 16; s.y = rnd(0, H) }
  else { s.x = rnd(0, W); s.y = Math.random() < 0.5 ? -16 : H + 16 }
}
function wrap (s) {
  const m = 16
  if (s.x < -m) s.x = W + m; if (s.x > W + m) s.x = -m
  if (s.y < -m) s.y = H + m; if (s.y > H + m) s.y = -m
}
function launchFighter (cap) {
  // stern (rear) is opposite the travel direction
  const sx = cap.x - cap.dir * W * 0.55 * 0.5, sy = cap.y
  const aimx = rnd(W * 0.2, W * 0.8), aimy = rnd(H * 0.5, H * 0.85)
  ships.push({
    fac: cap.fac, x: sx, y: sy, ang: Math.atan2(aimy - sy, aimx - sx),
    spd: rnd(54, 66), cd: rnd(0.3, 0.9), wob: rnd(0, TAU), temp: true, ttl: rnd(9, 15), depart: false,
    launching: true, scale: 0.12 // grows small -> full before it joins the fight
  })
}
function fire (s, ang, col) {
  const BSPD = 210, nose = 10
  bolts.push({ x: s.x + Math.cos(ang) * nose, y: s.y + Math.sin(ang) * nose, vx: Math.cos(ang) * BSPD, vy: Math.sin(ang) * BSPD, col, fac: s.fac, life: 1.6 })
}
function boom (x, y, r0) { return { x, y, t: 0, max: rnd(0.4, 0.7), r0 } }

// --- draw bits ---
function drawXwing (s) {
  ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.ang); if (s.scale) ctx.scale(s.scale, s.scale); ctx.globalAlpha = 0.95
  // S-foils: four prongs fanning back
  ctx.strokeStyle = '#9aa0ad'; ctx.lineWidth = 1.4; ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(-3, 0); ctx.lineTo(-11, -7)
  ctx.moveTo(-3, 0); ctx.lineTo(-11, 7)
  ctx.moveTo(-3, 0); ctx.lineTo(-11, -4)
  ctx.moveTo(-3, 0); ctx.lineTo(-11, 4)
  ctx.stroke()
  ctx.fillStyle = '#d6504a'
  ctx.beginPath(); ctx.arc(-11, -7, 1, 0, TAU); ctx.arc(-11, 7, 1, 0, TAU); ctx.fill()
  // fuselage
  ctx.fillStyle = '#c8ccd4'
  ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(-4, -3); ctx.lineTo(-4, 3); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#d6504a'; ctx.fillRect(4, -2.6, 1.4, 5.2)
  ctx.fillStyle = '#3a6a8c'; ctx.beginPath(); ctx.arc(2.5, 0, 1.6, 0, TAU); ctx.fill()
  ctx.restore(); ctx.globalAlpha = 1
}
function drawTie (s) {
  ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.ang); if (s.scale) ctx.scale(s.scale, s.scale); ctx.globalAlpha = 0.95
  ctx.strokeStyle = '#3a3e47'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(0, -8); ctx.moveTo(0, 2); ctx.lineTo(0, 8); ctx.stroke()
  ctx.fillStyle = '#4a4e57'
  for (const py of [-9, 9]) {
    ctx.save(); ctx.translate(0, py)
    ctx.beginPath(); ctx.moveTo(-4, -3); ctx.lineTo(4, -3); ctx.lineTo(5, 0); ctx.lineTo(4, 3); ctx.lineTo(-4, 3); ctx.lineTo(-5, 0); ctx.closePath(); ctx.fill()
    ctx.restore()
  }
  ctx.fillStyle = '#5a5f69'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, TAU); ctx.fill()
  ctx.fillStyle = '#23262c'; ctx.beginPath(); ctx.arc(0, 0, 2, 0, TAU); ctx.fill()
  ctx.restore(); ctx.globalAlpha = 1
}
function drawBolt (b) {
  const a = Math.atan2(b.vy, b.vx), len = 6
  ctx.globalAlpha = 0.9; ctx.strokeStyle = b.col; ctx.lineWidth = 2; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - Math.cos(a) * len, b.y - Math.sin(a) * len); ctx.stroke()
  ctx.globalAlpha = 1
}
function drawMissile (m) {
  for (let i = 0; i < m.trail.length; i++) {
    const p = m.trail[i], k = i / m.trail.length
    ctx.fillStyle = 'rgba(200,200,210,' + (k * 0.5).toFixed(2) + ')'
    ctx.beginPath(); ctx.arc(p.x, p.y, 1.4 * (k + 0.3), 0, TAU); ctx.fill()
  }
  ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.ang)
  ctx.fillStyle = '#d9d9e0'; ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(-3, -2); ctx.lineTo(-3, 2); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#d6504a'; ctx.beginPath(); ctx.arc(5, 0, 1, 0, TAU); ctx.fill()
  ctx.restore()
}
function drawBoom (e) {
  const k = e.t / e.max, r = e.r0 * (0.4 + k * 1.6), a = 1 - k
  ctx.globalAlpha = a
  ctx.fillStyle = '#ffd36a'; ctx.beginPath(); ctx.arc(e.x, e.y, r * 0.6, 0, TAU); ctx.fill()
  ctx.fillStyle = 'rgba(230,120,40,' + a.toFixed(2) + ')'; ctx.beginPath(); ctx.arc(e.x, e.y, r, 0, TAU); ctx.fill()
  ctx.strokeStyle = 'rgba(255,200,120,' + a.toFixed(2) + ')'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(e.x, e.y, r * 1.2, 0, TAU); ctx.stroke()
  ctx.globalAlpha = 1
}
function drawCapital (c, t) {
  ctx.save(); ctx.translate(c.x, c.y); ctx.scale(c.dir, 1); ctx.globalAlpha = 0.62 // flip to face travel direction
  if (c.side === 'reb') drawMonCal(t); else drawDestroyer(t)
  ctx.restore(); ctx.globalAlpha = 1
}
function drawDestroyer (t) {
  const L = W * 0.55, Hh = L * 0.2
  ctx.fillStyle = '#384154'
  ctx.beginPath(); ctx.moveTo(L * 0.5, 0); ctx.lineTo(-L * 0.5, -Hh * 0.5); ctx.lineTo(-L * 0.5, Hh * 0.5); ctx.closePath(); ctx.fill()
  ctx.strokeStyle = 'rgba(150,160,185,0.45)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(L * 0.45, 0); ctx.lineTo(-L * 0.5, 0); ctx.stroke()
  for (let i = -3; i <= 0; i++) { ctx.beginPath(); ctx.moveTo(L * 0.5 + i * L * 0.13, 0); ctx.lineTo(-L * 0.5, (i + 2) * Hh * 0.12); ctx.stroke() }
  ctx.fillStyle = '#464d5e'; ctx.fillRect(-L * 0.44, -Hh * 0.5 - 5, 11, 5)
  ctx.fillStyle = '#6a7080'; ctx.fillRect(-L * 0.42, -Hh * 0.5 - 8, 5, 3)
  ctx.fillStyle = 'rgba(120,170,255,0.7)'
  for (const ey of [-Hh * 0.28, 0, Hh * 0.28]) { ctx.beginPath(); ctx.arc(-L * 0.5, ey, 1.6, 0, TAU); ctx.fill() }
  const baseA = ctx.globalAlpha; ctx.globalAlpha = 1
  for (let i = 0; i < 5; i++) {
    const lx = L * 0.34 - i * L * 0.17
    const blink = 0.18 + 0.82 * (0.5 + 0.5 * Math.sin(t * 1.5 + i * 1.1))
    ctx.fillStyle = 'rgba(235,60,55,' + blink.toFixed(2) + ')'
    ctx.beginPath(); ctx.arc(lx, -1, 1.4, 0, TAU); ctx.fill()
  }
  ctx.globalAlpha = baseA
}
function drawMonCal (t) {
  const L = W * 0.5, Hh = L * 0.26
  // rounded organic hull, lighter tan-grey (Mon Calamari cruiser)
  ctx.fillStyle = '#7c7468'
  ctx.beginPath()
  ctx.moveTo(L * 0.5, 0)
  ctx.quadraticCurveTo(L * 0.25, -Hh * 0.5, -L * 0.15, -Hh * 0.42)
  ctx.quadraticCurveTo(-L * 0.5, -Hh * 0.22, -L * 0.5, 0)
  ctx.quadraticCurveTo(-L * 0.5, Hh * 0.22, -L * 0.15, Hh * 0.42)
  ctx.quadraticCurveTo(L * 0.25, Hh * 0.5, L * 0.5, 0)
  ctx.fill()
  // dorsal bulges + a hull line
  ctx.fillStyle = '#938a7c'
  ctx.beginPath(); ctx.ellipse(-L * 0.06, -Hh * 0.16, L * 0.24, Hh * 0.2, 0, 0, TAU); ctx.fill()
  ctx.beginPath(); ctx.ellipse(L * 0.22, -Hh * 0.05, L * 0.1, Hh * 0.14, 0, 0, TAU); ctx.fill()
  ctx.strokeStyle = 'rgba(60,55,48,0.4)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(L * 0.45, 0); ctx.lineTo(-L * 0.45, 0); ctx.stroke()
  // engine glow at the stern
  ctx.fillStyle = 'rgba(140,210,170,0.7)'
  for (const ey of [-Hh * 0.18, 0, Hh * 0.18]) { ctx.beginPath(); ctx.arc(-L * 0.5, ey, 1.5, 0, TAU); ctx.fill() }
  // slow-blinking amber running lights
  const baseA = ctx.globalAlpha; ctx.globalAlpha = 1
  for (let i = 0; i < 4; i++) {
    const lx = L * 0.3 - i * L * 0.18
    const blink = 0.18 + 0.82 * (0.5 + 0.5 * Math.sin(t * 1.4 + i * 1.2))
    ctx.fillStyle = 'rgba(240,180,70,' + blink.toFixed(2) + ')'
    ctx.beginPath(); ctx.arc(lx, -Hh * 0.34, 1.3, 0, TAU); ctx.fill()
  }
  ctx.globalAlpha = baseA
}
function updateCapital (cap, t, dt) {
  if (cap.state === 'wait') {
    cap.timer -= dt
    if (cap.timer <= 0) {
      cap.state = 'cross'
      cap.x = cap.dir > 0 ? -W * 0.4 : W + W * 0.4
      cap.y = rnd(H * 0.15, H * 0.45); cap.spd = rnd(8, 14)
      const n = 3 + Math.floor(Math.random() * 2) // 3-4 fighters
      cap.launchAt = []
      for (let k = 0; k < n; k++) { const frac = 0.40 + 0.45 * (k / (n - 1 || 1)); cap.launchAt.push(cap.dir > 0 ? W * frac : W * (1 - frac)) }
      cap.launchIdx = 0
    }
  } else {
    cap.x += cap.dir * cap.spd * dt
    while (cap.launchIdx < cap.launchAt.length && (cap.dir > 0 ? cap.x >= cap.launchAt[cap.launchIdx] : cap.x <= cap.launchAt[cap.launchIdx])) {
      if (ships.filter(s => s.temp).length < 5) launchFighter(cap)
      cap.launchIdx++
    }
    if (cap.dir > 0 ? cap.x > W + W * 0.4 : cap.x < -W * 0.4) { cap.state = 'wait'; cap.timer = rnd(10, 18) }
    else drawCapital(cap, t)
  }
}

function draw (env, t, dt) {
  B(env)
  // deep space
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, 'rgba(8,10,28,0.36)')
  g.addColorStop(1, 'rgba(22,14,40,0.24)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
  for (const st of stars) {
    const a = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t * st.tw + st.ph))
    ctx.fillStyle = 'rgba(255,255,255,' + a.toFixed(2) + ')'
    ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, TAU); ctx.fill()
  }

  // easter egg: capital ships cruise past — Imperial Star Destroyer (L->R) launches TIEs,
  // Rebel Mon Calamari cruiser (R->L) launches X-wings; each fighter emerges from the stern
  for (const cap of capitals) updateCapital(cap, t, dt)

  // drifting smoke from downed ships
  for (let i = smoke.length - 1; i >= 0; i--) {
    const p = smoke[i]; p.life += dt
    if (p.life >= p.max) { smoke.splice(i, 1); continue }
    const k = p.life / p.max
    ctx.globalAlpha = (1 - k) * 0.5; ctx.fillStyle = '#9aa0ad'
    ctx.beginPath(); ctx.arc(p.x, p.y - k * 6, p.r * (1 + k * 1.6), 0, TAU); ctx.fill()
    ctx.globalAlpha = 1
  }

  // fly + fight
  for (let i = ships.length - 1; i >= 0; i--) {
    const s = ships[i]
    if (s.dead) {
      s.deadT += dt; s.vy += 30 * dt
      s.x += s.vx * dt; s.y += s.vy * dt; s.ang += s.spin * dt
      if (Math.random() < 0.5) smoke.push({ x: s.x + rnd(-3, 3), y: s.y + rnd(-3, 3), r: rnd(2, 4), life: 0, max: rnd(0.6, 1.2) })
      if (Math.random() < 0.04) booms.push(boom(s.x + rnd(-5, 5), s.y + rnd(-5, 5), rnd(4, 7)))
      if (s.deadT > s.deadDur) {
        // final blast instead of just vanishing
        for (let k = 0; k < 3; k++) booms.push(boom(s.x + rnd(-6, 6), s.y + rnd(-6, 6), rnd(9, 15)))
        for (let k = 0; k < 4; k++) smoke.push({ x: s.x + rnd(-5, 5), y: s.y + rnd(-5, 5), r: rnd(3, 5), life: 0, max: rnd(0.8, 1.5) })
        if (s.temp) ships.splice(i, 1); else respawn(s)
      }
      continue
    }
    // emerging from the carrier stern: grow small -> full, then join the fight
    if (s.launching) {
      s.scale += dt * 0.9
      s.x += Math.cos(s.ang) * s.spd * 0.4 * dt
      s.y += Math.sin(s.ang) * s.spd * 0.4 * dt
      if (s.scale >= 1) { s.scale = 1; s.launching = false }
      continue
    }
    // carrier-launched fighters fight for a while, then peel off and despawn
    if (s.temp) {
      if (!s.depart) { s.ttl -= dt; if (s.ttl <= 0) s.depart = true }
      else {
        const want = s.x < W / 2 ? Math.PI : 0
        s.ang += Math.max(-2.6 * dt, Math.min(2.6 * dt, angNorm(want - s.ang)))
        s.x += Math.cos(s.ang) * s.spd * dt; s.y += Math.sin(s.ang) * s.spd * dt
        if (s.x < -24 || s.x > W + 24) ships.splice(i, 1)
        continue
      }
    }
    const e = nearestEnemy(s)
    let desired = s.ang
    if (e) {
      const to = Math.atan2(e.y - s.y, e.x - s.x)
      desired = s.fac === 'reb' ? to : to + Math.PI // rebels chase, empire flees
    }
    desired += Math.sin(t * 2 + s.wob) * 0.5 // weave / dodge
    const turn = 2.6 * dt
    s.ang += Math.max(-turn, Math.min(turn, angNorm(desired - s.ang)))
    s.x += Math.cos(s.ang) * s.spd * dt
    s.y += Math.sin(s.ang) * s.spd * dt
    wrap(s)
    s.cd -= dt
    if (e && s.cd <= 0) {
      const dx = e.x - s.x, dy = e.y - s.y, dist = Math.hypot(dx, dy)
      if (s.fac === 'reb') {
        const ad = Math.abs(angNorm(Math.atan2(dy, dx) - s.ang))
        if (ad < 0.35 && dist < W * 0.85) { fire(s, s.ang, '#d6504a'); s.cd = rnd(0.5, 1.1) } else s.cd = rnd(0.2, 0.5)
      } else {
        if (dist < W * 0.5 && Math.random() < 0.6) { fire(s, s.ang + Math.PI, '#5fe07a'); s.cd = rnd(0.6, 1.3) } else s.cd = rnd(0.3, 0.7)
      }
    }
  }

  // homing missiles (a rebel locks a TIE every few seconds)
  mTimer -= dt
  if (mTimer <= 0) {
    const rebs = ships.filter(s => s.fac === 'reb')
    const r = rebs.length ? pick(rebs) : null
    const tgt = r ? nearestEnemy(r) : null
    if (r && tgt) missiles.push({ x: r.x, y: r.y, ang: r.ang, spd: 95, target: tgt, trail: [], life: 3.5 })
    mTimer = rnd(3.5, 6.5)
  }
  for (let i = missiles.length - 1; i >= 0; i--) {
    const m = missiles[i], tgt = m.target
    if (tgt) m.ang += Math.max(-3 * dt, Math.min(3 * dt, angNorm(Math.atan2(tgt.y - m.y, tgt.x - m.x) - m.ang)))
    m.x += Math.cos(m.ang) * m.spd * dt; m.y += Math.sin(m.ang) * m.spd * dt; m.life -= dt
    m.trail.push({ x: m.x, y: m.y }); if (m.trail.length > 10) m.trail.shift()
    const hit = tgt && !tgt.dead && Math.hypot(tgt.x - m.x, tgt.y - m.y) < 10
    if (hit) { killShip(tgt); booms.push(boom(m.x + rnd(-4, 4), m.y + rnd(-4, 4), rnd(6, 10))) }
    if (hit || m.life <= 0) { missiles.splice(i, 1); continue }
    drawMissile(m)
  }

  // laser bolts
  for (let i = bolts.length - 1; i >= 0; i--) {
    const b = bolts[i]
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt
    let hit = false
    for (const o of ships) {
      if (o.fac === b.fac || o.dead || o.launching) continue
      if (Math.hypot(o.x - b.x, o.y - b.y) < 7) { killShip(o); hit = true; break }
    }
    if (hit || b.life <= 0 || b.x < -10 || b.x > W + 10 || b.y < -10 || b.y > H + 10) { bolts.splice(i, 1); continue }
    drawBolt(b)
  }

  // explosions
  for (let i = booms.length - 1; i >= 0; i--) {
    const e = booms[i]; e.t += dt
    if (e.t >= e.max) { booms.splice(i, 1); continue }
    drawBoom(e)
  }

  // ships on top
  for (const s of ships) (s.fac === 'reb' ? drawXwing : drawTie)(s)
}

registerTheme({ key: 'starwars', emoji: '🚀', title: 'Star Wars', order: 4, seed, draw })
