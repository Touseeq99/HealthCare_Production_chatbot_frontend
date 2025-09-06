"use client"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "medical"
}

export function LoadingSpinner({ size = "md", variant = "default" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  if (variant === "medical") {
    return (
      <div className="flex items-center justify-center">
        <div className={`${sizeClasses[size]} relative`}>
          {/* Medical heartbeat spinner */}
          <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping" />
          <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 border border-primary/40 rounded-full animate-pulse" />
          <svg
            className="absolute inset-1 text-primary animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} border-2 border-primary/20 border-t-primary rounded-full animate-spin`} />
    </div>
  )
}
