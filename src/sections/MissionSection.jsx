import React, { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Globe from 'globe.gl'
import { MeshBasicMaterial } from 'three'
import worldDotsData from './world.dots.json'
import vietnamDotsData from './vietnam.dots.json'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslation } from 'react-i18next'
import { AuroraText } from '../components/ui/aurora-text'
import hyacinthImage from '../assets/mission.jpg'
import marketImage from '../assets/market.png'
import transparencyVideo from '../assets/transparency.mp4'
import './MissionSection.css'

const VIETNAM = { lat: 14, lng: 108 }
const CAMERA_NEAR_ALTITUDE = 2.4
const CAMERA_FAR_ALTITUDE = 1.1
const DESKTOP_RIPPLE_BREAKPOINT = 1024
const RIPPLE_JQUERY_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js'
const RIPPLE_PLUGIN_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jquery.ripples/0.5.3/jquery.ripples.min.js'
const TRANSPARENCY_CONTENT_MODE = 'hover-content'

let rippleLoaderPromise = null

gsap.registerPlugin(ScrollTrigger)

function clamp(value, min, max) {
   return Math.min(max, Math.max(min, value))
}

function lerp(start, end, amount) {
   return start + (end - start) * amount
}

function mapRange(value, inMin, inMax, outMin, outMax) {
   if (inMax === inMin) return outMin
   const ratio = clamp((value - inMin) / (inMax - inMin), 0, 1)
   return lerp(outMin, outMax, ratio)
}

function easeOutCubic(t) {
   return 1 - Math.pow(1 - t, 3)
}

function easedRange(value, inMin, inMax) {
   return easeOutCubic(clamp(mapRange(value, inMin, inMax, 0, 1), 0, 1))
}

function easeOutExpo(t) {
   if (t >= 1) return 1
   return 1 - Math.pow(2, -10 * t)
}

function formatAnimatedNumber(value, decimals = 0) {
   const rounded = decimals > 0
      ? Number(value).toFixed(decimals)
      : String(Math.round(value))

   if (decimals > 0) {
      const [intPart, decimalPart] = rounded.split('.')
      return `${Number(intPart).toLocaleString('en-US')}.${decimalPart}`
   }

   return Number(rounded).toLocaleString('en-US')
}

function CountUpNumber({
   target,
   duration = 1400,
   decimals = 0,
   prefix = '',
   suffix = '',
   className = '',
   play = true,
   replayKey = 'default',
}) {
   const elRef = useRef(null)
   const hasStartedRef = useRef(false)
   const rafIdRef = useRef(null)

   useEffect(() => {
      const element = elRef.current
      if (!element) return undefined

      element.textContent = `${prefix}${formatAnimatedNumber(0, decimals)}${suffix}`

      if (!play) {
         hasStartedRef.current = false
         if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
         return undefined
      }

      const root = document.querySelector('.app-scroll') || null
      const observer = new IntersectionObserver(
         (entries) => {
            const [entry] = entries
            if (!entry?.isIntersecting || hasStartedRef.current) return

            hasStartedRef.current = true
            const startTime = performance.now()

            const update = (now) => {
               const progress = Math.min((now - startTime) / duration, 1)
               const eased = easeOutExpo(progress)
               const value = eased * target

               element.textContent = `${prefix}${formatAnimatedNumber(value, decimals)}${suffix}`

               if (progress < 1) {
                  rafIdRef.current = requestAnimationFrame(update)
               }
            }

            rafIdRef.current = requestAnimationFrame(update)
            observer.disconnect()
         },
         {
            root,
            threshold: 0.32,
            rootMargin: '0px 0px -6% 0px',
         },
      )

      observer.observe(element)

      return () => {
         observer.disconnect()
         if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
      }
   }, [decimals, duration, play, prefix, replayKey, suffix, target])

   return <span className={className} ref={elRef} />
}

function sampleDots(dots, stride) {
   if (stride <= 1) return dots
   const sampled = []

   for (let i = 0; i < dots.length; i += stride) {
      sampled.push(dots[i])
   }

   return sampled
}

function getVisibilityStyles(opacity) {
   const hidden = opacity < 0.05
   return {
      opacity,
      visibility: hidden ? 'hidden' : 'visible',
      pointerEvents: hidden ? 'none' : 'auto',
   }
}

