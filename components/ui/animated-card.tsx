"use client"

import { Card, type CardProps } from "@/components/ui/card"
import { forwardRef } from "react"

interface AnimatedCardProps extends CardProps {
  hover?: boolean
  medical?: boolean
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, hover = true, medical, className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={`
          transition-all duration-300 ease-in-out
          ${hover ? "hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1" : ""}
          ${medical ? "backdrop-blur-sm bg-card/80 border-border/50" : ""}
          ${className}
        `}
        {...props}
      >
        {children}
      </Card>
    )
  },
)

AnimatedCard.displayName = "AnimatedCard"
