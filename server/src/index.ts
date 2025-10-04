import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/database';

// Import routes
import authRoutes from './routes/auth';
import guestRoutes from './routes/guests';
import organizationRoutes from './routes/organizations';
import qrRoutes from './routes/qr';
import dashboardRoutes from './routes/dashboard';

// Load environment variables based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
console.log(`🌍 Detected NODE_ENV: ${nodeEnv}`);

// Load specific environment file
if (nodeEnv === 'development') {
  dotenv.config({ path: '.env.development' });
  console.log('📝 Loaded .env.development');
} else if (nodeEnv === 'production') {
  dotenv.config({ path: '.env.production' });
  console.log('� Loaded .env.production');
}

// Fallback to default .env
dotenv.config();

console.log('�🔧 Starting Guest Management Server...');
console.log('═══════════════════════════════════════');
console.log(`📝 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔗 MONGODB_URI: ${process.env.MONGODB_URI ? 'Configured ✅' : 'Not configured ❌'}`);
console.log(`🌐 CLIENT_URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
console.log(`🔑 JWT_SECRET: ${process.env.JWT_SECRET ? 'Configured ✅' : 'Not configured ❌'}`);
console.log(`⏰ JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN || '24h'}`);

const app = express();
const PORT = parseInt(process.env.PORT || '5000');

console.log(`🚪 Configured PORT: ${PORT}`);
console.log('═══════════════════════════════════════');

// Connect to MongoDB
connectDB();

// Middleware
console.log('🔧 Setting up middleware...');

const corsOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
console.log(`🌐 CORS Origin: ${corsOrigin}`);

app.use(cors({
  origin: corsOrigin,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

console.log('✅ Middleware configured successfully');

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthData = {
    success: true,
    message: 'Guest Management API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    config: {
      port: PORT,
      mongodbConnected: process.env.MONGODB_URI ? 'Configured' : 'Not configured',
      clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
      jwtConfigured: process.env.JWT_SECRET ? 'Yes' : 'No'
    }
  };
  
  console.log('🩺 Health check requested:', healthData);
  res.status(200).json(healthData);
});

console.log('🔗 Setting up API routes...');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/dashboard', dashboardRoutes);

console.log('✅ API routes configured successfully');

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Server Successfully Started!');
  console.log('═══════════════════════════════════════');
  console.log(`🌐 Server running on: http://0.0.0.0:${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`� External access: Server listening on all interfaces`);
  console.log('═══════════════════════════════════════');
}).on('error', (err: any) => {
  console.error('❌ Server failed to start:', {
    message: err.message,
    code: err.code,
    port: PORT,
    timestamp: new Date().toISOString()
  });
  
  if (err.code === 'EADDRINUSE') {
    console.log(`🚫 Port ${PORT} is already in use`);
    console.log('💡 Try using a different port or stop the process using this port');
  }
  process.exit(1);
});