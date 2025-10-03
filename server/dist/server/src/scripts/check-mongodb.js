#!/usr/bin/env node
"use strict";
/**
 * MongoDB Setup Checker and Helper
 *
 * This script helps you set up MongoDB for the Guest Management App
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};
const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    title: (msg) => console.log(`${colors.bold}${colors.blue}🗄️  ${msg}${colors.reset}`)
};
async function checkMongoDBConnection() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/guest-management';
    log.title('MongoDB Connection Checker');
    console.log('');
    try {
        log.info(`Attempting to connect to: ${mongoUri.replace(/\/\/.*@/, '//****@')}`);
        await mongoose_1.default.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000
        });
        log.success('MongoDB connection successful!');
        // Test basic operations
        if (mongoose_1.default.connection.db) {
            const collections = await mongoose_1.default.connection.db.listCollections().toArray();
            log.info(`Found ${collections.length} collections in database`);
        }
        else {
            log.info('Database connection established but no collections info available');
        }
        await mongoose_1.default.disconnect();
        log.success('MongoDB setup is working correctly!');
        console.log('');
        log.info('Next steps:');
        console.log('1. Run: npm run seed:demo (to create demo data)');
        console.log('2. Start your server: npm run dev');
        console.log('3. Test the application at http://localhost:3000');
        return true;
    }
    catch (error) {
        log.error('MongoDB connection failed!');
        console.log('');
        if (error.message.includes('ECONNREFUSED')) {
            log.warning('MongoDB server is not running or not accessible');
            console.log('');
            console.log('🔧 Setup Options:');
            console.log('');
            console.log('Option 1: MongoDB Atlas (Cloud - Recommended)');
            console.log('  1. Go to https://www.mongodb.com/atlas');
            console.log('  2. Create free account and cluster');
            console.log('  3. Update MONGODB_URI in .env file');
            console.log('  4. See MONGODB_SETUP.md for detailed guide');
            console.log('');
            console.log('Option 2: Local MongoDB');
            console.log('  1. Download: https://www.mongodb.com/try/download/community');
            console.log('  2. Install and start MongoDB service');
            console.log('  3. Keep current MONGODB_URI in .env file');
            console.log('');
            console.log('Option 3: Docker');
            console.log('  1. Install Docker Desktop');
            console.log('  2. Run: docker run --name mongo -p 27017:27017 -d mongo');
            console.log('  3. Keep current MONGODB_URI in .env file');
        }
        else if (error.message.includes('authentication')) {
            log.warning('Authentication failed - check username/password in connection string');
        }
        else if (error.message.includes('network')) {
            log.warning('Network error - check if MongoDB Atlas IP allowlist includes your IP');
        }
        else {
            log.error(`Connection error: ${error.message}`);
        }
        console.log('');
        log.info('See MONGODB_SETUP.md for complete setup instructions');
        return false;
    }
}
async function main() {
    const isConnected = await checkMongoDBConnection();
    process.exit(isConnected ? 0 : 1);
}
if (require.main === module) {
    main().catch(console.error);
}
exports.default = checkMongoDBConnection;
//# sourceMappingURL=check-mongodb.js.map