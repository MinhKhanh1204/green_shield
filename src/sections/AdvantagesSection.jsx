import React, { useEffect, useRef } from 'react'

export default function AdvantagesSection() {
  const videoRef = useRef(null)

  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return

    let frameId
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(() => {
        const isPlaying = !vid.paused && !vid.ended && vid.readyState > 2
        if (entry.isIntersecting && !isPlaying) vid.play().catch(() => {})
        else if (!entry.isIntersecting && isPlaying) vid.pause()
      })
    }, { threshold: [0, 0.45, 1] })

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
          src="https://res.cloudinary.com/dnini39bp/video/upload/Intro-02_w2ktdr.mp4"
          muted
          playsInline
          loop
          preload="metadata"
        />
      </div>
    </section>
  )
}
