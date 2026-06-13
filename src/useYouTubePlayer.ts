import { useEffect, useCallback } from 'react'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

// Module-level singletons so StrictMode double-mount doesn't tear down the player.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let globalPlayer: any = null
let globalReady = false
let pendingPlay = false

export function useYouTubePlayer(videoId: string) {
  useEffect(() => {
    if (globalPlayer) return

    if (!document.getElementById('yt-api-script')) {
      const script = document.createElement('script')
      script.id = 'yt-api-script'
      script.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(script)
    }

    if (!document.getElementById('yt-player-container')) {
      const container = document.createElement('div')
      container.id = 'yt-player-container'
      container.style.cssText =
        'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;'
      document.body.appendChild(container)
    }

    const init = () => {
      if (globalPlayer) return
      globalPlayer = new window.YT.Player('yt-player-container', {
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
            globalReady = true
            try {
              globalPlayer.setVolume(60)
            } catch {
              /* ignore */
            }
            if (pendingPlay) {
              try {
                globalPlayer.playVideo()
              } catch {
                /* ignore */
              }
              pendingPlay = false
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
    // No cleanup: the player is a singleton that lives for the app lifetime.
  }, [videoId])

  const play = useCallback(() => {
    if (globalReady && typeof globalPlayer?.playVideo === 'function') {
      try {
        globalPlayer.playVideo()
        return
      } catch {
        /* fall through to pending */
      }
    }
    pendingPlay = true
  }, [])

  const togglePause = useCallback(() => {
    if (typeof globalPlayer?.getPlayerState !== 'function') return
    try {
      const state = globalPlayer.getPlayerState()
      if (state === 1) globalPlayer.pauseVideo()
      else globalPlayer.playVideo()
    } catch {
      /* ignore */
    }
  }, [])

  const getState = useCallback(() => {
    if (typeof globalPlayer?.getPlayerState !== 'function') return -1
    try {
      return globalPlayer.getPlayerState()
    } catch {
      return -1
    }
  }, [])

  return { play, togglePause, getState }
}
