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
        console.log('🔄 Attempting to connect to MongoDB...');
        console.log(`📍 Connection URI: ${mongoUri.replace(/\/\/.*@/, '//****@')}`);
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ MongoDB Connected Successfully');
    }
    catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
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
//# sourceMappingURL=database.js.map