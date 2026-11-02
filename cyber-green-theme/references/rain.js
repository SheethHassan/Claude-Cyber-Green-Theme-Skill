/*
 * Matrix code rain on a canvas, dependency-free. Used by the Cyber Green theme (see ../SKILL.md).
 *
 *   const rain = startMatrixRain(canvas, { stage: '#020805', head: '#CFFFE0', trail: '#39FF88' })
 *   rain.stop()        // when the theme is switched away or the component unmounts
 *
 * The canvas must have a CSS size (see theme.css: .matrix-rain canvas) and its opacity set from
 * --rain-opacity (0.28): the opacity is what keeps text on bare rain AA, so do not raise it
 * without running contrast.py.
 *
 * It falls only while the page is visible and focused, and holds one pre-rolled still frame for
 * reduced motion or when `still: true` is passed (pass it where the browser draws in software).
 */

const GLYPH_SIZE = 16 // px, the grid
const FRAME_MS = 55 // about 18 frames a second
const FADE = 0.06 // how much of the last frame each new one paints over: the trail's length
const SLOWEST = 0.55 // rows a frame, the slowest column

const GLYPHS = []
for (let c = 0xff66; c <= 0xff9d; c++) GLYPHS.push(String.fromCharCode(c)) // half-width katakana
'0123456789'.split('').forEach((d) => GLYPHS.push(d))

function withAlpha(hex, alpha) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

export function startMatrixRain(canvas, colours, options = {}) {
  const context = canvas.getContext('2d')
  if (!context) return { stop() {} }
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const still = options.still === true || reduced

  let width = 0
  let height = 0
  let drops = []
  let frame = 0
  let last = 0
  let running = false

  // One column per glyph width; each head starts above the screen at a different depth, and
  // neighbouring columns fall at different speeds so the rain is not one wall.
  function createDrops() {
    const columns = Math.ceil(width / GLYPH_SIZE)
    drops = Array.from({ length: columns }, (_, i) => ({
      row: -Math.random() * 40,
      speed: SLOWEST + (i % 5) * 0.12,
      drawn: undefined,
    }))
  }

  function step() {
    const bottom = height / GLYPH_SIZE
    for (const drop of drops) {
      if (drop.row > bottom && Math.random() > 0.975) drop.row = -Math.random() * 20
      drop.row += drop.speed
    }
  }

  function paint() {
    context.fillStyle = withAlpha(colours.stage, FADE)
    context.fillRect(0, 0, width, height)
    context.font = `${GLYPH_SIZE}px "Share Tech Mono", monospace`
    drops.forEach((drop, column) => {
      const row = Math.floor(drop.row)
      // Write once per row: redrawing on fractions of a row would smear glyphs into a blur.
      if (row <= 0 || row === drop.drawn) return
      drop.drawn = row
      const x = column * GLYPH_SIZE
      context.fillStyle = colours.head
      context.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], x, row * GLYPH_SIZE)
      context.fillStyle = colours.trail
      context.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], x, (row - 1) * GLYPH_SIZE)
    })
  }

  // Draw the frames the screen would have shown by now, so it opens already full of rain.
  function preroll() {
    const frames = Math.ceil((height / GLYPH_SIZE + 40) / SLOWEST)
    for (let i = 0; i < frames; i++) {
      step()
      paint()
    }
  }

  function fit() {
    width = canvas.clientWidth
    height = canvas.clientHeight
    canvas.width = width
    canvas.height = height
    context.fillStyle = colours.stage
    context.fillRect(0, 0, width, height)
    createDrops()
    preroll()
  }

  function tick(now) {
    if (now - last >= FRAME_MS) {
      last = now
      step()
      paint()
    }
    frame = requestAnimationFrame(tick)
  }

  function inFront() {
    return !document.hidden && document.hasFocus()
  }

  function sync() {
    const should = !still && inFront()
    if (should && !running) {
      running = true
      last = performance.now()
      frame = requestAnimationFrame(tick)
    } else if (!should && running) {
      running = false
      cancelAnimationFrame(frame)
    }
  }

  fit()
  sync()
  window.addEventListener('resize', fit)
  document.addEventListener('visibilitychange', sync)
  window.addEventListener('focus', sync)
  window.addEventListener('blur', sync)

  return {
    /** Pause or resume from outside, for example while the app is busy with a heavy job. */
    setPaused(paused) {
      if (paused && running) {
        running = false
        cancelAnimationFrame(frame)
      } else if (!paused) sync()
    },
    stop() {
      running = false
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', fit)
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('focus', sync)
      window.removeEventListener('blur', sync)
    },
  }
}
