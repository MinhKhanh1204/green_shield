import React, { memo, useEffect, useRef } from 'react'

const ADVANTAGES_VIDEO_URL = 'https://res.cloudinary.com/dnini39bp/video/upload/v1774527138/IntroGSM_gqsftr.mp4'
const ADVANTAGES_VIDEO_URL_MEDIUM = 'https://res.cloudinary.com/dnini39bp/video/upload/f_auto,q_auto:good,w_1280,vc_auto,br_1400k/v1774527138/IntroGSM_gqsftr.mp4'
const ADVANTAGES_VIDEO_URL_LITE = 'https://res.cloudinary.com/dnini39bp/video/upload/f_auto,q_auto:eco,w_960,vc_auto,br_900k/v1774527138/IntroGSM_gqsftr.mp4'
const PLAYBACK_VISIBILITY_THRESHOLD = 0.45

function AdvantagesSection() {
  const videoRef = useRef(null)

  const selectedVideoSrc = (() => {
    if (typeof window === 'undefined') return ADVANTAGES_VIDEO_URL

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    const saveData = connection?.saveData === true
    const slowNetwork = /(^|\b)(2g|slow-2g|3g)(\b|$)/i.test(String(connection?.effectiveType || ''))
    const lowCpu = (navigator.hardwareConcurrency || 8) <= 4
    const isSmallViewport = window.innerWidth <= 900

    if (saveData || slowNetwork || (lowCpu && isSmallViewport)) return ADVANTAGES_VIDEO_URL_LITE
    if (lowCpu || isSmallViewport) return ADVANTAGES_VIDEO_URL_MEDIUM
    return ADVANTAGES_VIDEO_URL
  })()

  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return

    let frameId

    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(() => {
        const isPlaying = !vid.paused && !vid.ended && vid.readyState > 2
        const shouldPlay = entry.isIntersecting && entry.intersectionRatio >= PLAYBACK_VISIBILITY_THRESHOLD

        if (shouldPlay && !isPlaying) {
          vid.play().catch(() => { })
          return
        }

        if (!shouldPlay && isPlaying) vid.pause()
      })
    }, { threshold: [0, PLAYBACK_VISIBILITY_THRESHOLD, 1] })

    observer.observe(vid)

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
    }
  }, [])

  return (
    <section id="advantages" className="section section--advantages">
      <div className="advantages-video" aria-label="Advantages intro video">
        <video
          ref={videoRef}
          src={selectedVideoSrc}
          muted
          playsInline
          loop
          autoPlay
          preload="auto"
          disablePictureInPicture
        />
      </div>
    </section>
  )
}

export default memo(AdvantagesSection)
