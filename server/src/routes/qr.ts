import express from 'express';
import Organization from '../models/Organization';
import { authenticateToken } from '../middleware/auth';
import { generateQRCode } from '../utils/qrcode';
import { ApiResponse } from '../types';

const router = express.Router();

// Generate QR code for organization (protected)
router.post('/generate', authenticateToken, async (req: any, res) => {
  try {
    const organizationId = req.organization._id;
    const organizationName = req.organization.name;

    // Generate QR code
    const qrCodeBase64 = await generateQRCode(organizationId.toString(), organizationName);

    // Update organization with QR code URL
    await Organization.findByIdAndUpdate(organizationId, {
      qrCodeUrl: qrCodeBase64
    });

    const response: ApiResponse<{ qrCodeUrl: string }> = {
      success: true,
      message: 'QR code generated successfully',
      data: { qrCodeUrl: qrCodeBase64 }
    };

    res.json(response);
  } catch (error: any) {
    console.error('QR code generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current QR code for organization (protected)
router.get('/current', authenticateToken, async (req: any, res) => {
  try {
    const organizationId = req.organization._id;

    const organization = await Organization.findById(organizationId).select('qrCodeUrl');
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const response: ApiResponse<{ qrCodeUrl: string | null }> = {
      success: true,
      message: 'QR code retrieved successfully',
      data: { qrCodeUrl: organization.qrCodeUrl || null }
    };

    res.json(response);
  } catch (error: any) {
    console.error('Get QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;