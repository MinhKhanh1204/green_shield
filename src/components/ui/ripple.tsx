import React, { type ComponentPropsWithoutRef, type CSSProperties } from "react"

import { cn } from "@/lib/utils"

interface RippleProps extends ComponentPropsWithoutRef<"div"> {
  mainCircleSize?: number
  mainCircleOpacity?: number
  numCircles?: number
}

export const Ripple = React.memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 select-none",
        className
      )}
      {...props}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70
        const opacity = mainCircleOpacity - i * 0.03

        return (
          <div
            key={i}
            className="animate-ripple absolute rounded-full"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity,
              animationDelay: `${i * 0.06}s`,

              /* 🔥 FIX QUAN TRỌNG */
              border: "1px solid rgba(34,197,94,0.6)",
              background: "rgba(34,197,94,0.08)",

              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        )
      })}
    </div>
  )
})

Ripple.displayName = "Ripple"
