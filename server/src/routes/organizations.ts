import express from 'express';
import Organization from '../models/Organization';
import { authenticateToken } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = express.Router();

// Get organization by ID (public route for guest form)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findById(id).select('-password');
    if (!organization || !organization.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found or inactive'
      });
    }

    const response: ApiResponse<any> = {
      success: true,
      message: 'Organization retrieved successfully',
      data: organization
    };

    res.json(response);
  } catch (error: any) {
    console.error('Get organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update organization (protected)
router.put('/profile', authenticateToken, async (req: any, res) => {
  try {
    const organizationId = req.organization._id;
    const {
      name,
      contactPerson,
      phone,
      address,
      locations,
      staffMembers,
      minGuestVisitMinutes
    } = req.body;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Update fields
    if (name) organization.name = name;
    if (contactPerson) organization.contactPerson = contactPerson;
    if (phone) organization.phone = phone;
    if (address) organization.address = address;
    if (locations) organization.locations = locations;
    if (staffMembers) organization.staffMembers = staffMembers;
    if (minGuestVisitMinutes !== undefined) organization.minGuestVisitMinutes = minGuestVisitMinutes;

    await organization.save();

    const response: ApiResponse = {
      success: true,
      message: 'Organization updated successfully'
    };

    res.json(response);
  } catch (error: any) {
    console.error('Update organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;