"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Organization_1 = __importDefault(require("../models/Organization"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get organization by ID (public route for guest form)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const organization = await Organization_1.default.findById(id).select('-password');
        if (!organization || !organization.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found or inactive'
            });
        }
        const response = {
            success: true,
            message: 'Organization retrieved successfully',
            data: organization
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get organization error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
// Update organization (protected)
router.put('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const organizationId = req.organization._id;
        const { name, contactPerson, phone, address, locations, staffMembers, minGuestVisitMinutes } = req.body;
        const organization = await Organization_1.default.findById(organizationId);
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }
        // Update fields
        if (name)
            organization.name = name;
        if (contactPerson)
            organization.contactPerson = contactPerson;
        if (phone)
            organization.phone = phone;
        if (address)
            organization.address = address;
        if (locations)
            organization.locations = locations;
        if (staffMembers)
            organization.staffMembers = staffMembers;
        if (minGuestVisitMinutes !== undefined)
            organization.minGuestVisitMinutes = minGuestVisitMinutes;
        await organization.save();
        const response = {
            success: true,
            message: 'Organization updated successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Update organization error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
exports.default = router;
//# sourceMappingURL=organizations.js.map