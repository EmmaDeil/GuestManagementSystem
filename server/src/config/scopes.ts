/**
 * API Key Scopes Definition
 * 
 * Defines all available permission scopes for API keys
 */

export const API_SCOPES = {
  // System Administration
  SYSTEM_ADMIN: 'system:admin',
  SYSTEM_CONFIG_READ: 'system:config:read',
  SYSTEM_CONFIG_WRITE: 'system:config:write',
  SYSTEM_ANALYTICS_READ: 'system:analytics:read',
  SYSTEM_LOGS_READ: 'system:logs:read',
  
  // API Key Management
  API_KEYS_READ: 'api-keys:read',
  API_KEYS_WRITE: 'api-keys:write',
  API_KEYS_DELETE: 'api-keys:delete',
  
  // Organization Management
  ORGANIZATIONS_READ: 'organizations:read',
  ORGANIZATIONS_WRITE: 'organizations:write',
  ORGANIZATIONS_DELETE: 'organizations:delete',
  
  // Guest Management
  GUESTS_READ: 'guests:read',
  GUESTS_WRITE: 'guests:write',
  GUESTS_DELETE: 'guests:delete',
  
  // QR Code
  QR_GENERATE: 'qr:generate',
  QR_READ: 'qr:read',
  
  // Dashboard
  DASHBOARD_READ: 'dashboard:read',
} as const;

export type ApiScope = typeof API_SCOPES[keyof typeof API_SCOPES];

/**
 * Predefined scope sets for common use cases
 */
export const SCOPE_PRESETS = {
  SYSTEM_ADMIN: [
    API_SCOPES.SYSTEM_ADMIN,
  ],
  
  ORGANIZATION_ADMIN: [
    API_SCOPES.ORGANIZATIONS_READ,
    API_SCOPES.ORGANIZATIONS_WRITE,
    API_SCOPES.GUESTS_READ,
    API_SCOPES.GUESTS_WRITE,
    API_SCOPES.QR_GENERATE,
    API_SCOPES.QR_READ,
    API_SCOPES.DASHBOARD_READ,
  ],
  
  GUEST_REGISTRATION_ONLY: [
    API_SCOPES.GUESTS_WRITE,
    API_SCOPES.ORGANIZATIONS_READ,
  ],
  
  ANALYTICS_READER: [
    API_SCOPES.GUESTS_READ,
    API_SCOPES.SYSTEM_ANALYTICS_READ,
    API_SCOPES.DASHBOARD_READ,
  ],
  
  MOBILE_APP: [
    API_SCOPES.GUESTS_READ,
    API_SCOPES.GUESTS_WRITE,
    API_SCOPES.QR_GENERATE,
    API_SCOPES.QR_READ,
    API_SCOPES.DASHBOARD_READ,
    API_SCOPES.ORGANIZATIONS_READ,
  ],
  
  READ_ONLY: [
    API_SCOPES.GUESTS_READ,
    API_SCOPES.ORGANIZATIONS_READ,
    API_SCOPES.DASHBOARD_READ,
    API_SCOPES.QR_READ,
  ],
} as const;

/**
 * Check if a scope grants system admin privileges
 */
export function isSystemAdminScope(scopes: string[]): boolean {
  return scopes.includes(API_SCOPES.SYSTEM_ADMIN);
}

/**
 * Check if scopes include a specific permission
 */
export function hasScope(userScopes: string[], requiredScope: string | string[]): boolean {
  // System admin has all permissions
  if (userScopes.includes(API_SCOPES.SYSTEM_ADMIN)) {
    return true;
  }
  
  // Check for specific scope(s)
  if (Array.isArray(requiredScope)) {
    return requiredScope.some(scope => userScopes.includes(scope));
  }
  
  return userScopes.includes(requiredScope);
}

/**
 * Validate that all provided scopes are valid
 */
export function validateScopes(scopes: string[]): { valid: boolean; invalidScopes: string[] } {
  const validScopes = Object.values(API_SCOPES);
  const invalidScopes = scopes.filter(scope => !validScopes.includes(scope as any));
  
  return {
    valid: invalidScopes.length === 0,
    invalidScopes
  };
}
