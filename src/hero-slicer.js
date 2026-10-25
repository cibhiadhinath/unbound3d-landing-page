// Homepage hero: an interactive "slicer preview". A parametric part is drawn as stacked
// layer outlines, printed layer by layer by a glowing nozzle, then left to rotate.
// Drag/swipe rotates it; the shape chips print a different object.
// Plain canvas, no dependencies. The print runs when the preview first scrolls into view (every
// visit). Reduced motion: final state, no auto-rotation or print run.

const stage = document.querySelector('[data-slicer]')

if (stage) {
  const canvas = stage.querySelector('canvas')
  const ctx = canvas.getContext('2d')
  const chips = [...stage.querySelectorAll('[data-shape]')]
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const LAYERS = 40
  const POINTS = 120
  const PRINT_MS = 2400
  const TAU = Math.PI * 2

  // ---------- Shapes: radius at angle θ and height z (0…1), plus twist and taper ----------
  const smoothstep = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t) }
  const hexR = (a) => { const s = TAU / 6; const k = ((a % s) + s) % s - s / 2; return Math.cos(Math.PI / 6) / Math.cos(k) }

  const SHAPES = {
    gear: {
      r: (a) => 1 + 0.11 * (smoothstep(-0.35, 0.35, Math.sin(a * 12)) * 2 - 1),
      twist: (z) => z * Math.PI * 0.42,
      scale: () => 0.9,
    },
    vase: {
      r: (a, z) => 1 + 0.07 * Math.sin(a * 8 + z * 6),
      twist: (z) => z * Math.PI * 0.5,
      scale: (z) => 0.62 + 0.34 * Math.sin(z * Math.PI * 0.95 + 0.2),
    },
    hex: {
      r: (a) => hexR(a),
      twist: (z) => z * Math.PI * 0.9,
      scale: (z) => 0.95 - 0.32 * z,
    },
  }

  // Precompute layer geometry (object space) for a shape
  let geometry = []
  const build = (name) => {
    const s = SHAPES[name]
    geometry = []
    for (let i = 0; i < LAYERS; i++) {
      const z = i / (LAYERS - 1)
      const tw = s.twist(z)
      const sc = s.scale(z)
      const ring = new Float32Array(POINTS * 2)
      for (let j = 0; j < POINTS; j++) {
        const a = (j / POINTS) * TAU
        const r = 0.42 * sc * s.r(a, z)
        ring[j * 2] = r * Math.cos(a + tw)
        ring[j * 2 + 1] = r * Math.sin(a + tw)
      }
      geometry.push({ z, ring })
    }
  }

  // ---------- View state ----------
  let yaw = -0.6
  let pitch = 0.42
  let width = 0
  let height = 0
  let dpr = 1
  let progress = reduced ? 1 : 0 // printed fraction 0…1
  let printing = false
  let lastInteraction = 0
  let visible = true
  let raf = 0
  let lastFrame = 0

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = rect.width
    height = rect.height
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    draw()
  }

  // Orthographic projection with yaw (around vertical axis) and pitch (looking down)
  const project = (x, y, z, out) => {
    const cy = Math.cos(yaw), sy = Math.sin(yaw)
    const cp = Math.cos(pitch), sp = Math.sin(pitch)
    const xr = x * cy - y * sy
    const yr = x * sy + y * cy
    const S = Math.min(width, height) * 0.7
    const h = 0.9 // object height in model units
    out[0] = width / 2 + xr * S
    out[1] = height * 0.76 - (z * h * cp) * S - yr * sp * S
    out[2] = yr * cp - z * h * sp // depth: larger = further away
  }

  const p = [0, 0, 0]

  const drawBed = () => {
    const c = 0.44 // half-size; diagonal stays inside the canvas at any yaw
    const corners = [[-c, -c], [c, -c], [c, c], [-c, c]]
    ctx.beginPath()
    corners.forEach(([x, y], i) => { project(x, y, -0.015, p); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]) })
    ctx.closePath()
    ctx.fillStyle = '#ececf0'
    ctx.fill()
    // grid
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let k = -4; k <= 4; k++) {
      const t = (k / 4) * c
      project(t, -c, -0.015, p); ctx.moveTo(p[0], p[1]); project(t, c, -0.015, p); ctx.lineTo(p[0], p[1])
      project(-c, t, -0.015, p); ctx.moveTo(p[0], p[1]); project(c, t, -0.015, p); ctx.lineTo(p[0], p[1])
    }
    ctx.stroke()
  }

  // Trace a layer outline as a closed path (first `upTo` points)
  const tracePath = (ring, z, upTo, close) => {
    ctx.beginPath()
    const n = Math.min(POINTS, Math.max(2, Math.floor(upTo)))
    for (let j = 0; j <= n; j++) {
      const k = j % POINTS
      project(ring[k * 2], ring[k * 2 + 1], z, p)
      j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])
    }
    if (close) ctx.closePath()
  }

  // Each slice is filled, then outlined. Drawn bottom→top, the fill of every slice hides the back
  // half of the one below, so the part reads as a solid print with fine layer lines on its sides.
  const drawSlice = (layer, i) => {
    const t = i / (LAYERS - 1)
    tracePath(layer.ring, layer.z, POINTS, true)
    const shade = Math.round(236 + t * 14) // slightly darker near the bed
    ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade + 3})`
    ctx.fill()
    ctx.strokeStyle = i === LAYERS - 1 ? 'rgba(29, 29, 31, 0.55)' : 'rgba(29, 29, 31, 0.28)'
    ctx.lineWidth = 0.9
    ctx.stroke()
  }

  const draw = () => {
    if (!width) return
    ctx.clearRect(0, 0, width, height)
    drawBed()

    const exact = progress * LAYERS
    const done = Math.floor(exact)
    const partial = exact - done

    for (let i = 0; i < Math.min(done, LAYERS); i++) drawSlice(geometry[i], i)

    // Layer being printed: blue trail plus the nozzle
    if (done < LAYERS && progress < 1) {
      const layer = geometry[done]
      const upTo = partial * POINTS
      tracePath(layer.ring, layer.z, upTo, false)
      ctx.strokeStyle = '#0071e3'
      ctx.lineWidth = 1.8
      ctx.stroke()
      const k = Math.floor(upTo) % POINTS
      project(layer.ring[k * 2], layer.ring[k * 2 + 1], layer.z, p)
      // hotend
      ctx.fillStyle = '#1d1d1f'
      ctx.beginPath()
      ctx.roundRect ? ctx.roundRect(p[0] - 9, p[1] - 22, 18, 14, 3) : ctx.rect(p[0] - 9, p[1] - 22, 18, 14)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(p[0] - 4, p[1] - 8); ctx.lineTo(p[0] + 4, p[1] - 8); ctx.lineTo(p[0], p[1] - 2); ctx.closePath()
      ctx.fill()
      // glowing tip
      const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 14)
      g.addColorStop(0, 'rgba(77, 163, 255, 0.95)')
      g.addColorStop(1, 'rgba(0, 113, 227, 0)')
      ctx.fillStyle = g
      ctx.beginPath(); ctx.arc(p[0], p[1], 14, 0, TAU); ctx.fill()
    }
  }

  // ---------- Animation loop (runs only while something is moving) ----------
  const tick = (now) => {
    raf = 0
    const dt = lastFrame ? Math.min(64, now - lastFrame) : 16
    lastFrame = now
    let moving = false

    // Advance by elapsed frame time, so a print paused off-screen resumes where it left off
    if (printing) {
      progress = Math.min(1, progress + dt / PRINT_MS)
      if (progress >= 1) printing = false
      moving = true
    }

    // Gentle idle rotation once printed, paused for 2.5 s after the user interacts
    if (!reduced && !printing && visible && now - lastInteraction > 2500) {
      yaw += dt * 0.00018
      moving = true
    }

    draw()
    if (moving && visible && !document.hidden) raf = requestAnimationFrame(tick)
    else lastFrame = 0
  }

  const kick = () => { if (!raf && visible) raf = requestAnimationFrame(tick) }

  const print = (name) => {
    started = true
    build(name)
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.shape === name)))
    if (reduced) { progress = 1; draw(); return }
    progress = 0
    printing = true
    lastFrame = 0
    kick()
  }

  // ---------- Interaction: drag / swipe to rotate ----------
  let dragging = false
  let lx = 0
  let ly = 0

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true
    lx = e.clientX; ly = e.clientY
    canvas.setPointerCapture(e.pointerId)
    stage.classList.add('is-dragging')
  })

  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return
    yaw += (e.clientX - lx) * 0.01
    pitch = Math.min(0.95, Math.max(0.12, pitch + (e.clientY - ly) * 0.004))
    lx = e.clientX; ly = e.clientY
    lastInteraction = performance.now()
    if (!raf) draw()
    kick()
  })

  const endDrag = () => { dragging = false; stage.classList.remove('is-dragging'); lastInteraction = performance.now(); kick() }
  canvas.addEventListener('pointerup', endDrag)
  canvas.addEventListener('pointercancel', endDrag)

  // Keyboard: arrow keys rotate when the canvas is focused
  canvas.addEventListener('keydown', (e) => {
    const step = { ArrowLeft: -0.15, ArrowRight: 0.15 }[e.key]
    if (step === undefined) return
    e.preventDefault()
    yaw += step
    lastInteraction = performance.now()
    draw()
  })

  chips.forEach((chip) => chip.addEventListener('click', () => { lastInteraction = 0; print(chip.dataset.shape) }))

  const initial = chips.find((c) => c.getAttribute('aria-pressed') === 'true')?.dataset.shape || 'gear'

  // Pause when off screen or tab hidden. The first print starts only once the preview is
  // properly in view, so on phones (where it sits below the fold) it isn't over before it's seen.
  let started = false
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (!started && entry.intersectionRatio >= 0.6) {
      started = true
      print(initial)
      return
    }
    if (visible) kick()
  }, { threshold: [0, 0.6] })
  // Wait for web fonts: before they load, shorter fallback text puts the canvas higher on the page
  const observe = () => io.observe(canvas)
  document.fonts && document.fonts.status !== 'loaded' ? document.fonts.ready.then(observe) : observe()
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick() })
  new ResizeObserver(resize).observe(canvas)

  // Until the first print starts, show the empty build plate (or the finished part for reduced motion)
  build(initial)
  resize()
  if (reduced) { started = true; progress = 1; draw() }
}
