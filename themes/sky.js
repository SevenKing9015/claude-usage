// Auto-generated theme pack.
// Contract: registerTheme({ key, emoji, title, order?, seed(env), draw(env, t, dt) })
// env = { ctx, W, H, rnd, pick }. Keep per-theme state in module scope.
let ctx, W, H, rnd, pick
function B (e) { ctx = e.ctx; W = e.W; H = e.H; rnd = e.rnd; pick = e.pick }

    let clouds = [], birds = [], eagle = null, plane = null, balloon = null, stars = []
    function seed (env) {
      B(env)
      stars = Array.from({ length: 30 }, () => {
        const x = rnd(0, W), y = rnd(4, H * 0.7), dx = x - W * 0.5, dy = y - H * 1.2
        return { ang: Math.atan2(dy, dx), rad: Math.hypot(dx, dy), r: rnd(0.5, 1.4), ph: rnd(0, 6.28), tw: rnd(1.5, 3.5) }
      })
      clouds = Array.from({ length: 5 }, () => ({ x: rnd(0, W), y: rnd(8, H * 0.62), s: rnd(10, 20), spd: rnd(2, 6), a: rnd(0.10, 0.20) }))
      birds = Array.from({ length: 6 }, () => ({ x: rnd(0, W), y: rnd(15, H * 0.85), s: rnd(4, 7), dir: Math.random() < 0.5 ? -1 : 1, spd: rnd(18, 34), flap: rnd(0, 6.28), flapSpd: rnd(7, 11) }))
      eagle = { x: rnd(0, W), y: rnd(20, H * 0.55), dir: Math.random() < 0.5 ? -1 : 1, spd: rnd(10, 16), flap: rnd(0, 6.28) }
      plane = { x: -70, y: rnd(10, H * 0.3), dir: 1, spd: rnd(40, 60), wait: rnd(0, 6) }
      balloon = { x: rnd(0, W), y: rnd(H * 0.45, H * 0.78), dir: Math.random() < 0.5 ? -1 : 1, spd: rnd(4, 8), sway: rnd(0, 6.28), col: pick(['#d6504a', '#e0a04a', '#5fb0c9']) }
    }
    function drawBalloon (b, t) {
      const x = b.x, y = b.y + Math.sin(t * 0.6 + b.sway) * 3
      ctx.globalAlpha = 0.9; ctx.fillStyle = b.col
      ctx.beginPath(); ctx.ellipse(x, y, 9, 11, 0, 0, 6.2832); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.beginPath(); ctx.ellipse(x, y, 3, 11, 0, 0, 6.2832); ctx.fill()
      ctx.strokeStyle = 'rgba(60,50,40,0.7)'; ctx.lineWidth = 0.8
      ctx.beginPath(); ctx.moveTo(x - 5, y + 9); ctx.lineTo(x - 2, y + 16); ctx.moveTo(x + 5, y + 9); ctx.lineTo(x + 2, y + 16); ctx.stroke()
      ctx.fillStyle = '#8a5a32'; ctx.fillRect(x - 2.5, y + 16, 5, 4)
      ctx.globalAlpha = 1
    }
    function drawCloud (c) {
      ctx.fillStyle = 'rgba(255,255,255,' + c.a + ')'
      const s = c.s
      ctx.beginPath()
      ctx.ellipse(c.x, c.y, s, s * 0.6, 0, 0, 6.2832)
      ctx.ellipse(c.x + s * 0.8, c.y + s * 0.1, s * 0.7, s * 0.5, 0, 0, 6.2832)
      ctx.ellipse(c.x - s * 0.8, c.y + s * 0.1, s * 0.6, s * 0.45, 0, 0, 6.2832)
      ctx.fill()
    }
    function drawBird (x, y, s, dir, flap) {
      const up = Math.abs(Math.sin(flap)) * s * 0.9
      ctx.strokeStyle = 'rgba(40,46,64,0.7)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(x - s, y)
      ctx.quadraticCurveTo(x - s * 0.4, y - up, x, y)
      ctx.quadraticCurveTo(x + s * 0.4, y - up, x + s, y)
      ctx.stroke()
    }
    function drawEagle (e, t) {
      const flap = Math.sin(e.flap) * 0.4
      ctx.save()
      ctx.translate(e.x, e.y + Math.sin(t * 0.8) * 2)
      ctx.scale(e.dir, 1)
      ctx.globalAlpha = 0.85
      ctx.fillStyle = '#5a4632'
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-10, -6 - flap * 8, -22, 2 - flap * 4); ctx.quadraticCurveTo(-10, 1, 0, 3); ctx.fill()
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(10, -6 - flap * 8, 22, 2 - flap * 4); ctx.quadraticCurveTo(10, 1, 0, 3); ctx.fill()
      ctx.beginPath(); ctx.ellipse(0, 1, 4, 2.4, 0, 0, 6.2832); ctx.fill()
      ctx.fillStyle = '#e8e6df'; ctx.beginPath(); ctx.arc(5, 0, 2, 0, 6.2832); ctx.fill()
      ctx.fillStyle = '#e0a04a'; ctx.beginPath(); ctx.moveTo(6.5, -0.5); ctx.lineTo(9, 0); ctx.lineTo(6.5, 1); ctx.closePath(); ctx.fill()
      ctx.restore(); ctx.globalAlpha = 1
    }
    function drawPlane (p) {
      const x = p.x, y = p.y
      const grd = ctx.createLinearGradient(x - 70, 0, x, 0)
      grd.addColorStop(0, 'rgba(255,255,255,0)')
      grd.addColorStop(1, 'rgba(255,255,255,0.35)')
      ctx.strokeStyle = grd; ctx.lineWidth = 2; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(x - 70, y); ctx.lineTo(x - 6, y); ctx.stroke()
      ctx.fillStyle = '#c8ccd4'
      ctx.beginPath(); ctx.moveTo(x + 10, y); ctx.lineTo(x - 6, y - 2.2); ctx.lineTo(x - 6, y + 2.2); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y - 6); ctx.lineTo(x - 2, y); ctx.lineTo(x - 5, y + 6); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x - 10, y - 4); ctx.lineTo(x - 6, y - 0.5); ctx.closePath(); ctx.fill()
    }
    function draw (env, t, dt) {
      B(env)
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, 'rgba(28,40,80,0.36)')
      g.addColorStop(1, 'rgba(80,100,150,0.18)')
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
      // twinkling stars, drifting along a very slow arc (~1px/min) around a pivot below
      const px = W * 0.5, py = H * 1.2
      for (const s of stars) {
        s.ang += 0.00006 * dt
        const x = px + Math.cos(s.ang) * s.rad, y = py + Math.sin(s.ang) * s.rad
        const a = 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(t * s.tw + s.ph))
        ctx.fillStyle = 'rgba(255,255,255,' + a + ')'
        ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.2832); ctx.fill()
      }
      // moon with soft glow, top-right
      const mx = W - 28, my = 22
      const mg = ctx.createRadialGradient(mx, my, 2, mx, my, 26)
      mg.addColorStop(0, 'rgba(230,235,255,0.35)')
      mg.addColorStop(1, 'rgba(230,235,255,0)')
      ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, 26, 0, 6.2832); ctx.fill()
      ctx.fillStyle = '#e8ecf5'; ctx.beginPath(); ctx.arc(mx, my, 9, 0, 6.2832); ctx.fill()
      ctx.fillStyle = 'rgba(180,190,210,0.6)'
      ctx.beginPath(); ctx.arc(mx - 3, my - 2, 1.8, 0, 6.2832); ctx.arc(mx + 3, my + 2, 1.3, 0, 6.2832); ctx.arc(mx + 1, my - 4, 1, 0, 6.2832); ctx.fill()
      // rolling hills on the horizon, fills the lower area
      ctx.fillStyle = 'rgba(70,100,150,0.22)'
      ctx.beginPath(); ctx.moveTo(0, H)
      for (let x = 0; x <= W; x += 12) ctx.lineTo(x, H * 0.72 + Math.sin(x * 0.025) * 10)
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill()
      ctx.fillStyle = 'rgba(55,80,120,0.30)'
      ctx.beginPath(); ctx.moveTo(0, H)
      for (let x = 0; x <= W; x += 12) ctx.lineTo(x, H * 0.85 + Math.sin(x * 0.03 + 2) * 8)
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill()
      for (const c of clouds) {
        c.x += c.spd * dt
        if (c.x - c.s * 2 > W) c.x = -c.s * 2
        drawCloud(c)
      }
      if (balloon) {
        balloon.x += balloon.dir * balloon.spd * dt
        const m = 14
        if (balloon.dir > 0 && balloon.x > W + m) { balloon.x = -m; balloon.y = rnd(H * 0.45, H * 0.78) }
        if (balloon.dir < 0 && balloon.x < -m) { balloon.x = W + m; balloon.y = rnd(H * 0.45, H * 0.78) }
        drawBalloon(balloon, t)
      }
      if (plane) {
        if (plane.wait > 0) { plane.wait -= dt } else {
          plane.x += plane.dir * plane.spd * dt
          if (plane.x > W + 70) { plane.x = -70; plane.y = rnd(10, H * 0.3); plane.wait = rnd(4, 10) }
        }
        if (plane.wait <= 0) drawPlane(plane)
      }
      if (eagle) {
        eagle.x += eagle.dir * eagle.spd * dt
        eagle.flap += dt * 2.5
        const m = 30
        if (eagle.dir > 0 && eagle.x > W + m) { eagle.x = -m; eagle.y = rnd(20, H * 0.45) }
        if (eagle.dir < 0 && eagle.x < -m) { eagle.x = W + m; eagle.y = rnd(20, H * 0.45) }
        drawEagle(eagle, t)
      }
      for (const b of birds) {
        b.x += b.dir * b.spd * dt
        b.flap += dt * b.flapSpd
        const m = b.s * 2
        if (b.dir > 0 && b.x > W + m) b.x = -m
        if (b.dir < 0 && b.x < -m) b.x = W + m
        drawBird(b.x, b.y + Math.sin(t * 1.5 + b.flap * 0.2) * 3, b.s, b.dir, b.flap)
      }
    }

registerTheme({ key: "sky", emoji: "🐦", title: "Sky", order: 2, seed, draw })
