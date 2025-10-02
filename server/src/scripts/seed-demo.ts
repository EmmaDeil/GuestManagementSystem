import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Organization from '../models/Organization';

dotenv.config();

const seedDemoOrganization = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/guest-management');
    console.log('Connected to MongoDB');

    // Check if demo organization already exists
    const existingOrg = await Organization.findOne({ email: 'demo@organization.com' });
    if (existingOrg) {
      console.log('Demo organization already exists');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('demo123', 12);

    // Create demo organization
    const demoOrganization = new Organization({
      name: 'Demo Organization',
      email: 'demo@organization.com',
      password: hashedPassword,
      contactPerson: 'John Demo',
      phone: '+1234567890',
      address: '123 Demo Street, Demo City, DC 12345',
      locations: [
        'Reception',
        'Main Office',
        'Conference Room A',
        'Conference Room B',
        'IT Department',
        'HR Department'
      ],
      staffMembers: [
        'John Smith - Manager',
        'Jane Doe - HR Director',
        'Mike Johnson - IT Lead',
        'Sarah Wilson - Operations',
        'Reception Staff'
      ],
      minGuestVisitMinutes: 15,
      isActive: true
    });

    await demoOrganization.save();
    console.log('✅ Demo organization created successfully!');
    console.log('📧 Email: demo@organization.com');
    console.log('🔐 Password: demo123');

  } catch (error) {
    console.error('❌ Error creating demo organization:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedDemoOrganization();