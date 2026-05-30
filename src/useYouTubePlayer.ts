import { useEffect, useRef, useCallback } from 'react'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export function useYouTubePlayer(videoId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null)
  const readyRef = useRef(false)
  const pendingPlay = useRef(false)

  useEffect(() => {
    if (!document.getElementById('yt-api-script')) {
      const script = document.createElement('script')
      script.id = 'yt-api-script'
      script.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(script)
    }

    const container = document.createElement('div')
    container.id = 'yt-player-container'
    container.style.cssText =
      'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;'
    document.body.appendChild(container)

    const init = () => {
      playerRef.current = new window.YT.Player('yt-player-container', {
        videoId,
        playerVars: {
          autoplay: 0,
          loop: 1,
          playlist: videoId,
          controls: 0,
          fs: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            readyRef.current = true
            playerRef.current?.setVolume(60)
            if (pendingPlay.current) {
              playerRef.current?.playVideo()
              pendingPlay.current = false
            }
          },
        },
      })
    }

    if (window.YT?.Player) {
      init()
    } else {
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        prev?.()
        init()
      }
    }

    return () => {
      playerRef.current?.destroy()
      document.getElementById('yt-player-container')?.remove()
    }
  }, [videoId])

  const play = useCallback(() => {
    if (readyRef.current) {
      playerRef.current?.playVideo()
    } else {
      pendingPlay.current = true
    }
  }, [])

  const togglePause = useCallback(() => {
    const state = playerRef.current?.getPlayerState()
    if (state === 1) {
      playerRef.current?.pauseVideo()
    } else {
      playerRef.current?.playVideo()
    }
  }, [])

  const getState = useCallback(() => {
    return playerRef.current?.getPlayerState() ?? -1
  }, [])

  return { play, togglePause, getState }
}
