import QRCode from 'qrcode';
import { QRCodeData } from '../types';

/**
 * Generate a unique 6-digit guest code
 */
export const generateGuestCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate QR code URL for organization guest sign-in
 */
export const generateGuestSignInUrl = (organizationId: string): string => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  return `${baseUrl}/guest/signin/${organizationId}`;
};

/**
 * Generate QR code as base64 string for organization
 */
export const generateQRCode = async (organizationId: string, organizationName: string): Promise<string> => {
  try {
    const signInUrl = generateGuestSignInUrl(organizationId);
    
    const qrCodeData: QRCodeData = {
      organizationId,
      organizationName,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year expiry
    };

    // Include metadata in URL as query params for better UX
    const urlWithMetadata = `${signInUrl}?org=${encodeURIComponent(organizationName)}`;
    
    // Generate QR code as base64 data URL
    const qrCodeBase64 = await QRCode.toDataURL(urlWithMetadata, {
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });

    return qrCodeBase64;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate QR code as buffer for printing
 */
export const generateQRCodeBuffer = async (organizationId: string, organizationName: string): Promise<Buffer> => {
  try {
    const signInUrl = generateGuestSignInUrl(organizationId);
    const urlWithMetadata = `${signInUrl}?org=${encodeURIComponent(organizationName)}`;
    
    const qrCodeBuffer = await QRCode.toBuffer(urlWithMetadata, {
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 512 // Higher resolution for printing
    });

    return qrCodeBuffer;
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw new Error('Failed to generate QR code buffer');
  }
};

/**
 * Validate guest code format
 */
export const isValidGuestCode = (code: string): boolean => {
  return /^\d{6}$/.test(code);
};

/**
 * Check if minimum visit time has passed
 */
export const hasMinimumVisitTimePassed = (signInTime: Date, minVisitMinutes: number): boolean => {
  const currentTime = new Date();
  const timeDifference = (currentTime.getTime() - signInTime.getTime()) / (1000 * 60); // in minutes
  return timeDifference >= minVisitMinutes;
};

/**
 * Calculate visit duration in minutes
 */
export const calculateVisitDuration = (signInTime: Date, signOutTime?: Date): number => {
  const endTime = signOutTime || new Date();
  return Math.round((endTime.getTime() - signInTime.getTime()) / (1000 * 60));
};

/**
 * Format duration for display
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
};