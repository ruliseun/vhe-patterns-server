export const ErrorMessages = {
  UNAUTHORIZED: "Unauthorized",
  INVALID_TOKEN: "Invalid Token",
  UNAUTHORIZED_ACCESS: "Unauthorized Access",
  UNAUTHORIZED_INTERNAL_ACCESS: "Unauthorized Internal Use Access",
  SERVER_ERROR: "Internal Server Error",
  INTERNAL_USE_GUARD_ERROR: "Internal Use Guard error:",
  USER_NOT_FOUND: "User not found",
  ROLE_NOT_CONFIGURED: "Required role is not configured",
  WEAK_PASSWORD: "Password is weak",
  USER_EXISTS: "User with record already exists",
  notFoundValue: (id: string, identifier: string) => {
    return `${identifier} with value ${id} not found`;
  },
} as const;
