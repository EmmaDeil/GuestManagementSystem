import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Organization from '../models/Organization';

dotenv.config();

const seedSystemAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/guest-management');
    console.log('Connected to MongoDB');

    // Check if system admin already exists
    const existingAdmin = await Organization.findOne({ email: 'system@admin.com' });
    if (existingAdmin) {
      console.log('System admin account already exists');
      console.log('📧 Email: system@admin.com');
      console.log('🔐 Password: System@123');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('System@123', 12);

    // Create system admin account
    const systemAdmin = new Organization({
      name: 'System Administrator',
      email: 'system@admin.com',
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
    console.log('🔑 SYSTEM LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════════');
    console.log('📧 Email:    system@admin.com');
    console.log('🔐 Password: System@123');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('⚠️  Keep these credentials secure!');

  } catch (error) {
    console.error('❌ Error creating system admin:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedSystemAdmin();
