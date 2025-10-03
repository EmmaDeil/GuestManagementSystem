"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Organization_1 = __importDefault(require("../models/Organization"));
const router = express_1.default.Router();
// Organization Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        // Find organization by email
        const organization = await Organization_1.default.findOne({ email: email.toLowerCase() });
        if (!organization) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        // Check if organization is active
        if (!organization.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Organization account is deactivated'
            });
        }
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(password, organization.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        // Generate JWT token
        const payload = { organizationId: String(organization._id) };
        const secret = process.env.JWT_SECRET || 'fallback-secret';
        const options = { expiresIn: process.env.JWT_EXPIRES_IN || '7d' };
        const token = jsonwebtoken_1.default.sign(payload, secret, options);
        // Prepare response data
        const organizationData = {
            _id: String(organization._id),
            name: organization.name,
            email: organization.email,
            contactPerson: organization.contactPerson,
            phone: organization.phone,
            address: organization.address,
            locations: organization.locations,
            staffMembers: organization.staffMembers,
            minGuestVisitMinutes: organization.minGuestVisitMinutes,
            qrCodeUrl: organization.qrCodeUrl,
            isActive: organization.isActive,
            createdAt: organization.createdAt,
            updatedAt: organization.updatedAt
        };
        const responseData = {
            token,
            organization: organizationData,
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        };
        const response = {
            success: true,
            message: 'Login successful',
            data: responseData
        };
        res.json(response);
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
// Organization Registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, contactPerson, phone, address, locations = ['Reception', 'Main Office'], staffMembers = ['Reception Staff'], minGuestVisitMinutes = 15 } = req.body;
        // Validate required fields
        if (!name || !email || !password || !contactPerson || !phone || !address) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }
        // Check if organization already exists
        const existingOrganization = await Organization_1.default.findOne({ email: email.toLowerCase() });
        if (existingOrganization) {
            return res.status(409).json({
                success: false,
                message: 'Organization with this email already exists'
            });
        }
        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
        // Create organization
        const organization = new Organization_1.default({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            contactPerson,
            phone,
            address,
            locations,
            staffMembers,
            minGuestVisitMinutes
        });
        await organization.save();
        res.status(201).json({
            success: true,
            message: 'Organization registered successfully',
            data: {
                id: organization._id,
                name: organization.name,
                email: organization.email
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map