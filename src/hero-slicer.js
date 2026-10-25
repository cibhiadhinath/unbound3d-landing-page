// Homepage hero: an interactive "slicer preview". A parametric part is drawn as stacked
// layer outlines, printed layer by layer by a glowing nozzle, then left to rotate.
// Drag/swipe rotates it; the shape chips print a different object.
// Plain canvas, no dependencies. Reduced motion: final state, no auto-rotation or print run.

const stage = document.querySelector('[data-slicer]')

if (stage) {
  const canvas = stage.querySelector('canvas')
  const ctx = canvas.getContext('2d')
  const chips = [...stage.querySelectorAll('[data-shape]')]
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const LAYERS = 46
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
  let printStart = 0
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
    const S = Math.min(width, height) * 0.74
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

  const CHUNK = 12 // points per stroke segment, so depth shading varies around each ring

  const drawRing = (ring, z, upTo, color, lw) => {
    const n = Math.max(2, Math.floor(upTo))
    for (let start = 0; start < n; start += CHUNK) {
      const end = Math.min(n, start + CHUNK)
      ctx.beginPath()
      let depth = 0
      for (let j = start; j <= end; j++) {
        const k = j % POINTS
        project(ring[k * 2], ring[k * 2 + 1], z, p)
        depth += p[2]
        j === start ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])
      }
      depth /= end - start + 1
      // Front of the part reads darker, back lighter
      const t = Math.min(1, Math.max(0, (depth + 0.5) / 1.0))
      ctx.globalAlpha = color ? 1 : 0.62 - t * 0.5
      ctx.strokeStyle = color || '#1d1d1f'
      ctx.lineWidth = lw
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  const draw = () => {
    if (!width) return
    ctx.clearRect(0, 0, width, height)
    drawBed()

    const exact = progress * LAYERS
    const done = Math.floor(exact)
    const partial = exact - done

    for (let i = 0; i < Math.min(done, LAYERS); i++) {
      drawRing(geometry[i].ring, geometry[i].z, POINTS, null, 1)
    }

    // Layer being printed: blue trail plus the nozzle
    if (done < LAYERS && progress < 1) {
      const layer = geometry[done]
      const upTo = partial * POINTS
      drawRing(layer.ring, layer.z, upTo, '#0071e3', 1.6)
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

    if (printing) {
      progress = Math.min(1, (now - printStart) / PRINT_MS)
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
    build(name)
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.shape === name)))
    if (reduced) { progress = 1; draw(); return }
    progress = 0
    printing = true
    printStart = performance.now()
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

  // Pause when off screen or tab hidden
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) kick() }).observe(stage)
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick() })
  new ResizeObserver(resize).observe(canvas)

  // First run: print once per session, then show the finished part
  let played = false
  try { played = sessionStorage.getItem('u3d-slicer-played') === '1' } catch { /* storage blocked */ }
  const initial = chips.find((c) => c.getAttribute('aria-pressed') === 'true')?.dataset.shape || 'gear'
  build(initial)
  resize()
  if (played || reduced) {
    progress = 1
    draw()
    kick()
  } else {
    try { sessionStorage.setItem('u3d-slicer-played', '1') } catch { /* storage blocked */ }
    setTimeout(() => print(initial), 250)
  }
}
