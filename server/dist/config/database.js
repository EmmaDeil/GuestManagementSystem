"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/guest-management';
        const nodeEnv = process.env.NODE_ENV || 'development';
        console.log('🔄 MongoDB Connection Attempt');
        console.log('═══════════════════════════════════════');
        console.log(`📍 Environment: ${nodeEnv}`);
        console.log(`📍 Connection URI: ${mongoUri.replace(/\/\/.*@/, '//[CREDENTIALS_HIDDEN]@')}`);
        console.log(`📍 Database: ${mongoUri.split('/').pop()?.split('?')[0] || 'Unknown'}`);
        const connectionOptions = {
            // Add connection options for better debugging
            serverSelectionTimeoutMS: 5000, // 5 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds timeout
        };
        await mongoose_1.default.connect(mongoUri, connectionOptions);
        console.log('✅ MongoDB Connected Successfully');
        console.log(`🔗 Connected to: ${mongoose_1.default.connection.name}`);
        console.log(`📊 Connection state: ${mongoose_1.default.connection.readyState}`);
        console.log('═══════════════════════════════════════');
    }
    catch (error) {
        console.error('❌ MongoDB Connection Failed');
        console.error('═══════════════════════════════════════');
        console.error(`❌ Error: ${error.message}`);
        console.error(`❌ Error Code: ${error.code || 'Unknown'}`);
        console.error(`❌ Error Name: ${error.name || 'Unknown'}`);
        if (error.code === 'ENOTFOUND') {
            console.log('🌐 Network Error: Cannot resolve MongoDB host');
        }
        else if (error.code === 'ECONNREFUSED') {
            console.log('🚫 Connection Refused: MongoDB server is not running');
        }
        else if (error.name === 'MongooseServerSelectionError') {
            console.log('⏰ Server Selection Timeout: Cannot connect to MongoDB cluster');
        }
        console.log('');
        console.log('🔧 Troubleshooting Steps:');
        console.log('1. Check MongoDB Atlas cluster status');
        console.log('2. Verify MONGODB_URI credentials');
        console.log('3. Check network connectivity');
        console.log('4. Ensure IP whitelist includes your deployment IP');
        console.log('5. For local development: Ensure MongoDB service is running');
        console.log('');
        console.log('⚠️  Server will continue without database (some features disabled)');
        console.log('═══════════════════════════════════════');
        // Don't exit, let server run without DB for now
    }
};
// Handle connection events
mongoose_1.default.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to MongoDB');
});
mongoose_1.default.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err.message);
});
mongoose_1.default.connection.on('disconnected', () => {
    console.log('📴 Mongoose disconnected');
});
// Handle process termination
process.on('SIGINT', async () => {
    try {
        await mongoose_1.default.connection.close();
        console.log('🔌 MongoDB connection closed through app termination');
    }
    catch (error) {
        console.log('📴 MongoDB was not connected');
    }
    process.exit(0);
});
exports.default = connectDB;
