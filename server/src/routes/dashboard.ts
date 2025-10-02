import express from 'express';
import Guest from '../models/Guest';
import { authenticateToken } from '../middleware/auth';
import { DashboardStats, ApiResponse } from '../types';

const router = express.Router();

// Get dashboard statistics (protected)
router.get('/stats', authenticateToken, async (req: any, res) => {
  try {
    const organizationId = req.organization._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Run queries in parallel for better performance
    const [
      totalGuests,
      activeGuests,
      todayGuests,
      pendingIdAssignments
    ] = await Promise.all([
      Guest.countDocuments({ organizationId }),
      Guest.countDocuments({ organizationId, status: 'signed-in' }),
      Guest.countDocuments({ 
        organizationId, 
        createdAt: { $gte: today, $lt: tomorrow }
      }),
      Guest.countDocuments({ 
        organizationId, 
        status: 'signed-in',
        idCardAssigned: false 
      })
    ]);

    const stats: DashboardStats = {
      totalGuests,
      activeGuests,
      todayGuests,
      pendingIdAssignments
    };

    const response: ApiResponse<DashboardStats> = {
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: stats
    };

    res.json(response);
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get recent guest activity (protected)
router.get('/activity', authenticateToken, async (req: any, res) => {
  try {
    const organizationId = req.organization._id;
    const limit = parseInt(req.query.limit as string) || 10;

    const recentGuests = await Guest.find({ organizationId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('guestName guestCode personToSee status signInTime signOutTime idCardAssigned');

    const response: ApiResponse<any> = {
      success: true,
      message: 'Recent activity retrieved successfully',
      data: { recentGuests }
    };

    res.json(response);
  } catch (error: any) {
    console.error('Dashboard activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;