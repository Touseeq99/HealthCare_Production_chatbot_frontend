"use client"

import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { ButtonProps } from "@/components/ui/button"
import { forwardRef } from "react"

interface MedicalButtonProps extends ButtonProps {
  isLoading?: boolean
  medical?: boolean
}

export const MedicalButton = forwardRef<HTMLButtonElement, MedicalButtonProps>(
  ({ children, isLoading, medical, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={`
          transition-all duration-300 ease-in-out
          hover:shadow-lg hover:shadow-primary/20
          active:scale-95
          ${medical ? "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80" : ""}
          ${className}
        `}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" variant={medical ? "medical" : "default"} />
            <span>Processing...</span>
          </div>
        ) : (
          children
        )}
      </Button>
    )
  },
)

MedicalButton.displayName = "MedicalButton"
