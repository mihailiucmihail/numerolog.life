import type { SVGProps } from "react"

interface NumerologSymbolProps extends SVGProps<SVGSVGElement> {
  size?: "sm" | "md" | "lg"
}

const sizes = { sm: 20, md: 28, lg: 36 }

export function NumerologSymbol({ size = "md", className, ...props }: NumerologSymbolProps) {
  const dimension = sizes[size]
  const id = `numerolog-${size}`

  return (
    <svg viewBox="0 0 36 36" fill="none" width={dimension} height={dimension} className={className} aria-hidden="true" {...props}>
      <defs>
        <radialGradient id={`${id}-rg1`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d="M18 2 L34 18 L18 34 L2 18 Z" stroke="currentColor" strokeWidth="1.1" fill={`url(#${id}-rg1)`} filter={`url(#${id}-glow)`} />
      <path d="M18 9 L27 18 L18 27 L9 18 Z" stroke="currentColor" strokeWidth="0.7" fill="none" strokeOpacity="0.7" />
      <line x1="18" y1="13" x2="18" y2="23" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
      <line x1="13" y1="18" x2="23" y2="18" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
      <circle cx="18" cy="18" r="2.2" fill="currentColor" />
      <circle cx="18" cy="18" r="1" fill="currentColor" fillOpacity="0.9" />
    </svg>
  )
}
