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

// Load environment variables
dotenv.config();

console.log('🔧 Starting Guest Management Server...');
console.log(`📝 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔗 MONGODB_URI: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);
console.log(`🌐 CLIENT_URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);

const app = express();
const PORT = parseInt(process.env.PORT || '5000');

console.log(`🚪 Configured PORT: ${PORT}`);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Guest Management API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Server listening on all interfaces (0.0.0.0:${PORT})`);
}).on('error', (err: any) => {
  console.error('❌ Server failed to start:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.log(`🚫 Port ${PORT} is already in use`);
  }
  process.exit(1);
});