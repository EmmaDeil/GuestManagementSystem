/**
 * Generate a unique 6-digit guest code
 */
export declare const generateGuestCode: () => string;
/**
 * Generate QR code URL for organization guest sign-in
 */
export declare const generateGuestSignInUrl: (organizationId: string) => string;
/**
 * Generate QR code as base64 string for organization
 */
export declare const generateQRCode: (organizationId: string, organizationName: string) => Promise<string>;
/**
 * Generate QR code as buffer for printing
 */
export declare const generateQRCodeBuffer: (organizationId: string, organizationName: string) => Promise<Buffer>;
/**
 * Validate guest code format
 */
export declare const isValidGuestCode: (code: string) => boolean;
/**
 * Check if minimum visit time has passed
 */
export declare const hasMinimumVisitTimePassed: (signInTime: Date, minVisitMinutes: number) => boolean;
/**
 * Calculate visit duration in minutes
 */
export declare const calculateVisitDuration: (signInTime: Date, signOutTime?: Date) => number;
/**
 * Format duration for display
 */
export declare const formatDuration: (minutes: number) => string;
//# sourceMappingURL=qrcode.d.ts.map