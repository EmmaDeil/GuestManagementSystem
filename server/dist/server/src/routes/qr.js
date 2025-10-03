"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Organization_1 = __importDefault(require("../models/Organization"));
const auth_1 = require("../middleware/auth");
const qrcode_1 = require("../utils/qrcode");
const router = express_1.default.Router();
// Generate QR code for organization (protected)
router.post('/generate', auth_1.authenticateToken, async (req, res) => {
    try {
        const organizationId = req.organization._id;
        const organizationName = req.organization.name;
        // Generate QR code
        const qrCodeBase64 = await (0, qrcode_1.generateQRCode)(organizationId.toString(), organizationName);
        // Update organization with QR code URL
        await Organization_1.default.findByIdAndUpdate(organizationId, {
            qrCodeUrl: qrCodeBase64
        });
        const response = {
            success: true,
            message: 'QR code generated successfully',
            data: { qrCodeUrl: qrCodeBase64 }
        };
        res.json(response);
    }
    catch (error) {
        console.error('QR code generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate QR code',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
// Get current QR code for organization (protected)
router.get('/current', auth_1.authenticateToken, async (req, res) => {
    try {
        const organizationId = req.organization._id;
        const organization = await Organization_1.default.findById(organizationId).select('qrCodeUrl');
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }
        const response = {
            success: true,
            message: 'QR code retrieved successfully',
            data: { qrCodeUrl: organization.qrCodeUrl || null }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get QR code error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
exports.default = router;
//# sourceMappingURL=qr.js.map