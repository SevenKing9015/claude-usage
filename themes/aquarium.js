// Auto-generated theme pack.
// Contract: registerTheme({ key, emoji, title, order?, seed(env), draw(env, t, dt) })
// env = { ctx, W, H, rnd, pick }. Keep per-theme state in module scope.
let ctx, W, H, rnd, pick
function B (e) { ctx = e.ctx; W = e.W; H = e.H; rnd = e.rnd; pick = e.pick }

    let fish = [], bubbles = [], weeds = [], rocks = [], crab = null
    let school = null, starfish = null, hermit = null
    function seed (env) {
      B(env)
      const TYPES = ['clown', 'tang', 'guppy', 'puffer', 'angel', 'jelly']
      const colorFor = type => {
        if (type === 'clown') return '#d97757'
        if (type === 'tang') return '#5fb0c9'
        if (type === 'puffer') return '#e0a04a'
        if (type === 'angel') return '#cfd2da'
        if (type === 'jelly') return '#c9879b'
        return ['#e0a04a', '#c9879b', '#6fc98a', '#d97757'][Math.floor(Math.random() * 4)]
      }
      fish = Array.from({ length: 4 }, (_, i) => {
        const type = i === 0 ? 'clown' : TYPES[Math.floor(Math.random() * TYPES.length)]
        const scale = type === 'puffer' ? 1.1 : type === 'angel' ? 1.05 : 1
        return {
          type,
          x: rnd(0, W), y: rnd(18, Math.max(36, H - 26)),
          len: rnd(12, 20) * scale, dir: Math.random() < 0.5 ? -1 : 1,
          spd: rnd(8, 20) * (type === 'jelly' ? 0.6 : 1), col: colorFor(type),
          wob: rnd(0, 6.28), wobSpd: rnd(2.5, 4.5), drift: rnd(0, 6.28)
        }
      })
      bubbles = Array.from({ length: 14 }, () => ({
        x: rnd(0, W), y: rnd(0, H), r: rnd(0.8, 2.4), spd: rnd(10, 26)
      }))
      weeds = Array.from({ length: 5 }, () => ({
        x: rnd(8, W - 8), h: rnd(18, 40), w: rnd(3, 5),
        ph: rnd(0, 6.28), col: Math.random() < 0.5 ? '#2f6d52' : '#3a7d63'
      }))
      rocks = Array.from({ length: 4 }, () => ({
        x: rnd(8, W - 8), w: rnd(11, 22), h: rnd(4, 8),
        col: Math.random() < 0.5 ? '#3a3a40' : '#4a4640'
      }))
      crab = { x: rnd(20, Math.max(24, W - 20)), dir: Math.random() < 0.5 ? -1 : 1, spd: rnd(6, 11), leg: 0, pause: 0 }

      const syMax = Math.max(40, H * 0.6)
      school = {
        x: rnd(0, W), y: rnd(25, syMax), dir: Math.random() < 0.5 ? -1 : 1, spd: rnd(14, 22),
        col: ['#9fb8c4', '#cfd2da', '#e0a04a'][Math.floor(Math.random() * 3)], bob: rnd(0, 6.28),
        members: Array.from({ length: 6 }, () => ({ ox: rnd(-14, 14), oy: rnd(-8, 8), ph: rnd(0, 6.28) }))
      }
      // starfish crawls very slowly along the sand; hermit lives in the last rock
      starfish = {
        x: rnd(10, Math.max(14, W - 10)), y: H - 9, r: rnd(5, 7),
        col: Math.random() < 0.5 ? '#d97757' : '#c9879b', rot: rnd(0, 6.28),
        dir: Math.random() < 0.5 ? -1 : 1, spd: rnd(1, 2)
      }
      const hr = rocks.length - 1
      hermit = rocks[hr] && {
        rockIdx: hr, x: rocks[hr].x, fy: H - 7, rockH: rocks[hr].h,
        t: rnd(0, 6), cycle: rnd(9, 15), shown: rnd(3, 5)
      }
    }
    // shared bits, all drawn facing +x with body centred at origin
    function tailFin (len, tail, col) {
      ctx.fillStyle = col
      ctx.beginPath()
      ctx.moveTo(-len * 0.8, 0)
      ctx.lineTo(-len * 1.5, -len * 0.45 + tail * len * 0.4)
      ctx.lineTo(-len * 1.5, len * 0.45 + tail * len * 0.4)
      ctx.closePath()
      ctx.fill()
    }
    function eye (len, ex) {
      ex = ex == null ? len * 0.55 : ex
      ctx.globalAlpha = 1
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.beginPath(); ctx.arc(ex, -len * 0.12, 1.6, 0, 6.2832); ctx.fill()
      ctx.fillStyle = '#111'
      ctx.beginPath(); ctx.arc(ex + len * 0.06, -len * 0.12, 0.85, 0, 6.2832); ctx.fill()
    }

    const RENDER = {
      clown (f, t, swim, tail) {
        const L = f.len
        tailFin(L, tail, f.col)
        ctx.fillStyle = f.col
        ctx.beginPath(); ctx.ellipse(0, 0, L, L * 0.45, 0, 0, 6.2832); ctx.fill()
        ctx.save()
        ctx.beginPath(); ctx.ellipse(0, 0, L, L * 0.45, 0, 0, 6.2832); ctx.clip()
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        for (const sx of [-0.3, 0.25, 0.7]) ctx.fillRect(sx * L - L * 0.07, -L, L * 0.14, L * 2)
        ctx.restore()
        eye(L)
      },
      tang (f, t, swim, tail) {
        const L = f.len * 0.95
        tailFin(L * 0.9, tail, f.col)
        ctx.fillStyle = f.col
        ctx.beginPath(); ctx.ellipse(0, 0, L, L * 0.62, 0, 0, 6.2832); ctx.fill()
        ctx.beginPath(); ctx.moveTo(-L * 0.3, -L * 0.5); ctx.quadraticCurveTo(0, -L * 0.95, L * 0.4, -L * 0.42); ctx.closePath(); ctx.fill()
        ctx.beginPath(); ctx.moveTo(-L * 0.3, L * 0.5); ctx.quadraticCurveTo(0, L * 0.95, L * 0.4, L * 0.42); ctx.closePath(); ctx.fill()
        eye(L)
      },
      guppy (f, t, swim, tail) {
        const L = f.len
        ctx.globalAlpha = 0.5; ctx.fillStyle = f.col
        ctx.beginPath()
        ctx.moveTo(-L * 0.7, 0)
        ctx.quadraticCurveTo(-L * 1.9, -L * 0.9 + tail * L * 0.5, -L * 1.3, -L * 0.1)
        ctx.quadraticCurveTo(-L * 2.1, tail * L * 0.5, -L * 1.3, L * 0.1)
        ctx.quadraticCurveTo(-L * 1.9, L * 0.9 + tail * L * 0.5, -L * 0.7, 0)
        ctx.fill()
        ctx.globalAlpha = 0.9; ctx.fillStyle = f.col
        ctx.beginPath(); ctx.ellipse(0, 0, L * 0.8, L * 0.32, 0, 0, 6.2832); ctx.fill()
        eye(L * 0.8, L * 0.5)
      },
      puffer (f, t, swim, tail) {
        const L = f.len * 0.85
        tailFin(L * 0.7, tail * 0.6, f.col)
        ctx.strokeStyle = f.col; ctx.lineWidth = 1.2
        for (let a = 0; a < 6.28; a += 0.5) {
          ctx.beginPath()
          ctx.moveTo(Math.cos(a) * L * 0.75, Math.sin(a) * L * 0.75)
          ctx.lineTo(Math.cos(a) * L * 1.08, Math.sin(a) * L * 1.08)
          ctx.stroke()
        }
        ctx.fillStyle = f.col
        ctx.beginPath(); ctx.arc(0, 0, L * 0.78, 0, 6.2832); ctx.fill()
        eye(L, L * 0.45)
      },
      angel (f, t, swim, tail) {
        const L = f.len
        ctx.fillStyle = f.col
        ctx.beginPath(); ctx.moveTo(-L * 0.5, 0); ctx.lineTo(-L * 1.05, -L * 0.5 + tail * L * 0.3); ctx.lineTo(-L * 1.05, L * 0.5 + tail * L * 0.3); ctx.closePath(); ctx.fill()
        ctx.beginPath(); ctx.moveTo(0, -L * 0.85); ctx.lineTo(-L * 0.25, -L * 1.45); ctx.lineTo(-L * 0.5, -L * 0.4); ctx.closePath(); ctx.fill()
        ctx.beginPath(); ctx.moveTo(0, L * 0.85); ctx.lineTo(-L * 0.25, L * 1.45); ctx.lineTo(-L * 0.5, L * 0.4); ctx.closePath(); ctx.fill()
        ctx.beginPath(); ctx.moveTo(L * 0.7, 0); ctx.lineTo(0, -L * 0.9); ctx.lineTo(-L * 0.55, 0); ctx.lineTo(0, L * 0.9); ctx.closePath(); ctx.fill()
        ctx.save()
        ctx.beginPath(); ctx.moveTo(L * 0.7, 0); ctx.lineTo(0, -L * 0.9); ctx.lineTo(-L * 0.55, 0); ctx.lineTo(0, L * 0.9); ctx.closePath(); ctx.clip()
        ctx.fillStyle = 'rgba(0,0,0,0.18)'
        for (const sx of [-0.05, 0.35]) ctx.fillRect(sx * L - L * 0.06, -L, L * 0.12, L * 2)
        ctx.restore()
        eye(L * 0.6, L * 0.4)
      },
      jelly (f, t, swim, tail) {
        const L = f.len * 0.9
        const pulse = 1 + Math.sin(t * 2 + f.wob) * 0.12
        ctx.globalAlpha = 0.5; ctx.fillStyle = f.col
        ctx.beginPath(); ctx.ellipse(0, 0, L * pulse, L * 0.75 * pulse, 0, Math.PI, 0); ctx.fill()
        ctx.beginPath(); ctx.ellipse(0, 0, L * pulse, L * 0.3, 0, 0, Math.PI); ctx.fill()
        ctx.strokeStyle = f.col; ctx.lineWidth = 1.2
        for (let i = -2; i <= 2; i++) {
          const tx = i * L * 0.3
          ctx.beginPath(); ctx.moveTo(tx, L * 0.2)
          ctx.quadraticCurveTo(tx + Math.sin(t * 3 + i) * 3, L * 1.0, tx + Math.sin(t * 2 + i) * 4, L * 1.7)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
      }
    }

    function drawFish (f, t) {
      const swim = Math.sin(t * f.wobSpd + f.wob)
      const tail = swim * 0.5
      ctx.save()
      ctx.translate(f.x, f.y + Math.sin(t * 1.2 + f.drift) * 2)
      if (f.type !== 'jelly') ctx.scale(f.dir, 1)
      ctx.globalAlpha = 0.9
      ;(RENDER[f.type] || RENDER.clown)(f, t, swim, tail)
      ctx.restore()
    }

    function drawCrab (c, fy) {
      const s = 7
      ctx.save()
      ctx.globalAlpha = 0.95
      ctx.translate(c.x, fy - s * 0.4)
      // legs (3 per side, animated)
      ctx.strokeStyle = '#b8503f'; ctx.lineWidth = 1.3; ctx.lineCap = 'round'
      for (let i = -1; i <= 1; i++) {
        const off = i * s * 0.5
        const lift = Math.abs(Math.sin(c.leg + i)) * 1.6
        ctx.beginPath(); ctx.moveTo(off - s * 0.4, 0); ctx.lineTo(off - s * 1.1, s * 0.6 - lift); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(off + s * 0.4, 0); ctx.lineTo(off + s * 1.1, s * 0.6 - lift); ctx.stroke()
      }
      // claws
      ctx.fillStyle = '#c25a48'
      ctx.beginPath(); ctx.arc(-s * 1.2, -s * 0.1, s * 0.45, 0, 6.2832); ctx.fill()
      ctx.beginPath(); ctx.arc(s * 1.2, -s * 0.1, s * 0.45, 0, 6.2832); ctx.fill()
      // body
      ctx.fillStyle = '#cf6450'
      ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.7, 0, 0, 6.2832); ctx.fill()
      // eye stalks
      ctx.strokeStyle = '#cf6450'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(-s * 0.3, -s * 0.5); ctx.lineTo(-s * 0.3, -s * 0.95); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(s * 0.3, -s * 0.5); ctx.lineTo(s * 0.3, -s * 0.95); ctx.stroke()
      ctx.fillStyle = '#fff'
      ctx.beginPath(); ctx.arc(-s * 0.3, -s * 1.0, 1.3, 0, 6.2832); ctx.fill()
      ctx.beginPath(); ctx.arc(s * 0.3, -s * 1.0, 1.3, 0, 6.2832); ctx.fill()
      ctx.fillStyle = '#111'
      ctx.beginPath(); ctx.arc(-s * 0.3, -s * 1.0, 0.6, 0, 6.2832); ctx.fill()
      ctx.beginPath(); ctx.arc(s * 0.3, -s * 1.0, 0.6, 0, 6.2832); ctx.fill()
      ctx.restore()
    }

    function drawRock (r, fy) {
      ctx.save()
      ctx.globalAlpha = 1
      ctx.fillStyle = r.col
      ctx.beginPath(); ctx.ellipse(r.x, fy + 2, r.w * 0.5, r.h, 0, Math.PI, 6.2832); ctx.closePath(); ctx.fill()
      ctx.restore()
    }

    function drawStar (st) {
      ctx.save()
      ctx.translate(st.x, st.y)
      ctx.rotate(st.rot)
      ctx.globalAlpha = 0.8
      ctx.fillStyle = st.col
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * 6.2832 - 1.5708
        const a2 = a + 0.6283
        ctx.lineTo(Math.cos(a) * st.r, Math.sin(a) * st.r)
        ctx.lineTo(Math.cos(a2) * st.r * 0.45, Math.sin(a2) * st.r * 0.45)
      }
      ctx.closePath(); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.beginPath(); ctx.arc(0, 0, st.r * 0.2, 0, 6.2832); ctx.fill()
      ctx.restore()
    }

    function drawSchool (sc, t) {
      const cy = sc.y + Math.sin(t * 1.0 + sc.bob) * 3
      ctx.fillStyle = sc.col
      for (const mb of sc.members) {
        const x = sc.x + sc.dir * mb.ox
        const y = cy + mb.oy + Math.sin(t * 2 + mb.ph) * 1.5
        const L = 4
        const tail = Math.sin(t * 8 + mb.ph) * 0.5
        ctx.save()
        ctx.translate(x, y)
        ctx.scale(sc.dir, 1)
        ctx.globalAlpha = 0.85
        ctx.beginPath(); ctx.ellipse(0, 0, L, L * 0.5, 0, 0, 6.2832); ctx.fill()
        ctx.beginPath()
        ctx.moveTo(-L * 0.8, 0)
        ctx.lineTo(-L * 1.6, -L * 0.5 + tail * L * 0.4)
        ctx.lineTo(-L * 1.6, L * 0.5 + tail * L * 0.4)
        ctx.closePath(); ctx.fill()
        ctx.restore()
      }
    }

    function drawHermit (h, out, t) {
      const s = 6
      const cx = h.x
      const cy = h.fy - h.rockH * 0.4 - out * 9
      ctx.save()
      ctx.translate(cx, cy)
      ctx.globalAlpha = 0.95
      // head poking out
      ctx.fillStyle = '#cf6450'
      ctx.beginPath(); ctx.ellipse(s * 0.5, 0, s * 0.5, s * 0.4, 0, 0, 6.2832); ctx.fill()
      if (out > 0.6) {
        ctx.strokeStyle = '#cf6450'; ctx.lineWidth = 1; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(s * 0.6, -s * 0.2); ctx.lineTo(s * 0.8, -s * 0.7); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(s * 0.4, -s * 0.2); ctx.lineTo(s * 0.5, -s * 0.8); ctx.stroke()
        ctx.fillStyle = '#fff'
        ctx.beginPath(); ctx.arc(s * 0.8, -s * 0.72, 1, 0, 6.2832); ctx.fill()
        ctx.beginPath(); ctx.arc(s * 0.5, -s * 0.82, 1, 0, 6.2832); ctx.fill()
        ctx.fillStyle = '#111'
        ctx.beginPath(); ctx.arc(s * 0.8, -s * 0.72, 0.5, 0, 6.2832); ctx.fill()
        ctx.beginPath(); ctx.arc(s * 0.5, -s * 0.82, 0.5, 0, 6.2832); ctx.fill()
      }
      // spiral shell
      ctx.fillStyle = '#a9743f'
      ctx.beginPath(); ctx.arc(-s * 0.2, 0, s * 0.8, 0, 6.2832); ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(-s * 0.2, 0, s * 0.5, 0, 5); ctx.stroke()
      ctx.beginPath(); ctx.arc(-s * 0.05, -s * 0.1, s * 0.25, 0, 5); ctx.stroke()
      ctx.restore()
    }
    function draw (env, t, dt) {
      B(env)
      // water tint
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, 'rgba(40,110,150,0.10)')
      g.addColorStop(1, 'rgba(15,55,95,0.28)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)

      // sandy floor
      const fy = H - 7
      ctx.fillStyle = '#6e5c40'
      ctx.beginPath()
      ctx.moveTo(0, H)
      ctx.lineTo(0, fy)
      for (let x = 0; x <= W; x += 12) ctx.lineTo(x, fy + Math.sin(x * 0.3) * 1.5)
      ctx.lineTo(W, H)
      ctx.closePath(); ctx.fill()
      // rocks + starfish (the starfish crawls very slowly along the sand)
      for (const r of rocks) drawRock(r, fy)
      if (starfish) {
        starfish.x += starfish.dir * starfish.spd * dt
        starfish.rot += starfish.dir * dt * 0.15
        if (starfish.x < 8) { starfish.x = 8; starfish.dir = 1 }
        if (starfish.x > W - 8) { starfish.x = W - 8; starfish.dir = -1 }
        starfish.y = fy - 2
        drawStar(starfish)
      }

      // seaweed
      for (const w of weeds) {
        ctx.strokeStyle = w.col
        ctx.lineWidth = w.w
        ctx.lineCap = 'round'
        ctx.globalAlpha = 0.55
        ctx.beginPath()
        ctx.moveTo(w.x, H)
        const sway = Math.sin(t * 1.3 + w.ph) * 6
        ctx.quadraticCurveTo(w.x + sway, H - w.h * 0.5, w.x + sway * 1.6, H - w.h)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      // bubbles
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      for (const b of bubbles) {
        b.y -= b.spd * dt
        b.x += Math.sin(t * 2 + b.y * 0.05) * 0.2
        if (b.y < -4) { b.y = H + 4; b.x = rnd(0, W) }
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.2832); ctx.fill()
      }

      // fish
      for (const f of fish) {
        const m = f.len * 2
        if (f.type === 'jelly') {
          f.y -= f.spd * 0.4 * dt
          f.x += Math.sin(t * 0.8 + f.drift) * 0.25
          if (f.y < -m) { f.y = H + m; f.x = rnd(0, W) }
        } else {
          f.x += f.dir * f.spd * dt
          if (f.dir > 0 && f.x > W + m) { f.x = -m; f.y = rnd(18, Math.max(36, H - 26)) }
          if (f.dir < 0 && f.x < -m) { f.x = W + m; f.y = rnd(18, Math.max(36, H - 26)) }
        }
        drawFish(f, t)
      }

      // school of little fish, moving as one
      if (school) {
        school.x += school.dir * school.spd * dt
        const sm = 24
        if (school.dir > 0 && school.x > W + sm) { school.x = -sm; school.y = rnd(25, Math.max(40, H * 0.6)) }
        if (school.dir < 0 && school.x < -sm) { school.x = W + sm; school.y = rnd(25, Math.max(40, H * 0.6)) }
        drawSchool(school, t)
      }

      // crab walking the floor
      if (crab) {
        if (crab.pause > 0) {
          crab.pause -= dt
        } else {
          crab.x += crab.dir * crab.spd * dt
          crab.leg += dt * 9
          if (Math.random() < 0.004) crab.pause = rnd(0.5, 1.6)
          if (Math.random() < 0.003) crab.dir *= -1
        }
        if (crab.x < 14) { crab.x = 14; crab.dir = 1 }
        if (crab.x > W - 14) { crab.x = W - 14; crab.dir = -1 }
        drawCrab(crab, H - 7)
      }

      // hermit crab peeking from its rock now and then
      if (hermit) {
        hermit.t += dt
        const local = hermit.t % (hermit.cycle + hermit.shown)
        const out = local < hermit.shown ? Math.sin((local / hermit.shown) * Math.PI) : 0
        if (out > 0.02) {
          drawHermit(hermit, out, t)
          drawRock(rocks[hermit.rockIdx], fy) // mask the base so it reads as emerging
        }
      }

    }

registerTheme({ key: "aquarium", emoji: "🐟", title: "Aquarium", order: 1, seed, draw })
