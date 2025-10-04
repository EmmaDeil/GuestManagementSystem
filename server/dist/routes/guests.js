"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Guest_1 = __importDefault(require("../models/Guest"));
const Organization_1 = __importDefault(require("../models/Organization"));
const auth_1 = require("../middleware/auth");
const qrcode_1 = require("../utils/qrcode");
const router = express_1.default.Router();
// Register a new guest (public route)
router.post('/register', async (req, res) => {
    try {
        const { guestName, guestPhone, guestEmail, organizationId, location, personToSee, purpose, expectedDuration } = req.body;
        // Validate required fields
        if (!guestName || !guestPhone || !organizationId || !location || !personToSee || !expectedDuration) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }
        // Verify organization exists
        const organization = await Organization_1.default.findById(organizationId);
        if (!organization || !organization.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found or inactive'
            });
        }
        // Generate unique guest code
        let guestCode;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;
        while (!isUnique && attempts < maxAttempts) {
            guestCode = (0, qrcode_1.generateGuestCode)();
            const existingGuest = await Guest_1.default.findOne({ guestCode });
            if (!existingGuest) {
                isUnique = true;
            }
            attempts++;
        }
        if (!isUnique) {
            return res.status(500).json({
                success: false,
                message: 'Unable to generate unique guest code. Please try again.'
            });
        }
        // Create guest record
        const guest = new Guest_1.default({
            guestName,
            guestPhone,
            guestEmail,
            guestCode: guestCode,
            organizationId,
            location,
            personToSee,
            purpose,
            expectedDuration,
            minVisitDuration: organization.minGuestVisitMinutes,
            signInTime: new Date()
        });
        await guest.save();
        const response = {
            success: true,
            message: 'Guest registered successfully',
            data: { guestCode: guestCode }
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Guest registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
// Get all guests for an organization (protected)
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const organizationId = req.organization._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const status = req.query.status;
        // Build query
        const query = { organizationId };
        if (status) {
            query.status = status;
        }
        // Get guests with pagination
        const skip = (page - 1) * limit;
        const guests = await Guest_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('organizationId', 'name');
        const total = await Guest_1.default.countDocuments(query);
        const response = {
            success: true,
            message: 'Guests retrieved successfully',
            data: {
                guests,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get guests error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
// Sign out a guest
router.post('/signout', async (req, res) => {
    try {
        const { guestCode, organizationId } = req.body;
        if (!guestCode || !organizationId) {
            return res.status(400).json({
                success: false,
                message: 'Guest code and organization ID are required'
            });
        }
        // Find the guest
        const guest = await Guest_1.default.findOne({
            guestCode,
            organizationId,
            status: 'signed-in'
        });
        if (!guest) {
            return res.status(404).json({
                success: false,
                message: 'Guest not found or already signed out'
            });
        }
        // Check minimum visit time
        if (!(0, qrcode_1.hasMinimumVisitTimePassed)(guest.signInTime, guest.minVisitDuration)) {
            return res.status(400).json({
                success: false,
                message: `Minimum visit time of ${guest.minVisitDuration} minutes has not passed`
            });
        }
        // Update guest status
        guest.signOutTime = new Date();
        guest.status = 'signed-out';
        await guest.save();
        const response = {
            success: true,
            message: 'Guest signed out successfully',
            data: {
                guestCode: guest.guestCode,
                signOutTime: guest.signOutTime,
                visitDuration: Math.round((guest.signOutTime.getTime() - guest.signInTime.getTime()) / (1000 * 60))
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Guest sign out error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
// Assign ID card to guest (protected)
router.patch('/:guestId/assign-id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { guestId } = req.params;
        const { idCardNumber } = req.body;
        const organizationId = req.organization._id;
        if (!idCardNumber) {
            return res.status(400).json({
                success: false,
                message: 'ID card number is required'
            });
        }
        // Find and update guest
        const guest = await Guest_1.default.findOne({
            _id: guestId,
            organizationId,
            status: 'signed-in'
        });
        if (!guest) {
            return res.status(404).json({
                success: false,
                message: 'Guest not found'
            });
        }
        guest.idCardNumber = idCardNumber;
        guest.idCardAssigned = true;
        await guest.save();
        const response = {
            success: true,
            message: 'ID card assigned successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Assign ID card error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
// Admin sign out guest route
router.patch('/:id/signout', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const organizationId = req.organization._id;
        const guest = await Guest_1.default.findOne({ _id: id, organizationId });
        if (!guest) {
            return res.status(404).json({
                success: false,
                message: 'Guest not found'
            });
        }
        if (guest.status !== 'signed-in') {
            return res.status(400).json({
                success: false,
                message: 'Guest is not currently signed in'
            });
        }
        // Update guest status
        guest.status = 'signed-out';
        guest.signOutTime = new Date();
        await guest.save();
        const response = {
            success: true,
            message: 'Guest signed out successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Sign out guest error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
// Extend guest visit duration
router.patch('/:id/extend', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { additionalMinutes } = req.body;
        const organizationId = req.organization._id;
        if (!additionalMinutes || additionalMinutes <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Additional minutes must be a positive number'
            });
        }
        const guest = await Guest_1.default.findOne({ _id: id, organizationId });
        if (!guest) {
            return res.status(404).json({
                success: false,
                message: 'Guest not found'
            });
        }
        if (guest.status !== 'signed-in') {
            return res.status(400).json({
                success: false,
                message: 'Can only extend visit for signed-in guests'
            });
        }
        // Extend the expected duration
        guest.expectedDuration += additionalMinutes;
        await guest.save();
        const response = {
            success: true,
            message: `Visit extended by ${additionalMinutes} minutes`,
            data: {
                newExpectedDuration: guest.expectedDuration
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Extend visit error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
// Export guests data with date range filtering
router.get('/export', auth_1.authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const organizationId = req.organization._id;
        // Build query with date range filtering
        const query = { organizationId };
        if (startDate || endDate) {
            query.signInTime = {};
            if (startDate) {
                query.signInTime.$gte = new Date(startDate);
            }
            if (endDate) {
                // Add one day to include the end date
                const endDateTime = new Date(endDate);
                endDateTime.setDate(endDateTime.getDate() + 1);
                query.signInTime.$lt = endDateTime;
            }
        }
        const guests = await Guest_1.default.find(query)
            .populate('organizationId', 'name')
            .sort({ signInTime: -1 });
        // Format data for export
        const exportData = guests.map(guest => {
            const populatedOrg = guest.organizationId;
            return {
                guestName: guest.guestName || 'N/A',
                guestPhone: guest.guestPhone || 'N/A',
                guestEmail: guest.guestEmail || 'Not provided',
                guestCode: guest.guestCode || 'N/A',
                location: guest.location || 'N/A',
                personToSee: guest.personToSee || 'N/A',
                purpose: guest.purpose || 'Not specified',
                signInTime: guest.signInTime || null,
                signOutTime: guest.signOutTime || null,
                expectedDuration: guest.expectedDuration || 0,
                status: guest.status || 'Unknown',
                idCardAssigned: Boolean(guest.idCardAssigned),
                idCardNumber: guest.idCardNumber || 'Not assigned',
                organization: populatedOrg?.name || 'Unknown'
            };
        });
        const response = {
            success: true,
            message: 'Guest data exported successfully',
            data: exportData
        };
        res.json(response);
    }
    catch (error) {
        console.error('Export guests error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
exports.default = router;