function splitSubtitleLines(text) {
   if (!text) return []
   const lines = text.match(/[^.!?]+[.!?]?/g)
   if (!lines) return [text]
   return lines
      .map((line) => line.trim().replace(/[.!?]+$/g, ''))
      .filter(Boolean)
}

function parseLocaleNumber(value, fallback = 0) {
   if (value == null) return fallback
   const normalized = String(value).trim().replace(/\s/g, '').replace(',', '.')
   const parsed = Number.parseFloat(normalized)
   return Number.isFinite(parsed) ? parsed : fallback
}

function loadExternalScript(src) {
   return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`)
      if (existing) {
         if (existing.dataset.loaded === 'true') {
            resolve()
            return
         }

         existing.addEventListener('load', () => resolve(), { once: true })
         existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true })
         return
      }

      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.onload = () => {
         script.dataset.loaded = 'true'
         resolve()
      }
      script.onerror = () => reject(new Error(`Failed to load ${src}`))
      document.body.appendChild(script)
   })
}

function ensureRipplePlugin() {
   if (typeof window === 'undefined') return Promise.reject(new Error('Window is not available'))

   if (window.$?.fn?.ripples) return Promise.resolve(window.$)

   if (!rippleLoaderPromise) {
      rippleLoaderPromise = (async () => {
         if (!window.$) {
            await loadExternalScript(RIPPLE_JQUERY_URL)
         }

         if (!window.$?.fn?.ripples) {
            await loadExternalScript(RIPPLE_PLUGIN_URL)
         }

         if (!window.$?.fn?.ripples) {
            throw new Error('jQuery ripples plugin unavailable')
         }

         return window.$
      })().catch((error) => {
         rippleLoaderPromise = null
         throw error
      })
   }

   return rippleLoaderPromise
}

function shouldUseDesktopRipple(viewportWidth) {
   if (typeof window === 'undefined') return false

   if (viewportWidth < DESKTOP_RIPPLE_BREAKPOINT) return false

   const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
   if (prefersReducedMotion) return false

   const hasFinePointer = window.matchMedia?.('(pointer: fine)').matches
   const hoverCapable = window.matchMedia?.('(hover: hover)').matches

   return Boolean(hasFinePointer && hoverCapable)
}

function MissionSection() {
   const { t } = useTranslation()
   const missionRef = useRef(null)
   const missionActivatedRef = useRef(false)
   const storyRef = useRef(null)
   const globeMountRef = useRef(null)
   const morphRippleRef = useRef(null)
   const globeRef = useRef(null)
   const lastProgressRef = useRef(0)
   const targetProgressRef = useRef(0)
   const currentProgressRef = useRef(0)
   const committedProgressRef = useRef(0)
   const ringUpdateTickRef = useRef(0)
   const [progress, setProgress] = useState(0)
   const [isMissionNearViewport, setIsMissionNearViewport] = useState(false)
   const [activeCard, setActiveCard] = useState(null)
   const [viewportWidth, setViewportWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1366))
   const [globeSize, setGlobeSize] = useState({ width: 1100, height: 1100 })
   const [scene3MediaReady, setScene3MediaReady] = useState(false)

   const adaptiveProfile = useMemo(() => {
      const vw = viewportWidth
      const concurrency = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 6) : 6
      const isUltraLow = vw < 520 || concurrency <= 2
      const isLowEnd = vw < 768 || concurrency <= 4
      const isMidEnd = vw < 1200 || concurrency <= 8

      if (isUltraLow) {
         return {
            worldStride: 4,
            vietnamStride: 2,
            pointResolution: 2,
            worldRadius: 0.078,
            progressEpsilon: 0.0035,
            ringUpdateEvery: 4,
            ringPropagationSpeed: 1,
            ringRepeatPeriod: 2200,
         }
      }

      if (isLowEnd) {
         return {
            worldStride: 3,
            vietnamStride: 2,
            pointResolution: 3,
            worldRadius: 0.082,
            progressEpsilon: 0.0022,
            ringUpdateEvery: 2,
            ringPropagationSpeed: 1.15,
            ringRepeatPeriod: 1800,
         }
      }

      if (isMidEnd) {
         return {
            worldStride: 2,
            vietnamStride: 1,
            pointResolution: 3,
            worldRadius: 0.092,
            progressEpsilon: 0.0018,
            ringUpdateEvery: 1,
            ringPropagationSpeed: 1.25,
            ringRepeatPeriod: 1500,
         }
      }

      return {
         worldStride: 1,
         vietnamStride: 1,
         pointResolution: 4,
         worldRadius: 0.1,
         progressEpsilon: 0.0015,
         ringUpdateEvery: 1,
         ringPropagationSpeed: 1.3,
         ringRepeatPeriod: 1400,
      }
   }, [viewportWidth])

   const worldDots = useMemo(
      () => sampleDots(worldDotsData, adaptiveProfile.worldStride),
      [adaptiveProfile.worldStride],
   )

   const vietnamDots = useMemo(
      () => sampleDots(vietnamDotsData, adaptiveProfile.vietnamStride),
      [adaptiveProfile.vietnamStride],
   )

   const globePoints = useMemo(() => [...worldDots, ...vietnamDots], [worldDots, vietnamDots])

   useEffect(() => {
      const missionEl = missionRef.current
      if (!missionEl) return undefined

      const scroller = document.querySelector('.app-scroll')

      const observer = new IntersectionObserver(
         ([entry]) => {
            if (!entry.isIntersecting && entry.intersectionRatio <= 0) return
            if (missionActivatedRef.current) return

            missionActivatedRef.current = true
            setIsMissionNearViewport(true)
            observer.disconnect()
         },
         {
            root: scroller || null,
            rootMargin: '120% 0px 120% 0px',
            threshold: [0, 0.01],
         },
      )

      observer.observe(missionEl)
      return () => observer.disconnect()
   }, [])

   useEffect(() => {
      const updateSize = () => {
         const vw = window.innerWidth
         const next = clamp(vw * 0.74, 620, 980)
         setViewportWidth(vw)
         setGlobeSize({ width: next, height: next })
      }

      updateSize()
      window.addEventListener('resize', updateSize)
      return () => window.removeEventListener('resize', updateSize)
   }, [])

   useLayoutEffect(() => {
      if (!isMissionNearViewport) return undefined

      const story = storyRef.current
      if (!story) return undefined

      const scroller = document.querySelector('.app-scroll')
      const lerpFactor = 0.1
      const maxTargetStep = 0.065
      const settleEpsilon = 0.00045

      const initialProgress = committedProgressRef.current
      targetProgressRef.current = initialProgress
      currentProgressRef.current = initialProgress

      const tick = () => {
         const current = currentProgressRef.current
         const target = targetProgressRef.current
         const next = lerp(current, target, lerpFactor)
         const snapped = Math.abs(target - next) < settleEpsilon ? target : next

         currentProgressRef.current = snapped

         if (Math.abs(snapped - committedProgressRef.current) > adaptiveProfile.progressEpsilon) {
            committedProgressRef.current = snapped
            setProgress(snapped)
         }
      }

      const trigger = ScrollTrigger.create({
         trigger: story,
         scroller: scroller || undefined,
         start: 'top top',
         end: '+=240%',
         scrub: 1.7,
         invalidateOnRefresh: true,
         onUpdate: (self) => {
            const rawNext = clamp(self.progress, 0, 1)
            const prevTarget = targetProgressRef.current
            const dampedDelta = clamp(rawNext - prevTarget, -maxTargetStep, maxTargetStep)
            targetProgressRef.current = clamp(prevTarget + dampedDelta, 0, 1)
         },
         onRefresh: (self) => {
            const refreshed = clamp(self.progress, 0, 1)
            targetProgressRef.current = refreshed
            currentProgressRef.current = refreshed
            committedProgressRef.current = refreshed
            setProgress(refreshed)
         },
      })

      gsap.ticker.add(tick)

      return () => {
         gsap.ticker.remove(tick)
         trigger.kill()
      }
   }, [adaptiveProfile.progressEpsilon, isMissionNearViewport])

   useEffect(() => {
      const mount = globeMountRef.current
      if (!mount) return undefined

      // Keep globe instance alive while mission exists to avoid flicker/blank state on threshold toggles.
      if (!globeRef.current) {
         if (!isMissionNearViewport) return undefined

         mount.innerHTML = ''

         const instance = Globe()(mount)
            .backgroundColor('rgba(0,0,0,0)')
            .showGraticules(false)
            .globeImageUrl(null)
            .bumpImageUrl(null)
            .showAtmosphere(false)
            .globeMaterial(new MeshBasicMaterial({ transparent: true, opacity: 0 }))
            .pointLat('lat')
            .pointLng('lng')
            .pointsMerge(true)
            .pointColor(d => d.highlight
               ? 'rgba(34,197,94,1)'
               : 'rgba(64,84,92,0.42)'
            )
            .pointAltitude(d => d.highlight ? 0.02 : 0.005)
            .pointsTransitionDuration(0)
            .ringsData([{ lat: VIETNAM.lat, lng: VIETNAM.lng }])
            .ringLat('lat')
            .ringLng('lng')
            .ringColor(() => 'rgba(34,197,94,0.5)')

         const controls = instance.controls?.()
         if (controls) {
            controls.enableZoom = false
            controls.enablePan = false
            controls.enableRotate = false
            controls.autoRotate = false
         }

         instance.pointOfView(
            {
               lat: VIETNAM.lat,
               lng: VIETNAM.lng,
               altitude: CAMERA_NEAR_ALTITUDE,
            },
            0,
         )

         ringUpdateTickRef.current = 0
         globeRef.current = instance
      }

      const globe = globeRef.current
      if (!globe) return undefined

      globe
         .pointsData(globePoints)
         .pointResolution(adaptiveProfile.pointResolution)
         .pointRadius(d => d.highlight ? 0.18 : adaptiveProfile.worldRadius)
         .ringMaxRadius(() => 2.2)
         .ringPropagationSpeed(() => adaptiveProfile.ringPropagationSpeed)
         .ringRepeatPeriod(() => adaptiveProfile.ringRepeatPeriod)

      globe.width(globeSize.width)
      globe.height(globeSize.height)

      return undefined
   }, [adaptiveProfile.pointResolution, adaptiveProfile.ringPropagationSpeed, adaptiveProfile.ringRepeatPeriod, adaptiveProfile.worldRadius, globePoints, globeSize.height, globeSize.width, isMissionNearViewport])

   useEffect(() => {
      const mount = globeMountRef.current

      return () => {
         const instance = globeRef.current

         instance?._destructor?.()
         globeRef.current = null
         if (mount) mount.innerHTML = ''
      }
   }, [])

   useEffect(() => {
      const globe = globeRef.current
      if (!globe || !isMissionNearViewport) return

      if (Math.abs(progress - lastProgressRef.current) < adaptiveProfile.progressEpsilon) return
      lastProgressRef.current = progress
      ringUpdateTickRef.current += 1

      const rotateToVietnam = easedRange(progress, 0.28, 0.84)
      const cinematicMove = easedRange(progress, 0.62, 0.92)

      const lat = lerp(VIETNAM.lat + 9, VIETNAM.lat, rotateToVietnam)
      const lng = lerp(VIETNAM.lng - 24, VIETNAM.lng, rotateToVietnam)
      const altitude = lerp(CAMERA_NEAR_ALTITUDE, CAMERA_FAR_ALTITUDE, cinematicMove)

      if (ringUpdateTickRef.current % adaptiveProfile.ringUpdateEvery === 0) {
         globe.ringMaxRadius(() => lerp(1.3, 2.1, cinematicMove))
      }
      globe.pointOfView({ lat, lng, altitude }, 0)
   }, [adaptiveProfile.progressEpsilon, adaptiveProfile.ringUpdateEvery, isMissionNearViewport, progress])

   const isMobileViewport = viewportWidth <= 900
   const introFadeStart = isMobileViewport ? 0.38 : 0.22
   const introFadeEnd = isMobileViewport ? 0.56 : 0.4
   const introHold = 1 - easedRange(progress, introFadeStart, introFadeEnd)
   const introOpacity = introHold
   const introFloatOut = easedRange(progress, introFadeStart + 0.02, introFadeEnd + 0.06)
   const halfToFull = easedRange(progress, 0.22, 0.56)
   const globeToLeft = easedRange(progress, 0.46, 0.72)
   const envReveal = easedRange(progress, 0.32, 0.56)
   const transitionProgress = easedRange(progress, 0.56, 0.78)
   const envFadeOut = 1 - easedRange(progress, 0.54, 0.72)
   const envOpacity = envReveal * envFadeOut
   const materialOpacity = transitionProgress
   const whiteBlurBlend = easedRange(progress, 0.6, 0.78)
   const morphIn = easedRange(progress, 0.58, 0.8)
   const darkIn = easedRange(progress, 0.56, 0.8)
   const globeExit = easedRange(progress, 0.62, 0.82)
   const globeOpacity = 1 - easedRange(progress, 0.74, 0.9)
   const globeBlur = lerp(0, isMobileViewport ? 2.4 : 10, globeExit)
   const globeViewportScaleBoost = mapRange(viewportWidth, 430, 1600, 1.08, 1)
   const globeScale = lerp(1, 1.48, halfToFull) * lerp(1, 1.2, globeExit) * globeViewportScaleBoost
   const globeTranslateX = isMobileViewport ? 0 : lerp(0, -24, globeToLeft)
   const desktopGlobeYOffsetBoost = isMobileViewport ? 0 : mapRange(viewportWidth, 900, 1600, 22, 0)
   const globeTranslateY = isMobileViewport
      ? lerp(0, -4, globeToLeft)
      : lerp(48, 18, globeToLeft) + desktopGlobeYOffsetBoost
   const scene2Depth = easedRange(progress, 0.58, 0.84)
   const scene2ParallaxOffset = lerp(isMobileViewport ? 14 : 24, isMobileViewport ? -10 : -18, scene2Depth)
   const scene2ForegroundScale = lerp(1, 1.08, scene2Depth)
   const scene2BackgroundScale = lerp(1.12, 1.18, scene2Depth)
   const scene2RipplePerturbance = lerp(0.02, 0.036, scene2Depth)
   const scene2Out = easedRange(progress, 0.82, 0.9)
   const scene2OutOpacity = 1 - scene2Out
   const scene3In = easedRange(progress, 0.9, 0.97)
   const scene2TextOpacity = 1 - easedRange(progress, 0.8, 0.88)
   const transparencyCardContentMode = TRANSPARENCY_CONTENT_MODE === 'video-only' ? 'none' : 'hover'

   useEffect(() => {
      if (scene3In <= 0.01 || scene3MediaReady) return
      setScene3MediaReady(true)
   }, [scene3In, scene3MediaReady])

   const scene0Title = t('problem.scene0.title')
   const scene0TitleHighlight = t('problem.scene0.titleHighlight')
   const scene0Subtitle = t('problem.scene0.subtitle')
   const scene0SubtitleLines = useMemo(() => splitSubtitleLines(scene0Subtitle), [scene0Subtitle])
   const scene0SubtitlePieces = useMemo(() => scene0SubtitleLines.filter(Boolean), [scene0SubtitleLines])
   const scene0TitleLead = useMemo(() => {
      if (!scene0TitleHighlight || !scene0Title.includes(scene0TitleHighlight)) return `${scene0Title} `
      return `${scene0Title.replace(scene0TitleHighlight, '').trim()} `
   }, [scene0Title, scene0TitleHighlight])
   const scene1Value = useMemo(() => parseLocaleNumber(t('problem.scene1.value'), 3), [t])
   const scene1Decimals = Number.isInteger(scene1Value) ? 0 : 1
   const isScene1Active = envOpacity > 0.18
   const isScene2Active = materialOpacity > 0.16
   const isMorphRippleVisible = morphIn > 0.2
   const canUseDesktopRipple = shouldUseDesktopRipple(viewportWidth)
   const scene2OverlayOpacity = canUseDesktopRipple ? 0.58 : 1

   useEffect(() => {
      const layer = morphRippleRef.current
      if (!layer) return undefined

      let cleanup = () => {}
      let cancelled = false

      const destroyInstance = () => {
         if (!window.$?.fn?.ripples) return
         try {
            window.$(layer).ripples('destroy')
         } catch {
            // No-op: destroy can throw when instance was not initialized.
         }
      }

      if (!canUseDesktopRipple || !isScene2Active || !isMorphRippleVisible) {
         destroyInstance()
         return undefined
      }

      ensureRipplePlugin()
         .then(($) => {
            if (cancelled || !layer) return

            const $layer = $(layer)

            try {
               $layer.ripples('destroy')
            } catch {
               // No-op: first init path.
            }

            $layer.ripples({
               resolution: 256,
               perturbance: 0.026,
               interactive: false,
            })

            const dropSequence = [
               [0.24, 0.66],
               [0.5, 0.5],
               [0.76, 0.62],
            ]
            let sequenceIndex = 0

            const drop = () => {
               if (document.hidden) return
               const width = $layer.outerWidth()
               const height = $layer.outerHeight()
               if (!width || !height) return

               const [ratioX, ratioY] = dropSequence[sequenceIndex % dropSequence.length]
               sequenceIndex += 1

               $layer.ripples(
                  'drop',
                  width * ratioX,
                  height * ratioY,
                  24,
                  0.024,
               )
            }

            const intervalId = window.setInterval(drop, 3200)
            drop()

            cleanup = () => {
               window.clearInterval(intervalId)
               try {
                  $layer.ripples('destroy')
               } catch {
                  // No-op: safe cleanup.
               }
            }
         })
         .catch(() => {
            // No-op: scene should degrade gracefully when ripple lib is unavailable.
         })

      return () => {
         cancelled = true
         cleanup()
      }
   }, [canUseDesktopRipple, isMorphRippleVisible, isScene2Active])

   useEffect(() => {
      if (!canUseDesktopRipple || !isScene2Active || !isMorphRippleVisible) return
      if (!window.$?.fn?.ripples || !morphRippleRef.current) return

      try {
         window.$(morphRippleRef.current).ripples('set', 'perturbance', scene2RipplePerturbance)
      } catch {
         // No-op: plugin may not be initialized yet during early frames.
      }
   }, [canUseDesktopRipple, isMorphRippleVisible, isScene2Active, scene2RipplePerturbance])

   const cards = [
      {
         id: 'market',
         tone: 'amber',
         mediaType: 'image',
         mediaImage: marketImage,
         kicker: t('problem.scene3.market.kicker'),
         title: t('problem.scene3.market.title'),
         short: t('problem.scene3.market.short'),
         full: t('problem.scene3.market.full'),
         statPrefix: t('problem.scene3.market.statPrefix'),
         statValue: 30,
         statSuffix: t('problem.scene3.market.statSuffix'),
         statCaption: t('problem.scene3.market.statCaption'),
      },
      {
         id: 'transparency',
         tone: 'teal',
         mediaType: 'video',
         mediaVideo: transparencyVideo,
         contentMode: transparencyCardContentMode,
         kicker: t('problem.scene3.transparency.kicker'),
         title: t('problem.scene3.transparency.title'),
         short: t('problem.scene3.transparency.short'),
         full: t('problem.scene3.transparency.full'),
         statPrefix: t('problem.scene3.transparency.statPrefix'),
         statValue: 70,
         statSuffix: t('problem.scene3.transparency.statSuffix'),
         statCaption: t('problem.scene3.transparency.statCaption'),
      },
   ]

   return (
      <section id="mission" className="problem-section section--mission" ref={missionRef}>
         <div className="problem-scroll-story" ref={storyRef}>
            <div className="problem-sticky">
               <div className="problem-stage">
                  <div className="problem-light-bg" />
                  <div className="problem-dark-bg" style={{ opacity: darkIn }} />

                  <div
                     className={`problem-intro ${introOpacity >= 0.06 ? 'is-visible' : ''}`}
                     style={{
                        ...getVisibilityStyles(introOpacity),
                        transform: `translateX(-50%) translateY(${lerp(0, -34, introFloatOut)}px)`,
                     }}
                  >
                     <p className="problem-intro__eyebrow">{t('problem.scene0.eyebrow')}</p>
                     <h2 className="problem-intro__title">
                        <span><AuroraText>{scene0TitleLead}</AuroraText></span>
                        <span className="problem-intro__title-break">{scene0TitleHighlight}</span>
                     </h2>
                     <p className="problem-intro__subtitleline banner-subtitle" aria-label={scene0SubtitlePieces.join(' - ')}>
                        {scene0SubtitlePieces.map((piece, index) => (
                           <React.Fragment key={`${piece}-${index}`}>
                              <span>{piece}</span>
                              {index < scene0SubtitlePieces.length - 1 ? <span className="problem-intro__subtitle-sep"> - </span> : null}
                           </React.Fragment>
                        ))}
                     </p>
                     <h5 className="problem-intro__desc">{t('problem.scene0.description')}</h5>
                  </div>

                  <div className={`problem-scroll-cue ${introOpacity >= 0.06 ? 'is-visible' : ''}`} aria-hidden="true">
                     <div className="problem-scroll-hint">
                        <span className="problem-scroll-hint__icon">
                           <span className="problem-scroll-hint__dot" />
                        </span>
                        <span className="problem-scroll-hint__text">Cuộn để xem tiếp</span>
                     </div>
                  </div>

                  <div className="globe-track" style={{ ...getVisibilityStyles(globeOpacity), filter: `blur(${globeBlur}px)` }}>
                     <div className="globe-mask">
                        <div
                           className="globe-shell"
                           style={{
                              width: `${globeSize.width}px`,
                              height: `${globeSize.height}px`,
                              transform: `
  translate(${globeTranslateX}vw, ${globeTranslateY}vh)
  scale(${globeScale})
`
                           }}
                        >
                           <div className="globe-mount" ref={globeMountRef} />
                        </div>
                     </div>
                  </div>

                  <div
                     className={`problem-environment-panel ${envOpacity >= 0.06 ? 'is-visible' : ''}`}
                     style={{
                        ...getVisibilityStyles(envOpacity),
                        transform: `translateX(${lerp(100, 0, envReveal)}px) translateY(${lerp(14, 0, envOpacity)}px)`,
                     }}
                  >
                     <p className="problem-environment-panel__kicker">
                        <span className="material-symbols-rounded" aria-hidden="true">eco</span>
                        <span>{t('problem.scene1.kicker')}</span>
                     </p>
                     <h3 className="problem-environment-panel__title">
                        <span className="problem-environment-panel__title-accent">
                           <AuroraText>{t('problem.scene1.title')}</AuroraText>
                        </span>
                        <span className="problem-environment-panel__title-sub">{t('problem.scene1.titleSub')}</span>
                     </h3>
                     <div className="problem-environment-panel__value">
                        <span className="problem-environment-panel__value-line">
                           <CountUpNumber
                              target={scene1Value}
                              decimals={scene1Decimals}
                              duration={1800}
                              play={isScene1Active}
                              replayKey={`scene1-${isScene1Active ? 'on' : 'off'}`}
                              className="problem-environment-panel__value-number"
                           />
                           <span className="problem-environment-panel__value-plus">+</span>
                           <span className="problem-environment-panel__value-unit">{t('problem.scene1.valueUnit')}</span>
                        </span>
                     </div>
                     <p className="problem-environment-panel__micro">
                        {t('problem.scene1.microPrefix')} <CountUpNumber target={8200} duration={1900} play={isScene1Active} replayKey={`scene1-micro-${isScene1Active ? 'on' : 'off'}`} className="problem-environment-panel__micro-value" /> {t('problem.scene1.microSuffix')}
                     </p>
                     <p className="problem-environment-panel__desc">{t('problem.scene1.description')}</p>
                  </div>

                  <div
                     className="problem-morph-layer"
                     style={{
                        ...getVisibilityStyles(morphIn),
                        filter: `blur(${lerp(isMobileViewport ? 4 : 10, 0, morphIn)}px)`,
                     }}
                  >
                     <img
                        src={hyacinthImage}
                        alt=""
                        aria-hidden="true"
                        className="problem-morph-layer__image problem-morph-layer__image--bg"
                        loading="lazy"
                        decoding="async"
                        style={{
                           transform: `translate3d(0, ${scene2ParallaxOffset * 0.3}px, 0) scale(${scene2BackgroundScale})`,
                        }}
                     />
                     <img
                        src={hyacinthImage}
                        alt={t('problem.scene2.imageAlt')}
                        className="problem-morph-layer__image problem-morph-layer__image--fg"
                        loading="lazy"
                        decoding="async"
                        style={{
                           opacity: canUseDesktopRipple ? 0 : 1,
                           transform: `translate3d(0, ${scene2ParallaxOffset * 0.6}px, 0) scale(${scene2ForegroundScale})`,
                        }}
                     />
                     <div
                        ref={morphRippleRef}
                        className="problem-morph-layer__ripple"
                        aria-hidden="true"
                        style={{
                           backgroundImage: `url(${hyacinthImage})`,
                           opacity: canUseDesktopRipple ? 1 : 0,
                           transform: `translate3d(0, ${scene2ParallaxOffset * 0.45}px, 0) scale(${lerp(1.04, 1.1, scene2Depth)})`,
                        }}
                     />
                     <div className="problem-morph-layer__overlay" style={{ opacity: scene2OverlayOpacity }} />
                     <div className="problem-morph-layer__tint" />
                     <div className="problem-morph-layer__grain" />
                  </div>

                  <div
                     className="problem-transition-blur"
                     style={{
                        ...getVisibilityStyles(isMobileViewport ? 0 : whiteBlurBlend * (1 - materialOpacity * 0.9)),
                        filter: `blur(${lerp(20, 2, whiteBlurBlend)}px)`,
                     }}
                  />

                  <div className="problem-material-gradient" style={getVisibilityStyles(materialOpacity)} />

                  <div
                     className="problem-material-panel"
                     style={{
                        ...getVisibilityStyles(materialOpacity * scene2TextOpacity * scene2OutOpacity),
                        transform: `translateY(${lerp(40, 0, materialOpacity) - lerp(0, 42, scene2Out)}px)`,
                     }}
                  >
                     <p className="problem-material-panel__kicker">{t('problem.scene2.kicker')}</p>
                     <h3 className="problem-material-panel__title">{t('problem.scene2.title')}</h3>
                     <div className="problem-material-panel__value"><CountUpNumber target={40} duration={1250} play={isScene2Active} replayKey={`scene2-main-${isScene2Active ? 'on' : 'off'}`} />{t('problem.scene2.valueSuffix')}</div>
                     <p className="problem-material-panel__sub">{t('problem.scene2.sub')}</p>
                     <p className="problem-material-panel__ticker">
                        <span>{t('problem.scene2.tickerPrefix')}</span>
                        <CountUpNumber target={120000} duration={1600} play={isScene2Active} replayKey={`scene2-ticker-${isScene2Active ? 'on' : 'off'}`} className="problem-material-panel__ticker-value" />
                        <span> {t('problem.scene2.tickerSuffix')}</span>
                     </p>
                     <p className="problem-material-panel__desc">{t('problem.scene2.description')}</p>
                  </div>

                  <div
                     className={`problem-scene3-overlay ${activeCard ? `is-${activeCard}` : 'is-idle'}`}
                     style={{
                        ...getVisibilityStyles(scene3In),
                        transform: `translateY(${lerp(28, 0, scene3In)}px)`,
                     }}
                  >
                     <div className="problem-final">
                        <div className="problem-final__header">
                           <p className="problem-final__eyebrow">{t('problem.scene3.header.eyebrow')}</p>
                           <h3 className="problem-final__title">{t('problem.scene3.header.title')}</h3>
                           <p className="problem-final__subtitle">{t('problem.scene3.header.subtitle')}</p>
                        </div>

                        <div className={`feature-flipper ${activeCard ? `is-${activeCard}` : 'is-idle'}`}>
                           {cards.map((card) => {
                              const isActive = activeCard === card.id
                              const isCollapsed = activeCard && activeCard !== card.id
                              const hasContent = card.contentMode !== 'none'
                              const revealContentOnHover = card.contentMode === 'hover'

                              return (
                                 <button
                                    key={card.id}
                                    type="button"
                                    className={`feature-card feature-card--${card.tone} ${!hasContent ? 'feature-card--content-hidden' : ''} ${revealContentOnHover ? 'feature-card--hover-reveal-content' : ''} ${isActive ? 'is-active' : ''} ${isCollapsed ? 'is-collapsed' : ''}`}
                                    onClick={() => setActiveCard((current) => (current === card.id ? null : card.id))}
                                    aria-pressed={isActive}
                                 >
                                    <div className="feature-card__surface">
                                       {card.mediaType === 'video' ? (
                                          <video
                                             className="feature-card__media feature-card__media--video"
                                             autoPlay
                                             loop
                                             muted
                                             playsInline
                                             preload="metadata"
                                             disablePictureInPicture
                                             src={scene3MediaReady ? card.mediaVideo : undefined}
                                          />
                                       ) : (
                                          <div
                                             className={`feature-card__media ${card.mediaType === 'qr' ? 'is-qr' : ''}`}
                                             style={card.mediaImage ? { backgroundImage: `url(${card.mediaImage})` } : undefined}
                                          />
                                       )}
                                       {hasContent ? (
                                          <div className="feature-card__content">
                                             <p className="feature-card__kicker">{card.kicker}</p>
                                             <h4 className="feature-card__title">{card.title}</h4>
                                             <p className={`feature-card__text ${isActive ? 'is-expanded' : 'is-compact'}`}>{isActive ? card.full : card.short}</p>
                                             <p className="feature-card__stat">
                                                <span>{card.statPrefix}</span>
                                                <CountUpNumber target={card.statValue} duration={1300} className="feature-card__stat-value" />
                                                <span>{card.statSuffix}</span>
                                                <span> {card.statCaption}</span>
                                             </p>
                                          </div>
                                       ) : null}
                                    </div>
                                 </button>
                              )
                           })}
                        </div>
                     </div>
                  </div>

               </div>
            </div>
         </div>

      </section>
   )
}

export default memo(MissionSection)
