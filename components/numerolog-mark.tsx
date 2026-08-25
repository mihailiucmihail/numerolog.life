import { cn } from "@/lib/utils"

type NumerologMarkProps = {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function NumerologMark({ className, size = "md" }: NumerologMarkProps) {
  const sizes = {
    sm: "size-4",
    md: "size-6",
    lg: "size-9",
  }

  return (
    <span
      className={cn("numerolog-mark relative inline-flex shrink-0 items-center justify-center", sizes[size], className)}
      aria-hidden="true"
    >
      <span className="numerolog-mark__glow absolute inset-[-35%] rounded-full" />
      <span className="numerolog-mark__outer absolute inset-[8%] rotate-45 rounded-[2px]" />
      <span className="numerolog-mark__inner absolute inset-[25%] rotate-45 rounded-[1px]" />
      <span className="numerolog-mark__core relative size-[18%] rounded-full" />
    </span>
  )
}
