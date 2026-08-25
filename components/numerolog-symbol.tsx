import Image from "next/image"

interface NumerologSymbolProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizes = {
  sm: 16,
  md: 24,
  lg: 36,
}

export function NumerologSymbol({ size = "md", className = "" }: NumerologSymbolProps) {
  const dimension = sizes[size]

  return (
    <Image
      src="/images/numerolog-symbol.png"
      alt=""
      width={dimension}
      height={dimension}
      className={`shrink-0 object-contain ${className}`}
      aria-hidden="true"
    />
  )
}
