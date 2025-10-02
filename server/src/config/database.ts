import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/guest-management';
    
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log(`📍 Connection URI: ${mongoUri.replace(/\/\/.*@/, '//****@')}`);
    
    await mongoose.connect(mongoUri);
    
    console.log('✅ MongoDB Connected Successfully');
  } catch (error: any) {
        console.error('❌ MongoDB Connection Error:', (error as Error).message);
    console.log('');
    console.log('🔧 To fix this issue:');
    console.log('1. Install MongoDB locally OR use MongoDB Atlas (cloud)');
    console.log('2. For MongoDB Atlas: Update MONGODB_URI in .env file');
    console.log('3. For local MongoDB: Ensure MongoDB service is running');
    console.log('4. Check the QUICKSTART.md file for detailed instructions');
    console.log('');
    console.log('⚠️  Server will continue without database (some features disabled)');
    // Don't exit, let server run without DB for now
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('📴 Mongoose disconnected');
});

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed through app termination');
  } catch (error) {
    console.log('📴 MongoDB was not connected');
  }
  process.exit(0);
});

export default connectDB;