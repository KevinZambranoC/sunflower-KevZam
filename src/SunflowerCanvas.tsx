import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import './App.css'

interface Props {
  speed: number
}

const CANVAS_SIZE = 1000

function drawSunflower(
  canvas: HTMLCanvasElement,
  speed: number,
  onDone: () => void
) {
  const ctx = canvas.getContext('2d')!
  const W = CANVAS_SIZE
  const H = CANVAS_SIZE

  // fill black
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, W, H)

  const scaleFactor = Math.min(W, H) / 133

  // Turtle state
  let tx = W / 2
  let ty = H / 2
  let heading = 0
  let penDown = true

  function scaled(x: number, y: number) {
    return [W / 2 + x * scaleFactor, H / 2 - y * scaleFactor] as [
      number,
      number,
    ]
  }

  function moveTo(x: number, y: number) {
    const [sx, sy] = scaled(x, y)
    if (penDown) {
      ctx.lineTo(sx, sy)
      ctx.stroke()
    } else {
      ctx.moveTo(sx, sy)
    }
    tx = sx
    ty = sy
  }

  function pu() {
    penDown = false
  }
  function pd() {
    penDown = true
  }

  function setColor(color: string) {
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = 3
  }

  function setHeading(angle: number) {
    heading = angle
  }

  function right(angle: number) {
    heading -= angle
  }
  function left(angle: number) {
    heading += angle
  }

  function circleArc(radius: number, extent: number) {
    const centerAngle = heading + 90
    const cx = tx + radius * Math.cos((centerAngle * Math.PI) / 180)
    const cy = ty + radius * Math.sin((centerAngle * Math.PI) / 180)

    const startAngle = ((heading - 90) * Math.PI) / 180
    const endAngle = startAngle + (extent * Math.PI) / 180

    ctx.beginPath()
    ctx.arc(cx, cy, radius, startAngle, endAngle)
    ctx.stroke()

    tx = cx + radius * Math.cos(endAngle)
    ty = cy + radius * Math.sin(endAngle)
    heading += extent
  }

  function stamp(seedIndex: number) {
    ctx.save()
    ctx.translate(tx, ty)
    ctx.rotate((heading * Math.PI) / 180)
    ctx.beginPath()
    ctx.arc(0, 0, 4, 0, 2 * Math.PI)
    ctx.fillStyle = '#8B4513'
    ctx.fill()
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.restore()
    void seedIndex
  }

  const petalDelay = Math.max(10, 100 - speed * 9)
  const segDelay = Math.max(10, 100 - speed * 9)
  const seedDelay = Math.max(10, 100 - speed * 9)

  let cancelled = false

  function schedule(fn: () => void, delay: number) {
    return window.setTimeout(() => {
      if (!cancelled) fn()
    }, delay)
  }

  // Draw petals: 16 petals x 18 segments
  let petal = 0
  let seg = 0

  function drawSegment() {
    if (cancelled) return
    if (petal >= 16) {
      // draw closing arc then center
      setColor('#FFA216')
      ctx.beginPath()
      ctx.moveTo(tx, ty)
      circleArc(40, 24)
      startCenter()
      return
    }

    if (seg >= 18) {
      // close this petal
      setColor('#FFA216')
      ctx.beginPath()
      ctx.moveTo(tx, ty)
      circleArc(40, 24)
      petal++
      seg = 0
      schedule(drawSegment, petalDelay)
      return
    }

    setColor('#FFA216')
    ctx.beginPath()
    ctx.moveTo(tx, ty)
    right(90)
    circleArc(150 - seg * 6, 90)
    left(90)
    circleArc(150 - seg * 6, 90)
    right(180)

    seg++
    schedule(drawSegment, segDelay)
  }

  let seedIndex = 0

  function startCenter() {
    seedIndex = 0
    setColor('black')
    schedule(drawSeed, seedDelay)
  }

  function drawSeed() {
    if (cancelled) return
    if (seedIndex >= 140) {
      onDone()
      return
    }

    const r = 0.47 * Math.sqrt(seedIndex)
    const theta = (seedIndex * 137.508 * Math.PI) / 180
    const x = r * Math.cos(theta)
    const y = r * Math.sin(theta)

    pu()
    moveTo(x, y - 5.5)
    setHeading(seedIndex * 137.508)
    pd()
    stamp(seedIndex)

    seedIndex++
    schedule(drawSeed, seedDelay)
  }

  // init canvas beginPath
  ctx.beginPath()
  ctx.moveTo(tx, ty)

  // start
  schedule(drawSegment, 0)

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

    const cancel = drawSunflower(canvas, speed, () => {
      showSmile()
    })

    return cancel
  }, [speed])

  function showSmile() {
    const el = smileRef.current
    if (!el) return
    const text = 'para ti mi socia querida :)'
    el.innerHTML = ''

    text.split('').forEach((char, i) => {
      const span = document.createElement('span')
      span.className = 'letter'
      span.textContent = char === ' ' ? ' ' : char
      el.appendChild(span)
      gsap.fromTo(
        span,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, delay: i * 0.1, ease: 'power2.out' }
      )
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
