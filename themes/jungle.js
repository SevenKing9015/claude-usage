// Auto-generated theme pack.
// Contract: registerTheme({ key, emoji, title, order?, seed(env), draw(env, t, dt) })
// env = { ctx, W, H, rnd, pick }. Keep per-theme state in module scope.
let ctx, W, H, rnd, pick
function B (e) { ctx = e.ctx; W = e.W; H = e.H; rnd = e.rnd; pick = e.pick }

    let canopy = [], vines = [], monkey = null, toucan = null, hummer = null, flutters = [], fleaves = [], bushes = [], shrooms = []
    function seed (env) {
      B(env)
      canopy = Array.from({ length: Math.max(4, Math.round(W / 45)) }, () => ({ x: rnd(0, W), y: rnd(-6, 8), s: rnd(12, 22), col: pick(['#1f5132', '#27623c', '#2f6d45']) }))
      vines = Array.from({ length: 2 }, () => ({ x: rnd(W * 0.2, W * 0.8), len: rnd(H * 0.6, H * 0.92), ph: rnd(0, 6.28) }))
      monkey = { vine: 0, ph: rnd(0, 6.28), spd: rnd(1.0, 1.5) }
      toucan = { x: rnd(0, W), y: rnd(20, H * 0.6), dir: Math.random() < 0.5 ? -1 : 1, spd: rnd(16, 26), flap: rnd(0, 6.28) }
      hummer = { x: rnd(20, W - 20), y: rnd(20, H * 0.75), tx: rnd(20, W - 20), ty: rnd(20, H * 0.75), wing: 0, retime: rnd(2, 4) }
      flutters = Array.from({ length: 3 }, () => ({ x: rnd(0, W), y: rnd(20, H * 0.85), ph: rnd(0, 6.28), col: pick(['#e0a04a', '#d97757', '#c9879b']), spd: rnd(6, 10), dir: Math.random() < 0.5 ? -1 : 1 }))
      fleaves = Array.from({ length: 5 }, () => ({ x: rnd(0, W), y: rnd(0, H), s: rnd(3, 5), ph: rnd(0, 6.28), spd: rnd(8, 16), col: pick(['#3f8f4f', '#5a9c3a', '#8a7350']) }))
      bushes = Array.from({ length: Math.max(3, Math.round(W / 55)) }, () => ({ x: rnd(0, W), s: rnd(14, 26), col: pick(['#1d4d2e', '#235c38', '#2c6b42']) }))
      shrooms = Array.from({ length: 3 }, () => ({ x: rnd(10, W - 10), s: rnd(3, 5), col: pick(['#d6504a', '#e0a04a', '#cf6450']) }))
    }
    function drawBush (b, t) {
      const sway = Math.sin(t * 0.7 + b.x) * 1.2, y = H + 2
      ctx.globalAlpha = 0.85; ctx.fillStyle = b.col
      ctx.beginPath()
      ctx.ellipse(b.x + sway, y, b.s, b.s * 0.7, 0, 0, 6.2832)
      ctx.ellipse(b.x - b.s * 0.6 + sway, y + 2, b.s * 0.6, b.s * 0.5, 0, 0, 6.2832)
      ctx.ellipse(b.x + b.s * 0.6 + sway, y + 2, b.s * 0.6, b.s * 0.5, 0, 0, 6.2832)
      ctx.fill(); ctx.globalAlpha = 1
    }
    function drawShroom (m) {
      const y = H - 3, s = m.s
      ctx.globalAlpha = 0.9
      ctx.fillStyle = '#e8e0d0'; ctx.fillRect(m.x - s * 0.3, y - s, s * 0.6, s)
      ctx.fillStyle = m.col
      ctx.beginPath(); ctx.ellipse(m.x, y - s, s, s * 0.7, 0, Math.PI, 6.2832); ctx.closePath(); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.beginPath(); ctx.arc(m.x - s * 0.4, y - s * 1.1, 0.8, 0, 6.2832); ctx.arc(m.x + s * 0.3, y - s * 1.3, 0.8, 0, 6.2832); ctx.fill()
      ctx.globalAlpha = 1
    }
    function drawVine (v, t) {
      const sway = Math.sin(t * 0.8 + v.ph) * 6
      ctx.strokeStyle = 'rgba(60,110,60,0.5)'; ctx.lineWidth = 2; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(v.x, 0); ctx.quadraticCurveTo(v.x + sway * 0.5, v.len * 0.5, v.x + sway, v.len); ctx.stroke()
      ctx.fillStyle = 'rgba(70,130,70,0.5)'
      for (let i = 1; i <= 3; i++) {
        const yy = v.len * i / 4
        const xx = v.x + sway * (yy / v.len)
        ctx.beginPath(); ctx.ellipse(xx + 3, yy, 3, 1.6, 0.6, 0, 6.2832); ctx.fill()
      }
    }
    function drawCanopy (c, t) {
      const sway = Math.sin(t * 0.6 + c.x) * 1.5
      ctx.globalAlpha = 0.8; ctx.fillStyle = c.col
      ctx.beginPath()
      ctx.ellipse(c.x + sway, c.y, c.s, c.s * 0.7, 0, 0, 6.2832)
      ctx.ellipse(c.x + c.s * 0.6 + sway, c.y + 4, c.s * 0.7, c.s * 0.5, 0, 0, 6.2832)
      ctx.fill(); ctx.globalAlpha = 1
    }
    function drawFlea (x, y, s, rot, col) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(rot) * 1.2)
      ctx.globalAlpha = 0.7; ctx.fillStyle = col
      ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.45, 0, 0, 6.2832); ctx.fill()
      ctx.restore(); ctx.globalAlpha = 1
    }
    function drawMonkey (mk, v, t) {
      const ang = Math.sin(t * mk.spd + mk.ph) * 0.6
      const px = v.x + Math.sin(ang) * v.len
      const py = Math.cos(ang) * v.len
      ctx.strokeStyle = 'rgba(80,120,70,0.6)'; ctx.lineWidth = 2; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(v.x, 0); ctx.lineTo(px, py - 5); ctx.stroke()
      ctx.save(); ctx.translate(px, py); ctx.globalAlpha = 0.95
      ctx.strokeStyle = '#543a25'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(0, 4); ctx.quadraticCurveTo(10, 8, 7 + Math.sin(t * 2) * 2, 0); ctx.stroke()
      ctx.strokeStyle = '#6b4a2f'
      ctx.beginPath(); ctx.moveTo(-2, -2); ctx.lineTo(0, -7); ctx.moveTo(2, -2); ctx.lineTo(0, -7); ctx.stroke()
      ctx.fillStyle = '#6b4a2f'
      ctx.beginPath(); ctx.ellipse(0, 2, 4, 5, 0, 0, 6.2832); ctx.fill()
      ctx.beginPath(); ctx.arc(0, -4, 3.5, 0, 6.2832); ctx.fill()
      ctx.beginPath(); ctx.arc(-3, -5, 1.4, 0, 6.2832); ctx.arc(3, -5, 1.4, 0, 6.2832); ctx.fill()
      ctx.fillStyle = '#caa06f'; ctx.beginPath(); ctx.ellipse(0, -3.5, 2, 2.2, 0, 0, 6.2832); ctx.fill()
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-1, -4, 0.6, 0, 6.2832); ctx.arc(1, -4, 0.6, 0, 6.2832); ctx.fill()
      ctx.restore(); ctx.globalAlpha = 1
    }
    function drawToucan (tc, t) {
      const flap = Math.sin(tc.flap) * 0.5
      ctx.save(); ctx.translate(tc.x, tc.y + Math.sin(t * 1.2) * 2); ctx.scale(tc.dir, 1); ctx.globalAlpha = 0.95
      ctx.fillStyle = '#1c1c20'
      ctx.beginPath(); ctx.moveTo(-2, 0); ctx.quadraticCurveTo(-10, -8 * Math.abs(flap) - 2, -14, 4); ctx.quadraticCurveTo(-8, 2, -2, 2); ctx.fill()
      ctx.fillStyle = '#222'; ctx.beginPath(); ctx.ellipse(0, 0, 8, 5.5, 0, 0, 6.2832); ctx.fill()
      ctx.fillStyle = '#f2efe6'; ctx.beginPath(); ctx.ellipse(3, 1, 4, 3.2, 0, 0, 6.2832); ctx.fill()
      ctx.fillStyle = '#1c1c20'; ctx.beginPath(); ctx.moveTo(-7, -1); ctx.lineTo(-13, -3); ctx.lineTo(-7, 2); ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(6, -3, 4, 0, 6.2832); ctx.fill()
      ctx.fillStyle = '#f08a24'; ctx.beginPath(); ctx.moveTo(8, -5); ctx.quadraticCurveTo(20, -5, 21, -1); ctx.quadraticCurveTo(14, -1, 9, -1); ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#d6504a'; ctx.beginPath(); ctx.moveTo(18, -4); ctx.lineTo(21, -1); ctx.lineTo(17, -1.5); ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(6.5, -4, 1.4, 0, 6.2832); ctx.fill()
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(7, -4, 0.7, 0, 6.2832); ctx.fill()
      ctx.restore(); ctx.globalAlpha = 1
    }
    function drawHummer (h, t) {
      const dir = (h.tx >= h.x) ? 1 : -1
      ctx.save(); ctx.translate(h.x, h.y); ctx.scale(dir, 1); ctx.globalAlpha = 0.95
      const w = 4 + Math.sin(h.wing) * 1.5
      ctx.fillStyle = 'rgba(180,220,230,0.35)'
      ctx.beginPath(); ctx.ellipse(-1, -2, 5, w * 0.4, 0.6, 0, 6.2832); ctx.fill()
      ctx.beginPath(); ctx.ellipse(-1, 2, 5, w * 0.4, -0.6, 0, 6.2832); ctx.fill()
      ctx.fillStyle = '#2fae7a'; ctx.beginPath(); ctx.ellipse(0, 0, 3.5, 2.2, 0, 0, 6.2832); ctx.fill()
      ctx.fillStyle = '#2a9bd0'; ctx.beginPath(); ctx.arc(2.5, -0.5, 1.8, 0, 6.2832); ctx.fill()
      ctx.strokeStyle = '#333'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(4, -0.5); ctx.lineTo(9, -1); ctx.stroke()
      ctx.fillStyle = '#2fae7a'; ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(-6, -1.5); ctx.lineTo(-6, 1.5); ctx.closePath(); ctx.fill()
      ctx.restore(); ctx.globalAlpha = 1
    }
    function drawButterfly (x, y, ph, col) {
      ctx.save(); ctx.translate(x, y); ctx.globalAlpha = 0.85
      const w = Math.abs(Math.sin(ph)) * 3 + 1.5
      ctx.fillStyle = col
      ctx.beginPath(); ctx.ellipse(-w * 0.5, -1, w, 2.4, 0.4, 0, 6.2832); ctx.fill()
      ctx.beginPath(); ctx.ellipse(w * 0.5, -1, w, 2.4, -0.4, 0, 6.2832); ctx.fill()
      ctx.beginPath(); ctx.ellipse(-w * 0.4, 2, w * 0.7, 1.8, 0.3, 0, 6.2832); ctx.fill()
      ctx.beginPath(); ctx.ellipse(w * 0.4, 2, w * 0.7, 1.8, -0.3, 0, 6.2832); ctx.fill()
      ctx.fillStyle = '#3a2a1a'; ctx.beginPath(); ctx.ellipse(0, 0, 0.8, 3, 0, 0, 6.2832); ctx.fill()
      ctx.restore(); ctx.globalAlpha = 1
    }
    function draw (env, t, dt) {
      B(env)
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, 'rgba(20,60,35,0.28)')
      g.addColorStop(1, 'rgba(30,75,45,0.14)')
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
      for (const v of vines) drawVine(v, t)
      for (const l of fleaves) {
        l.y += l.spd * dt
        l.x += Math.sin(t * 1.5 + l.ph) * 0.4
        if (l.y > H + 6) { l.y = -6; l.x = rnd(0, W) }
        drawFlea(l.x, l.y, l.s, t + l.ph, l.col)
      }
      if (monkey && vines[monkey.vine]) drawMonkey(monkey, vines[monkey.vine], t)
      if (toucan) {
        toucan.x += toucan.dir * toucan.spd * dt
        toucan.flap += dt * 6
        const m = 24
        if (toucan.dir > 0 && toucan.x > W + m) { toucan.x = -m; toucan.y = rnd(20, H * 0.5) }
        if (toucan.dir < 0 && toucan.x < -m) { toucan.x = W + m; toucan.y = rnd(20, H * 0.5) }
        drawToucan(toucan, t)
      }
      if (hummer) {
        hummer.retime -= dt
        if (hummer.retime <= 0) { hummer.tx = rnd(16, W - 16); hummer.ty = rnd(16, H * 0.6); hummer.retime = rnd(2.5, 4.5) }
        hummer.x += (hummer.tx - hummer.x) * Math.min(1, dt * 2)
        hummer.y += (hummer.ty - hummer.y) * Math.min(1, dt * 2)
        hummer.wing += dt * 40
        drawHummer(hummer, t)
      }
      for (const f of flutters) {
        f.x += f.dir * f.spd * dt
        f.y += Math.sin(t * 3 + f.ph) * 0.6
        const m = 8
        if (f.dir > 0 && f.x > W + m) f.x = -m
        if (f.dir < 0 && f.x < -m) f.x = W + m
        drawButterfly(f.x, f.y, t * 10 + f.ph, f.col)
      }
      // ground undergrowth fills the lower area
      for (const sh of shrooms) drawShroom(sh)
      for (const bs of bushes) drawBush(bs, t)
      for (const c of canopy) drawCanopy(c, t)
    }

registerTheme({ key: "jungle", emoji: "🌴", title: "Jungle", order: 3, seed, draw })
