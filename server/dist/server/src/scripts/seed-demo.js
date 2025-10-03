"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const Organization_1 = __importDefault(require("../models/Organization"));
dotenv_1.default.config();
const seedDemoOrganization = async () => {
    try {
        // Connect to MongoDB
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/guest-management');
        console.log('Connected to MongoDB');
        // Check if demo organization already exists
        const existingOrg = await Organization_1.default.findOne({ email: 'demo@organization.com' });
        if (existingOrg) {
            console.log('Demo organization already exists');
            process.exit(0);
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash('demo123', 12);
        // Create demo organization
        const demoOrganization = new Organization_1.default({
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
    }
    catch (error) {
        console.error('❌ Error creating demo organization:', error);
    }
    finally {
        await mongoose_1.default.connection.close();
        process.exit(0);
    }
};
seedDemoOrganization();
//# sourceMappingURL=seed-demo.js.map