import { useState } from 'react'
import './MusicButton.css'

interface Props {
  togglePause: () => void
  getState: () => number
}

export default function MusicButton({ togglePause, getState }: Props) {
  const [playing, setPlaying] = useState(true)

  function handleClick() {
    togglePause()
    const state = getState()
    // state 1 = playing → will pause; state 2 = paused → will play
    setPlaying(state !== 1)
  }

  return (
    <button className="music-btn" onClick={handleClick} title={playing ? 'Pausar música' : 'Reproducir música'}>
      {playing ? (
        // pause icon
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        // play icon
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <polygon points="5,3 19,12 5,21" />
        </svg>
      )}
    </button>
  )
}
