import mongoose from 'mongoose';
import crypto from 'crypto';
import SystemConfig from '../models/SystemConfig';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/guest-management';

async function generateApiKey() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get or create system config
    let systemConfig = await SystemConfig.findOne();
    
    if (!systemConfig) {
      console.log('No system config found. Creating new one...');
      const initialApiKey = `gma_${crypto.randomBytes(32).toString('hex')}`;
      
      systemConfig = await SystemConfig.create({
        apiKeys: [{
          key: initialApiKey,
          name: 'Default API Key',
          createdAt: new Date(),
          isActive: true
        }],
        systemVersion: '1.0.0',
        features: {
          qrCodeEnabled: true,
          analyticsEnabled: true,
          notificationsEnabled: true,
          emailIntegration: false
        },
        security: {
          twoFactorAuth: false,
          passwordPolicy: {
            minLength: 6,
            requireUppercase: false,
            requireNumbers: false,
            requireSpecialChars: false
          },
          sessionTimeout: 24 * 60 * 60 * 1000
        },
        defaultMinVisitMinutes: 15,
        maxSessionDuration: '24h'
      });
      
      console.log('\n✅ System config and default API key created!');
      console.log('\nDefault API Key:');
      console.log('Name:', 'Default API Key');
      console.log('Key:', initialApiKey);
    } else {
      // Add new API key to existing config
      const newApiKey = `gma_${crypto.randomBytes(32).toString('hex')}`;
      const keyCount = systemConfig.apiKeys.length + 1;
      const keyName = `API Key ${keyCount}`;
      
      systemConfig.apiKeys.push({
        key: newApiKey,
        name: keyName,
        createdAt: new Date(),
        isActive: true
      });
      
      await systemConfig.save();
      
      console.log('\n✅ New API key generated!');
      console.log('\nAPI Key Details:');
      console.log('Name:', keyName);
      console.log('Key:', newApiKey);
      console.log('\nTotal API Keys:', systemConfig.apiKeys.length);
    }

    console.log('\n📋 Copy this key and use it in your applications!');
    console.log('⚠️  This key will also be visible in System Configuration page.\n');

  } catch (error) {
    console.error('❌ Error generating API key:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

generateApiKey();
