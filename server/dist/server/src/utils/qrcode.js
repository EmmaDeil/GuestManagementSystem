"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDuration = exports.calculateVisitDuration = exports.hasMinimumVisitTimePassed = exports.isValidGuestCode = exports.generateQRCodeBuffer = exports.generateQRCode = exports.generateGuestSignInUrl = exports.generateGuestCode = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
/**
 * Generate a unique 6-digit guest code
 */
const generateGuestCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateGuestCode = generateGuestCode;
/**
 * Generate QR code URL for organization guest sign-in
 */
const generateGuestSignInUrl = (organizationId) => {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    return `${baseUrl}/guest/signin/${organizationId}`;
};
exports.generateGuestSignInUrl = generateGuestSignInUrl;
/**
 * Generate QR code as base64 string for organization
 */
const generateQRCode = async (organizationId, organizationName) => {
    try {
        const signInUrl = (0, exports.generateGuestSignInUrl)(organizationId);
        const qrCodeData = {
            organizationId,
            organizationName,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year expiry
        };
        // Include metadata in URL as query params for better UX
        const urlWithMetadata = `${signInUrl}?org=${encodeURIComponent(organizationName)}`;
        // Generate QR code as base64 data URL
        const qrCodeBase64 = await qrcode_1.default.toDataURL(urlWithMetadata, {
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            width: 256
        });
        return qrCodeBase64;
    }
    catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
};
exports.generateQRCode = generateQRCode;
/**
 * Generate QR code as buffer for printing
 */
const generateQRCodeBuffer = async (organizationId, organizationName) => {
    try {
        const signInUrl = (0, exports.generateGuestSignInUrl)(organizationId);
        const urlWithMetadata = `${signInUrl}?org=${encodeURIComponent(organizationName)}`;
        const qrCodeBuffer = await qrcode_1.default.toBuffer(urlWithMetadata, {
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            width: 512 // Higher resolution for printing
        });
        return qrCodeBuffer;
    }
    catch (error) {
        console.error('Error generating QR code buffer:', error);
        throw new Error('Failed to generate QR code buffer');
    }
};
exports.generateQRCodeBuffer = generateQRCodeBuffer;
/**
 * Validate guest code format
 */
const isValidGuestCode = (code) => {
    return /^\d{6}$/.test(code);
};
exports.isValidGuestCode = isValidGuestCode;
/**
 * Check if minimum visit time has passed
 */
const hasMinimumVisitTimePassed = (signInTime, minVisitMinutes) => {
    const currentTime = new Date();
    const timeDifference = (currentTime.getTime() - signInTime.getTime()) / (1000 * 60); // in minutes
    return timeDifference >= minVisitMinutes;
};
exports.hasMinimumVisitTimePassed = hasMinimumVisitTimePassed;
/**
 * Calculate visit duration in minutes
 */
const calculateVisitDuration = (signInTime, signOutTime) => {
    const endTime = signOutTime || new Date();
    return Math.round((endTime.getTime() - signInTime.getTime()) / (1000 * 60));
};
exports.calculateVisitDuration = calculateVisitDuration;
/**
 * Format duration for display
 */
const formatDuration = (minutes) => {
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
exports.formatDuration = formatDuration;
//# sourceMappingURL=qrcode.js.map