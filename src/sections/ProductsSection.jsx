import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import '../styles/process-section.css'

const STEP_IMAGES = [
	{
		src: 'https://res.cloudinary.com/dnini39bp/image/upload/v1774525576/thu_gom_i88yio.jpg',
		position: 'center center',
	},
	{
		src: 'https://res.cloudinary.com/dnini39bp/image/upload/v1774525576/ph%C6%A1i_kh%C3%B4_apdkfb.jpg',
		position: 'center center',
	},
	{
		src: 'https://res.cloudinary.com/dnini39bp/image/upload/v1774525576/x%E1%BB%AD_l%C3%AD_yympqv.jpg',
		position: 'center center',
	},
	{
		src: 'https://res.cloudinary.com/dnini39bp/image/upload/v1774525631/%C3%89p_khu%C3%B4n_dcrnms.jpg',
		position: 'center center',
	},
	{
		src: 'https://res.cloudinary.com/dnini39bp/image/upload/v1774525577/%C4%91%C3%B3ng_g%C3%B3i_rdiy7q.jpg',
		position: '50% 48%',
	},
]

function optimizeCloudinaryImage(url, width) {
	if (!url || !url.includes('/upload/')) return url
	return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit,dpr_auto/`)
}

function getShortestOffset(index, activeIndex, length) {
	let offset = index - activeIndex
	const half = Math.floor(length / 2)

	if (offset > half) offset -= length
	if (offset < -half) offset += length

	return offset
}

const ProcessCard = memo(function ProcessCard({
	step,
	index,
	offset,
	isActive,
	onSelect,
}) {
	return (
		<article
			className={`process-card tone-${step.tone}${isActive ? ' is-active' : ''}`}
			style={{
				'--offset': offset,
				'--abs-offset': Math.abs(offset),
			}}
			onClick={() => onSelect(index)}
			aria-current={isActive}
		>
			<div className="process-card__shell">
				<div className="process-card__media-wrap">
					<img
						className="process-card__media"
						src={step.image}
						alt={step.title}
						style={step.imagePosition ? { objectPosition: step.imagePosition } : undefined}
						loading={index < 2 ? 'eager' : 'lazy'}
						decoding="async"
						fetchPriority={index < 2 ? 'high' : 'auto'}
					/>
					<div className="process-card__veil" />
				</div>
			</div>
		</article>
	)
})

const MobileProcessCard = memo(function MobileProcessCard({ step, index }) {
	return (
		<article className="process-mobile-card" role="listitem" aria-label={`Step ${index + 1}: ${step.title}`}>
			<div className="process-mobile-card__media-wrap">
				<img
					className="process-mobile-card__media"
					src={step.image}
					alt={step.title}
					style={step.imagePosition ? { objectPosition: step.imagePosition } : undefined}
					loading={index < 2 ? 'eager' : 'lazy'}
					decoding="async"
					fetchPriority={index < 2 ? 'high' : 'auto'}
				/>
				<div className="process-mobile-card__veil">
					<div className="process-mobile-card__content">
						<p className="process-mobile-card__step">Bước 0{step.id}</p>
						<h3 className="process-mobile-card__title">{step.title}</h3>
						<p className="process-mobile-card__desc">{step.description}</p>
					</div>
				</div>
			</div>
		</article>
	)
})

export default function ProductsSection() {
	const { t } = useTranslation()
	const sectionRef = useRef(null)
	const rafRef = useRef(null)
	const [isMobile, setIsMobile] = useState(() =>
		typeof window !== 'undefined' ? window.matchMedia('(max-width: 900px)').matches : false,
	)
	const [activeIndex, setActiveIndex] = useState(0)
	const [isReady, setIsReady] = useState(false)
	const [isDecoded, setIsDecoded] = useState(false)
	const optimizedImageWidth = isMobile ? 720 : 920
	const decodedSources = useMemo(
		() => STEP_IMAGES.map((item) => optimizeCloudinaryImage(item.src, optimizedImageWidth)),
		[optimizedImageWidth],
	)

	useEffect(() => {
		let cancelled = false

		const decodeImages = async () => {
			setIsDecoded(false)

			await Promise.all(
				decodedSources.map((src) => {
					const image = new Image()
					image.src = src

					if (typeof image.decode === 'function') {
						return image.decode().catch(() => undefined)
					}

					return new Promise((resolve) => {
						image.onload = () => resolve(undefined)
						image.onerror = () => resolve(undefined)
					})
				}),
			)

			if (!cancelled) setIsDecoded(true)
		}

		decodeImages()

		return () => {
			cancelled = true
		}
	}, [decodedSources])

	useEffect(() => {
		const section = sectionRef.current
		if (!section) return undefined

		const scroller = document.querySelector('.app-scroll') || null
		const preloadObserver = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsReady(true)
					preloadObserver.disconnect()
				}
			},
			{
				root: scroller,
				rootMargin: '500px 0px',
				threshold: 0,
			},
		)

		preloadObserver.observe(section)
		return () => preloadObserver.disconnect()
	}, [])

	useEffect(() => {
		if (typeof window === 'undefined') return undefined

		const media = window.matchMedia('(max-width: 900px)')
		const sync = () => setIsMobile(media.matches)
		sync()

		media.addEventListener('change', sync)
		return () => media.removeEventListener('change', sync)
	}, [])

	const steps = useMemo(
		() =>
			STEP_IMAGES.map((item, index) => ({
				id: index + 1,
				title: t(`products.steps.${index}.label`, { defaultValue: '' }),
				description: t(`products.steps.${index}.desc`, { defaultValue: '' }),
				image: optimizeCloudinaryImage(item.src, optimizedImageWidth),
				imagePosition: item.position,
				tone: 'core',
			})),
		[optimizedImageWidth, t],
	)

	const setActiveIndexRaf = useCallback((next) => {
		if (rafRef.current) cancelAnimationFrame(rafRef.current)

		rafRef.current = requestAnimationFrame(() => {
			setActiveIndex((prev) => {
				const resolved = typeof next === 'function' ? next(prev) : next
				if (resolved === prev) return prev
				return resolved
			})
			rafRef.current = null
		})
	}, [])

	useEffect(() => {
		return () => {
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current)
				rafRef.current = null
			}
		}
	}, [])

	const goPrev = useCallback(() => {
		setActiveIndexRaf((prev) => (prev - 1 + steps.length) % steps.length)
	}, [setActiveIndexRaf, steps.length])

	const goNext = useCallback(() => {
		setActiveIndexRaf((prev) => (prev + 1) % steps.length)
	}, [setActiveIndexRaf, steps.length])

	const activeStep = steps[activeIndex]

	return (
		<section
			id="products"
			ref={sectionRef}
			className={`section process-section${isMobile ? ' is-mobile' : ''}`}
			aria-label={t('products.title')}
		>
			<div className="process-shell">
				<header className="products-header process-header is-visible">
					<h1 className="section-title">{t('products.title', { defaultValue: 'SẢN PHẨM & CÔNG NGHỆ' })}</h1>
					<h3 className="section-subtitle">{t('products.stepsTitle', { defaultValue: 'quy trình gồm 5 bước' })}</h3>
				</header>

				<div className="process-carousel is-visible" role="region" aria-label={t('products.stepsTitle')}>
					{!isReady || !isDecoded ? <div className="process-prewarm" aria-hidden="true" /> : null}

					{isReady && isDecoded ? (
						isMobile ? (
							<div className="process-mobile-scroll is-visible" role="list">
								{steps.map((step, index) => (
									<MobileProcessCard key={step.id} step={step} index={index} />
								))}
							</div>
						) : (
							<>
								<div className="process-curve-stage is-visible" role="list">
									{steps.map((step, index) => {
										const offset = getShortestOffset(index, activeIndex, steps.length)
										return (
											<ProcessCard
												key={step.id}
												step={step}
												index={index}
												offset={offset}
												isActive={offset === 0}
												onSelect={setActiveIndexRaf}
											/>
										)
									})}
								</div>

								<div className="process-nav is-visible">
									<button type="button" className="process-nav__btn" onClick={goPrev} aria-label="Previous step">
										<span aria-hidden="true">&#10094;</span>
									</button>

									<div className="process-nav__dots" role="tablist" aria-label="Carousel pagination">
										{steps.map((step, index) => (
											<button
												key={`dot-${step.id}`}
												type="button"
												role="tab"
												aria-selected={activeIndex === index}
												className={`process-nav__dot${activeIndex === index ? ' is-active' : ''}`}
												onClick={() => setActiveIndexRaf(index)}
												aria-label={`Step ${index + 1}`}
											/>
										))}
									</div>

									<button type="button" className="process-nav__btn" onClick={goNext} aria-label="Next step">
										<span aria-hidden="true">&#10095;</span>
									</button>
								</div>

								{activeStep ? (
									<article className="process-caption is-visible" aria-live="polite">
										<p className="process-caption__step">Bước 0{activeStep.id}</p>
										<h3 className="process-caption__title">{activeStep.title}</h3>
										<p className="process-caption__desc">{activeStep.description}</p>
									</article>
								) : null}
							</>
						)
					) : null}
				</div>
			</div>
		</section>
	)
}
