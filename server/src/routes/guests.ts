import express from 'express';
import Guest from '../models/Guest';
import Organization from '../models/Organization';
import { authenticateToken } from '../middleware/auth';
import { generateGuestCode, hasMinimumVisitTimePassed } from '../utils/qrcode';
import { GuestRegistrationRequest, GuestSignOutRequest, ApiResponse } from '../types';

const router = express.Router();

// Register a new guest (public route)
router.post('/register', async (req, res) => {
  try {
    const {
      guestName,
      guestPhone,
      guestEmail,
      organizationId,
      location,
      personToSee,
      purpose,
      expectedDuration
    }: GuestRegistrationRequest = req.body;

    // Validate required fields
    if (!guestName || !guestPhone || !organizationId || !location || !personToSee || !expectedDuration) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Verify organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization || !organization.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found or inactive'
      });
    }

    // Generate unique guest code
    let guestCode: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      guestCode = generateGuestCode();
      const existingGuest = await Guest.findOne({ guestCode });
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
    const guest = new Guest({
      guestName,
      guestPhone,
      guestEmail,
      guestCode: guestCode!,
      organizationId,
      location,
      personToSee,
      purpose,
      expectedDuration,
      minVisitDuration: organization.minGuestVisitMinutes,
      signInTime: new Date()
    });

    await guest.save();

    const response: ApiResponse<{ guestCode: string }> = {
      success: true,
      message: 'Guest registered successfully',
      data: { guestCode: guestCode! }
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Guest registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all guests for an organization (protected)
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const organizationId = req.organization._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const status = req.query.status as string;

    // Build query
    const query: any = { organizationId };
    if (status) {
      query.status = status;
    }

    // Get guests with pagination
    const skip = (page - 1) * limit;
    const guests = await Guest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('organizationId', 'name');

    const total = await Guest.countDocuments(query);

    const response: ApiResponse<any> = {
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
  } catch (error: any) {
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
    const { guestCode, organizationId }: GuestSignOutRequest = req.body;

    if (!guestCode || !organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Guest code and organization ID are required'
      });
    }

    // Find the guest
    const guest = await Guest.findOne({ 
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
    if (!hasMinimumVisitTimePassed(guest.signInTime, guest.minVisitDuration)) {
      return res.status(400).json({
        success: false,
        message: `Minimum visit time of ${guest.minVisitDuration} minutes has not passed`
      });
    }

    // Update guest status
    guest.signOutTime = new Date();
    guest.status = 'signed-out';
    await guest.save();

    const response: ApiResponse<any> = {
      success: true,
      message: 'Guest signed out successfully',
      data: {
        guestCode: guest.guestCode,
        signOutTime: guest.signOutTime,
        visitDuration: Math.round((guest.signOutTime.getTime() - guest.signInTime.getTime()) / (1000 * 60))
      }
    };

    res.json(response);
  } catch (error: any) {
    console.error('Guest sign out error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Assign ID card to guest (protected)
router.patch('/:guestId/assign-id', authenticateToken, async (req: any, res) => {
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
    const guest = await Guest.findOne({
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

    const response: ApiResponse = {
      success: true,
      message: 'ID card assigned successfully'
    };

    res.json(response);
  } catch (error: any) {
    console.error('Assign ID card error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;