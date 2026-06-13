import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import './App.css'

interface Props {
  speed: number
}

const CANVAS_SIZE = 1000
const WRAP_X = 500
const WRAP_Y = 820

type Step = () => void
type RoseHue = 'red' | 'pink' | 'white'
type TulipHue = 'purple' | 'red' | 'yellow'

interface FlowerSpec {
  type: 'rose' | 'gerbera' | 'tulip'
  angle: number
  length: number
  scale: number
  color: string
}

const ARRANGEMENT: FlowerSpec[] = [
  // back row (tallest)
  { type: 'rose', angle: -8, length: 365, scale: 0.7, color: 'red' },
  { type: 'tulip', angle: 8, length: 360, scale: 0.7, color: 'purple' },
  { type: 'gerbera', angle: -22, length: 345, scale: 0.6, color: '#FF8C00' },
  { type: 'gerbera', angle: 22, length: 345, scale: 0.6, color: '#FFD700' },
  { type: 'rose', angle: -36, length: 320, scale: 0.6, color: 'white' },
  { type: 'tulip', angle: 36, length: 320, scale: 0.6, color: 'yellow' },
  // upper mid (fillers between back and mid)
  { type: 'rose', angle: -14, length: 320, scale: 0.55, color: 'pink' },
  { type: 'tulip', angle: 14, length: 320, scale: 0.55, color: 'red' },
  // mid row
  { type: 'tulip', angle: -48, length: 290, scale: 0.6, color: 'red' },
  { type: 'rose', angle: 48, length: 290, scale: 0.65, color: 'pink' },
  { type: 'rose', angle: 0, length: 310, scale: 0.75, color: 'pink' },
  { type: 'gerbera', angle: -30, length: 280, scale: 0.55, color: '#FF1493' },
  { type: 'gerbera', angle: 30, length: 280, scale: 0.55, color: '#FF8C00' },
  // front sides (shorter, fanning out)
  { type: 'gerbera', angle: -64, length: 235, scale: 0.55, color: '#FF1493' },
  { type: 'tulip', angle: 64, length: 235, scale: 0.55, color: 'yellow' },
  { type: 'rose', angle: -56, length: 250, scale: 0.5, color: 'red' },
  { type: 'tulip', angle: 56, length: 250, scale: 0.5, color: 'purple' },
  // front low
  { type: 'rose', angle: -20, length: 235, scale: 0.55, color: 'red' },
  { type: 'gerbera', angle: 20, length: 245, scale: 0.55, color: '#FFD700' },
  { type: 'tulip', angle: -8, length: 245, scale: 0.5, color: 'yellow' },
  { type: 'rose', angle: 8, length: 250, scale: 0.55, color: 'white' },
]

