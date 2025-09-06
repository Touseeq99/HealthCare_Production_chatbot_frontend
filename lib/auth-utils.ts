export type UserRole = "patient" | "doctor" | "admin"

export interface User {
  id: string
  email: string
  name: string
  surname: string
  role: UserRole
  isVerified: boolean
  specialization?: string
  licenseNumber?: string
}

export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case "patient":
      return "Patient"
    case "doctor":
      return "Healthcare Professional"
    case "admin":
      return "Administrator"
    default:
      return "User"
  }
}

export const getRoleDescription = (role: UserRole): string => {
  switch (role) {
    case "patient":
      return "Seeking medical guidance and health information"
    case "doctor":
      return "Licensed healthcare professional providing medical advice"
    case "admin":
      return "System administrator with full access"
    default:
      return "Platform user"
  }
}

export const getPostSignupRoute = (role: UserRole): string => {
  switch (role) {
    case "patient":
      return "/consent?role=patient"
    case "doctor":
      return "/consent?role=doctor"
    case "admin":
      return "/admin/dashboard"
    default:
      return "/dashboard"
  }
}

export const getRoleDashboardRoute = (role: UserRole): string => {
  switch (role) {
    case "patient":
      return "/patient/chat"
    case "doctor":
      return "/doctor/dashboard"
    case "admin":
      return "/admin/dashboard"
    default:
      return "/dashboard"
  }
}

export const validateRolePermissions = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy = {
    admin: 3,
    doctor: 2,
    patient: 1,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}
