import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Organization from '../models/Organization';

dotenv.config();

const seedSystemAdmin = async () => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Environment-specific credentials
    const credentials = isProduction
      ? {
          email: 'sysadmin@guestmgmt-prod.com',
          password: 'Pr0d$yst3m!2026#Secur3',
          name: 'Production System Administrator'
        }
      : {
          email: 'system@admin.com',
          password: 'System@123',
          name: 'System Administrator'
        };

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/guest-management');
    console.log('Connected to MongoDB');

    // Check if system admin already exists
    const existingAdmin = await Organization.findOne({ email: credentials.email });
    if (existingAdmin) {
      console.log('System admin account already exists');
      console.log('📧 Email:', credentials.email);
      console.log('🔐 Password:', credentials.password);
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(credentials.password, 12);

    // Create system admin account
    const systemAdmin = new Organization({
      name: credentials.name,
      email: credentials.email,
      password: hashedPassword,
      contactPerson: 'System Admin',
      phone: '+1000000000',
      address: 'System Administration Office',
      locations: [
        'System Control',
        'Admin Office',
        'Server Room',
        'Security Office'
      ],
      staffMembers: [
        'System Administrator',
        'Security Officer',
        'IT Support'
      ],
      minGuestVisitMinutes: 15,
      isActive: true
    });

    await systemAdmin.save();
    console.log('✅ System admin account created successfully!');
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log(`🔑 ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} SYSTEM LOGIN CREDENTIALS`);
    console.log('═══════════════════════════════════════════');
    console.log('📧 Email:   ', credentials.email);
    console.log('🔐 Password:', credentials.password);
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('⚠️  Keep these credentials secure!');
    if (isProduction) {
      console.log('⚠️  Make sure to store these in a secure password manager!');
      console.log('⚠️  Consider changing the password after first login!');
    }

  } catch (error) {
    console.error('❌ Error creating system admin:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedSystemAdmin();
