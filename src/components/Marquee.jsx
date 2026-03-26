import React, { useMemo } from 'react'

/**
 * Magic UI style Marquee (lightweight implementation)
 * Props:
 *  - items?: string[]
 *  - separator?: ReactNode
 *  - speed?: number (seconds for one loop)
 *  - className?: string
 *  - children?: ReactNode (custom content overrides items)
 *  - weight?: number (font-weight)
 *  - uppercase?: boolean (default true)
 */

export default function Marquee({
	items,
	separator = <span className="material-symbols-rounded">asterisk</span>,
	speed = 26,
	className = '',
	children,
	weight = 700,
	uppercase = true,
}) {
	
	const content = useMemo(() => {
		if (children) return children
		if (!items?.length) return null
		return (
			<>
				{items.map((txt, i) => (
					<span className="mq-item" key={i}>
						{uppercase ? String(txt).toUpperCase() : txt}
						<span className="mq-sep" aria-hidden="true"> {separator} </span>
					</span>
				))}
			</>
		)
	}, [items, children, separator, uppercase])

	if (!content) return null

	return (
		<div className={`mq-root ${className}`} aria-hidden>
			<div className="mq-mask">
				<div className="mq-track" style={{ animationDuration: `${speed}s`, fontWeight: weight }}>
					{Array.from({ length: 7 }).map((_, i) => (
						<div className="mq-strip" data-dup={i} key={i} aria-hidden={i !== 0}>
							{content}
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

