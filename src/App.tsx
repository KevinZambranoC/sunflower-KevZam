import { useRef, useState, useCallback } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import './App.css'
import SunflowerCanvas from './SunflowerCanvas'
import MusicButton from './MusicButton'
import { useYouTubePlayer } from './useYouTubePlayer'

gsap.registerPlugin(useGSAP)

const VIDEO_ID = '1iDrQta26zo' // Milky - Just The Way You Are (Official Audio)

export default function App() {
  const [phase, setPhase] = useState<'initial' | 'drawing'>('initial')
  const [speed, setSpeed] = useState(5)
  const [drawingSpeed, setDrawingSpeed] = useState(5)
  const initialRef = useRef<HTMLDivElement>(null)
  const drawingRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  const { play, togglePause, getState } = useYouTubePlayer(VIDEO_ID)

  useGSAP(() => {
    if (!btnRef.current) return
    gsap.to(btnRef.current, {
      scale: 1.1,
      boxShadow: '0 10px 30px rgba(255,162,22,0.8)',
      duration: 0.75,
      yoyo: true,
      repeat: -1,
      ease: 'power1.inOut',
    })
  }, [])

  const handleOpen = useCallback(() => {
    setDrawingSpeed(speed)
    const init = initialRef.current
    const drawing = drawingRef.current
    if (!init || !drawing) return

    gsap.killTweensOf(btnRef.current)
    play()

    gsap.to(init, {
      opacity: 0,
      scale: 0.9,
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => {
        init.style.display = 'none'
        drawing.style.display = 'flex'
        gsap.fromTo(
          drawing,
          { opacity: 0 },
          { opacity: 1, duration: 0.8, ease: 'power2.inOut' }
        )
        setPhase('drawing')
      },
    })
  }, [speed, play])

  return (
    <>
      <div className="initial-interface" ref={initialRef}>
        <h1 className="page-title">Un girasol para ti mi socia, para alegrarte el día 🌻</h1>
        <img src="/dog.gif" alt="Perro con girasol" className="dog-gif" />
        <button ref={btnRef} onClick={handleOpen}>
          Abrir girasol
        </button>
        <div className="speed-control">
          <div className="speed-label">Velocidad de la flor:</div>
          <input
            type="range"
            className="speed-slider"
            min={1}
            max={10}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <div className="speed-value">{speed}</div>
        </div>
      </div>

      <div
        className="drawing-interface"
        ref={drawingRef}
        style={{ display: 'none', opacity: 0 }}
      >
        {phase === 'drawing' && <SunflowerCanvas speed={drawingSpeed} />}
      </div>

      {phase === 'drawing' && (
        <MusicButton togglePause={togglePause} getState={getState} />
      )}

      <div className="credits">
        by{' '}
        <a href="https://github.com/KevinZambranoC" target="_blank" rel="noreferrer">
          KevinZam
        </a>
      </div>
    </>
  )
}
