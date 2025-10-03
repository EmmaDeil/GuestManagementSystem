"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Guest_1 = __importDefault(require("../models/Guest"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get dashboard statistics (protected)
router.get('/stats', auth_1.authenticateToken, async (req, res) => {
    try {
        const organizationId = req.organization._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        // Run queries in parallel for better performance
        const [totalGuests, activeGuests, todayGuests, pendingIdAssignments] = await Promise.all([
            Guest_1.default.countDocuments({ organizationId }),
            Guest_1.default.countDocuments({ organizationId, status: 'signed-in' }),
            Guest_1.default.countDocuments({
                organizationId,
                createdAt: { $gte: today, $lt: tomorrow }
            }),
            Guest_1.default.countDocuments({
                organizationId,
                status: 'signed-in',
                idCardAssigned: false
            })
        ]);
        const stats = {
            totalGuests,
            activeGuests,
            todayGuests,
            pendingIdAssignments
        };
        const response = {
            success: true,
            message: 'Dashboard statistics retrieved successfully',
            data: stats
        };
        res.json(response);
    }
    catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
// Get recent guest activity (protected)
router.get('/activity', auth_1.authenticateToken, async (req, res) => {
    try {
        const organizationId = req.organization._id;
        const limit = parseInt(req.query.limit) || 10;
        const recentGuests = await Guest_1.default.find({ organizationId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('guestName guestCode personToSee status signInTime signOutTime idCardAssigned');
        const response = {
            success: true,
            message: 'Recent activity retrieved successfully',
            data: { recentGuests }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Dashboard activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map