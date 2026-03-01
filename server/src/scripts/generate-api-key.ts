import mongoose from 'mongoose';
import crypto from 'crypto';
import SystemConfig from '../models/SystemConfig';
import Organization from '../models/Organization';
import { API_SCOPES, SCOPE_PRESETS } from '../config/scopes';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/guest-management';

async function generateApiKey() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    console.log('\n🔑 API Key Generator');
    console.log('═══════════════════════════════════');

    // Get or create system config
    let systemConfig = await SystemConfig.findOne();
    
    if (!systemConfig) {
      console.log('No system config found. Creating new one with default system admin key...\n');
      const initialApiKey = `gma_${crypto.randomBytes(32).toString('hex')}`;
      
      systemConfig = await SystemConfig.create({
        apiKeys: [{
          key: initialApiKey,
          name: 'Default System Admin Key',
          scopes: [API_SCOPES.SYSTEM_ADMIN],
          createdAt: new Date(),
          isActive: true,
          rateLimit: 10000,
          requestCount: 0
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
      
      console.log('✅ System config and default system admin key created!\n');
      console.log('📋 Default System Admin API Key:');
      console.log('Name:', 'Default System Admin Key');
      console.log('Key:', initialApiKey);
      console.log('Scopes:', [API_SCOPES.SYSTEM_ADMIN]);
      console.log('Rate Limit:', '10000 requests/hour\n');
    } else {
      // Interactive key generation
      console.log('Available Scope Presets:');
      console.log('1. SYSTEM_ADMIN - Full system access');
      console.log('2. ORGANIZATION_ADMIN - Organization management');
      console.log('3. GUEST_REGISTRATION_ONLY - Guest registration only');
      console.log('4. ANALYTICS_READER - Read-only analytics');
      console.log('5. MOBILE_APP - Mobile app integration');
      console.log('6. READ_ONLY - Read-only access\n');

      // For demo, create a system admin key
      const newApiKey = `gma_${crypto.randomBytes(32).toString('hex')}`;
      const keyCount = systemConfig.apiKeys.length + 1;
      const keyName = `System Admin Key ${keyCount}`;
      
      systemConfig.apiKeys.push({
        key: newApiKey,
        name: keyName,
        scopes: [API_SCOPES.SYSTEM_ADMIN],
        createdAt: new Date(),
        isActive: true,
        rateLimit: 10000,
        requestCount: 0
      });
      
      await systemConfig.save();
      
      console.log('✅ New API key generated!\n');
      console.log('📋 API Key Details:');
      console.log('Name:', keyName);
      console.log('Key:', newApiKey);
      console.log('Scopes:', [API_SCOPES.SYSTEM_ADMIN]);
      console.log('Rate Limit:', '10000 requests/hour');
      console.log('Total API Keys:', systemConfig.apiKeys.length);
    }

    console.log('\n═══════════════════════════════════');
    console.log('📝 Usage:');
    console.log('Include in Authorization header:');
    console.log('Authorization: Bearer <API_KEY>');
    console.log('\n⚠️  Keep this key secure!');
    console.log('It also appears in System Configuration.\n');

    // Show available presets
    console.log('Available Scope Presets for Next Key:');
    Object.entries(SCOPE_PRESETS).forEach(([name, scopes]) => {
      console.log(`  ${name}:`, scopes);
    });

    // Show all organizations for reference
    const orgs = await Organization.find().select('_id name');
    if (orgs.length > 0) {
      console.log('\nAvailable Organizations (for org-specific keys):');
      orgs.forEach(org => {
        console.log(`  ${org.name}: ${org._id}`);
      });
    }

  } catch (error) {
    console.error('❌ Error generating API key:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

generateApiKey();
