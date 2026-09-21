import { useState } from 'react'

const COUNT = 34
const PETAL_COLORS = ['#FFD700', '#FFC107', '#FFEB3B', '#F9A825', '#FFE066']

interface BgFlower {
  left: number
  top: number
  size: number
  petals: number
  color: string
  rotate: number
  duration: number
  delay: number
  opacity: number
}

function randomFlowers(): BgFlower[] {
  return Array.from({ length: COUNT }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 28 + Math.random() * 60,
    petals: 6 + Math.floor(Math.random() * 7),
    color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
    rotate: Math.random() * 360,
    duration: 6 + Math.random() * 8,
    delay: Math.random() * 3,
    opacity: 0.25 + Math.random() * 0.35,
  }))
}

function Daisy({ petals, color }: { petals: number; color: string }) {
  return (
    <svg viewBox="-50 -50 100 100" width="100%" height="100%">
      {Array.from({ length: petals }, (_, i) => (
        <ellipse
          key={i}
          cx="0"
          cy="-24"
          rx="11"
          ry="24"
          fill={color}
          stroke="#B8860B"
          strokeWidth="1"
          transform={`rotate(${(360 / petals) * i})`}
        />
      ))}
      <circle r="14" fill="#8B5A00" />
      <circle r="9" fill="#5C3A00" />
    </svg>
  )
}

export default function YellowFlowersBackground() {
  const [flowers] = useState(randomFlowers)

  return (
    <div className="yellow-bg" aria-hidden="true">
      {flowers.map((f, i) => (
        <div
          key={i}
          className="yellow-bg-flower"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            ['--rot' as string]: `${f.rotate}deg`,
            animationDuration: `${f.duration}s`,
            animationDelay: `-${f.delay}s`,
          }}
        >
          <Daisy petals={f.petals} color={f.color} />
        </div>
      ))}
    </div>
  )
}
