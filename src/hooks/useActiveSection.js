import { useEffect, useState } from 'react'

const DEFAULT_THRESHOLDS = Array.from({ length: 21 }, (_, index) => index / 20)

function getHeaderOffset() {
  const header = document.querySelector('.header')
  return header ? Math.ceil(header.getBoundingClientRect().height + 12) : 88
}

// Observe sections and choose the active one based on visibility + proximity to viewport top.
export default function useActiveSection(selector = '.section', options = {}) {
  const [activeId, setActiveId] = useState('')
  const disabled = options?.disabled

  useEffect(() => {
    if (disabled) return

    const elems = Array.from(document.querySelectorAll(selector))
    if (!elems.length) return

    const root = options.root ?? document.querySelector('.app-scroll') ?? null
    const threshold = options.threshold ?? DEFAULT_THRESHOLDS
    const ratios = new Map(elems.map((el) => [el.id, 0]))
    let rafId = 0

    const queuePick = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(pickActiveId)
    }

    const pickActiveId = () => {
      let bestId = ''
      let bestScore = Number.NEGATIVE_INFINITY
      const headerOffset = getHeaderOffset()
      const rootRect = root?.getBoundingClientRect?.()
      const anchorTop = rootRect ? rootRect.top + headerOffset : headerOffset

      elems.forEach((el) => {
        const ratio = ratios.get(el.id) ?? 0
        if (ratio <= 0) {
          el.classList.remove('active')
          return
        }

        const rect = el.getBoundingClientRect()
        const distanceFromTop = Math.abs(rect.top - anchorTop)
        const score = ratio * 1000 - distanceFromTop

        if (score > bestScore) {
          bestScore = score
          bestId = el.id
        }
      })

      if (!bestId) {
        const fallback = elems.find((el) => el.getBoundingClientRect().top >= anchorTop) ?? elems[0]
        bestId = fallback?.id ?? ''
      }

      elems.forEach((el) => {
        if (el.id === bestId) el.classList.add('active')
        else el.classList.remove('active')
      })

      setActiveId((prev) => (prev === bestId ? prev : bestId))
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target
        const id = el.id
        if (!id) return

        ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0)

        if (entry.isIntersecting) {
          const children = el.querySelectorAll('.fade-up')
          children.forEach((child, index) => {
            if (!child.classList.contains('in')) {
              setTimeout(() => child.classList.add('in'), index * 80)
            }
          })
        }
      })

      queuePick()
    }, {
      root,
      rootMargin: `-${getHeaderOffset()}px 0px -35% 0px`,
      threshold,
    })

    elems.forEach((el) => observer.observe(el))
    pickActiveId()

    const scrollTarget = root || window
    scrollTarget.addEventListener('scroll', queuePick, { passive: true })
    window.addEventListener('resize', queuePick)

    return () => {
      cancelAnimationFrame(rafId)
      scrollTarget.removeEventListener('scroll', queuePick)
      window.removeEventListener('resize', queuePick)
      observer.disconnect()
    }
  }, [selector, disabled, options.root, options.threshold])

  return activeId
}
