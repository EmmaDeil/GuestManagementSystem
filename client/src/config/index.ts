// Environment configuration with debugging
const nodeEnv = process.env.NODE_ENV || 'development';
const isDevelopment = nodeEnv === 'development';
const isProduction = nodeEnv === 'production';

// API URL configuration
const getApiUrl = () => {
  // Priority: 1. NEXT_PUBLIC_API_URL env var, 2. Default based on environment
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  if (isDevelopment) {
    return 'http://localhost:5000';
  }
  
  // Production fallback
  return 'https://guestmanagementsystembackend.onrender.com';
};

// Client URL configuration
const getClientUrl = () => {
  if (process.env.NEXT_PUBLIC_CLIENT_URL) {
    return process.env.NEXT_PUBLIC_CLIENT_URL;
  }
  
  if (isDevelopment) {
    return 'http://localhost:3000';
  }
  
  // Production fallback
  return 'https://guestmanagementsystem.onrender.com';
};

const config = {
  // Environment
  nodeEnv,
  isDevelopment,
  isProduction,
  
  // URLs
  apiUrl: getApiUrl(),
  clientUrl: getClientUrl(),
  
  // Features
  enableDebugLogs: isDevelopment || process.env.NEXT_PUBLIC_DEBUG === 'true',
  
  // Debug info
  debug: {
    nodeEnv,
    apiUrlSource: process.env.NEXT_PUBLIC_API_URL ? 'env' : 'default',
    clientUrlSource: process.env.NEXT_PUBLIC_CLIENT_URL ? 'env' : 'default',
    envVars: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'not set',
      NEXT_PUBLIC_CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL || 'not set',
      NODE_ENV: process.env.NODE_ENV || 'not set'
    }
  }
};

// Debug logging (only in development or when debug is enabled)
if (config.enableDebugLogs && typeof window !== 'undefined') {
  console.log('🔧 Client Configuration Debug');
  console.log('═══════════════════════════════════════');
  console.log('📝 Environment:', config.nodeEnv);
  console.log('🔗 API URL:', config.apiUrl);
  console.log('🌐 Client URL:', config.clientUrl);
  console.log('📊 Debug Mode:', config.enableDebugLogs);
  console.log('📋 Full Config:', config.debug);
  console.log('═══════════════════════════════════════');
}

export default config;