function drawBouquet(
  canvas: HTMLCanvasElement,
  speed: number,
  onDone: () => void
) {
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  const delay = Math.max(3, 40 - speed * 3)
  let cancelled = false
  const steps: Step[] = []

  function stem(angleDeg: number, length: number): [number, number] {
    const a = ((angleDeg - 90) * Math.PI) / 180
    const ex = WRAP_X + Math.cos(a) * length
    const ey = WRAP_Y + Math.sin(a) * length
    const segs = 18
    const perpX = -Math.sin(a)
    const perpY = Math.cos(a)
    const curve = (angleDeg / 60) * 14
    const pts: [number, number][] = []
    for (let i = 0; i <= segs; i++) {
      const t = i / segs
      const x = WRAP_X + (ex - WRAP_X) * t + perpX * Math.sin(t * Math.PI) * curve
      const y = WRAP_Y + (ey - WRAP_Y) * t + perpY * Math.sin(t * Math.PI) * curve
      pts.push([x, y])
    }
    for (let i = 1; i <= segs; i++) {
      steps.push(() => {
        ctx.strokeStyle = '#2E8B57'
        ctx.lineWidth = 6
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(pts[i - 1][0], pts[i - 1][1])
        ctx.lineTo(pts[i][0], pts[i][1])
        ctx.stroke()
      })
    }
    // small leaf halfway
    const mid = pts[Math.floor(segs * 0.55)]
    const dir = angleDeg < 0 ? -1 : 1
    steps.push(() => {
      ctx.save()
      ctx.translate(mid[0], mid[1])
      ctx.rotate((angleDeg * Math.PI) / 180 + (dir * Math.PI) / 4)
      ctx.fillStyle = '#3CB371'
      ctx.strokeStyle = '#1F6B3B'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.ellipse(22, 0, 28, 10, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    })
    return [ex, ey]
  }

  function rose(cx: number, cy: number, scale: number, hue: RoseHue) {
    const palettes: Record<RoseHue, string[]> = {
      red: ['#5A0010', '#8B0000', '#B22222', '#DC143C', '#FF4D6D'],
      pink: ['#6E1E48', '#AD1457', '#E91E63', '#F06292', '#F8BBD0'],
      white: ['#8B7355', '#D4B896', '#F5DEB3', '#FAF0E6', '#FFFAF0'],
    }
    const cols = palettes[hue]
    const layers = [
      { r: 9, petals: 1, c: cols[0] },
      { r: 18, petals: 5, c: cols[1] },
      { r: 28, petals: 7, c: cols[2] },
      { r: 40, petals: 9, c: cols[3] },
      { r: 52, petals: 12, c: cols[4] },
    ]
    const stroke = hue === 'white' ? '#8B7355' : '#3A0008'
    layers.forEach((layer) => {
      for (let p = 0; p < layer.petals; p++) {
        const angle = (p / layer.petals) * Math.PI * 2 + layer.r * 0.05
        const r = layer.r * scale
        steps.push(() => {
          ctx.save()
          ctx.translate(cx, cy)
          ctx.rotate(angle)
          ctx.fillStyle = layer.c
          ctx.strokeStyle = stroke
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.ellipse(r * 0.55, 0, r * 0.7, r * 0.45, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
          ctx.restore()
        })
      }
    })
    steps.push(() => {
      ctx.fillStyle = cols[0]
      ctx.beginPath()
      ctx.arc(cx, cy, 6 * scale, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  function gerbera(cx: number, cy: number, scale: number, color: string) {
    const outerPetals = 22
    const innerPetals = 18
    const outerR = 90 * scale
    const innerR = 56 * scale
    const stroke = '#6B3A00'
    for (let i = 0; i < outerPetals; i++) {
      const a = (i / outerPetals) * Math.PI * 2
      steps.push(() => {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(a)
        ctx.fillStyle = color
        ctx.strokeStyle = stroke
        ctx.lineWidth = 0.8
        ctx.beginPath()
        ctx.ellipse(outerR * 0.55, 0, outerR * 0.55, 8 * scale, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.restore()
      })
    }
    for (let i = 0; i < innerPetals; i++) {
      const a = (i / innerPetals) * Math.PI * 2 + 0.13
      steps.push(() => {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(a)
        ctx.fillStyle = '#FFB347'
        ctx.strokeStyle = '#8B4513'
        ctx.lineWidth = 0.8
        ctx.beginPath()
        ctx.ellipse(innerR * 0.55, 0, innerR * 0.55, 6 * scale, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.restore()
      })
    }
    steps.push(() => {
      ctx.fillStyle = '#3B1F00'
      ctx.beginPath()
      ctx.arc(cx, cy, 22 * scale, 0, Math.PI * 2)
      ctx.fill()
      for (let i = 0; i < 30; i++) {
        const a = Math.random() * Math.PI * 2
        const r = Math.random() * 18 * scale
        ctx.fillStyle = i % 2 ? '#FFC107' : '#FFD700'
        ctx.beginPath()
        ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 1.4, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }

  function tulip(cx: number, cy: number, scale: number, hue: TulipHue) {
    const palettes: Record<TulipHue, [string, string, string, string]> = {
      purple: ['#7B1FA2', '#9C27B0', '#BA68C8', '#3B0058'],
      red: ['#B22222', '#DC143C', '#FF6347', '#5C0000'],
      yellow: ['#DAA520', '#FFD700', '#FFE066', '#7A5C00'],
    }
    const [c1, c2, c3, stroke] = palettes[hue]
    const petals = [
      { x: -20 * scale, color: c1, w: 26 * scale, h: 70 * scale, rot: -0.28 },
      { x: 20 * scale, color: c2, w: 26 * scale, h: 70 * scale, rot: 0.28 },
      { x: 0, color: c3, w: 32 * scale, h: 80 * scale, rot: 0 },
    ]
    petals.forEach((p) => {
      const frames = 8
      for (let i = 1; i <= frames; i++) {
        steps.push(() => {
          const f = i / frames
          ctx.save()
          ctx.translate(cx + p.x, cy)
          ctx.rotate(p.rot)
          ctx.fillStyle = p.color
          ctx.strokeStyle = stroke
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.ellipse(0, -p.h * 0.3, p.w * f, p.h * f, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
          ctx.restore()
        })
      }
    })
  }

  function wrap() {
    // brown kraft paper cone
    steps.push(() => {
      ctx.save()
      ctx.fillStyle = '#A0826D'
      ctx.strokeStyle = '#5C4326'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(WRAP_X - 230, WRAP_Y - 10)
      ctx.lineTo(WRAP_X + 230, WRAP_Y - 10)
      ctx.lineTo(WRAP_X + 80, WRAP_Y + 160)
      ctx.lineTo(WRAP_X - 80, WRAP_Y + 160)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      // folds
      ctx.strokeStyle = '#6B4F32'
      ctx.lineWidth = 1.5
      const folds = [
        [WRAP_X - 180, WRAP_X - 50],
        [WRAP_X - 80, WRAP_X - 20],
        [WRAP_X + 80, WRAP_X + 20],
        [WRAP_X + 180, WRAP_X + 50],
      ]
      folds.forEach(([x1, x2]) => {
        ctx.beginPath()
        ctx.moveTo(x1, WRAP_Y - 10)
        ctx.lineTo(x2, WRAP_Y + 160)
        ctx.stroke()
      })
      ctx.restore()
    })
    // pink ribbon + bow
    steps.push(() => {
      ctx.save()
      ctx.fillStyle = '#E91E63'
      ctx.strokeStyle = '#880E4F'
      ctx.lineWidth = 2
      ctx.fillRect(WRAP_X - 130, WRAP_Y + 70, 260, 22)
      ctx.strokeRect(WRAP_X - 130, WRAP_Y + 70, 260, 22)
      // bow loops
      ctx.beginPath()
      ctx.ellipse(WRAP_X - 55, WRAP_Y + 81, 42, 24, -0.3, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(WRAP_X + 55, WRAP_Y + 81, 42, 24, 0.3, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      // bow knot
      ctx.fillStyle = '#C2185B'
      ctx.beginPath()
      ctx.arc(WRAP_X, WRAP_Y + 81, 13, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      // ribbon tails
      ctx.fillStyle = '#E91E63'
      ctx.beginPath()
      ctx.moveTo(WRAP_X - 8, WRAP_Y + 92)
      ctx.lineTo(WRAP_X - 40, WRAP_Y + 150)
      ctx.lineTo(WRAP_X - 20, WRAP_Y + 150)
      ctx.lineTo(WRAP_X, WRAP_Y + 95)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(WRAP_X + 8, WRAP_Y + 92)
      ctx.lineTo(WRAP_X + 40, WRAP_Y + 150)
      ctx.lineTo(WRAP_X + 20, WRAP_Y + 150)
      ctx.lineTo(WRAP_X, WRAP_Y + 95)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    })
  }

  // Queue stems first
  const tops: [number, number][] = ARRANGEMENT.map((f) =>
    stem(f.angle, f.length)
  )

  // Queue flowers (back to front order = arrangement order)
  ARRANGEMENT.forEach((f, i) => {
    const [x, y] = tops[i]
    if (f.type === 'rose') rose(x, y, f.scale, f.color as RoseHue)
    else if (f.type === 'gerbera') gerbera(x, y, f.scale, f.color)
    else tulip(x, y, f.scale, f.color as TulipHue)
  })

  // Wrapper on top of stem bottoms
  wrap()

  let idx = 0
  function tick() {
    if (cancelled) return
    if (idx >= steps.length) {
      onDone()
      return
    }
    steps[idx++]()
    window.setTimeout(tick, delay)
  }
  tick()

  return () => {
    cancelled = true
  }
}

export default function SunflowerCanvas({ speed }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const smileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const cancel = drawBouquet(canvas, speed, () => {
      showSmile()
    })

    return cancel
  }, [speed])

  function showSmile() {
    const el = smileRef.current
    if (!el) return
    const lines = [
      'Me gustas porque tienes ese no sé qué,',
      'que se encuentra solo en las personas',
      'que vale la pena descubrir.',
    ]
    el.innerHTML = ''

    let globalIndex = 0
    lines.forEach((line, lineIdx) => {
      const lineDiv = document.createElement('div')
      lineDiv.className = lineIdx === lines.length - 1 ? 'smile-line smile-final' : 'smile-line'
      el.appendChild(lineDiv)

      if (line === '') {
        lineDiv.style.height = '0.6em'
        return
      }

      line.split('').forEach((char) => {
        const span = document.createElement('span')
        span.className = 'letter'
        span.innerHTML = char === ' ' ? '&nbsp;' : char
        lineDiv.appendChild(span)
        gsap.fromTo(
          span,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            delay: globalIndex * 0.04,
            ease: 'power2.out',
          }
        )
        globalIndex++
      })
    })

    gsap.to(el, { opacity: 1, duration: 0.5 })
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        <canvas
          id="turtleCanvas"
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
        />
        <div className="smile-text" ref={smileRef} />
      </div>
    </>
  )
}
