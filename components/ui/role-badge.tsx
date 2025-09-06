import { Badge } from "@/components/ui/badge"
import type { UserRole } from "@/lib/auth-utils"
import { getRoleDisplayName } from "@/lib/auth-utils"

interface RoleBadgeProps {
  role: UserRole
  variant?: "default" | "secondary" | "outline"
}

export function RoleBadge({ role, variant = "default" }: RoleBadgeProps) {
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "doctor":
        return "bg-primary text-primary-foreground"
      case "patient":
        return "bg-secondary text-secondary-foreground"
      case "admin":
        return "bg-accent text-accent-foreground"
      default:
        return ""
    }
  }

  return (
    <Badge variant={variant} className={variant === "default" ? getRoleColor(role) : ""}>
      <div className="flex items-center gap-1">
        <div
          className={`w-2 h-2 rounded-full ${
            role === "doctor"
              ? "bg-primary-foreground"
              : role === "patient"
                ? "bg-secondary-foreground"
                : "bg-accent-foreground"
          }`}
        />
        {getRoleDisplayName(role)}
      </div>
    </Badge>
  )
}
