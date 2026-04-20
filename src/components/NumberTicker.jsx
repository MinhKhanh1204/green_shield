import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring } from 'framer-motion'

/**
 * NumberTicker: counts from 'from' to 'to' when visible.
 * Props:
 *  - value: number (target)
 *  - from?: number (default 0)
 *  - duration?: number ms (default 1200)
 *  - decimals?: number of decimal places to show (default 0)
 *  - className?: string
 */
export default function NumberTicker({ value, from = 0, duration = 1200, decimals = 0, className = '' }) {
	const ref = useRef(null)
	const reducedMotion = useReducedMotion()
	const isInView = useInView(ref, { amount: 0.35, once: true })

	const fromValue = useMemo(() => Number(from) || 0, [from])
	const toValue = useMemo(() => Number(value) || 0, [value])

	const motionValue = useMotionValue(fromValue)
	const spring = useSpring(motionValue, {
		stiffness: 100,
		damping: 24,
		mass: 1,
		duration: duration / 1000,
	})

	const formatNumber = useCallback((num) =>
		Number(num).toLocaleString(undefined, {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals,
		}), [decimals])

	useEffect(() => {
		if (!ref.current) return
		ref.current.textContent = formatNumber(fromValue)
	}, [fromValue, formatNumber])

	useEffect(() => {
		if (!isInView) return
		if (reducedMotion) {
			motionValue.set(toValue)
			return
		}

		motionValue.set(toValue)
	}, [isInView, reducedMotion, motionValue, toValue])

	useMotionValueEvent(spring, 'change', (latest) => {
		if (!ref.current) return
		ref.current.textContent = formatNumber(latest)
	})

	return <span ref={ref} className={className} />
}

