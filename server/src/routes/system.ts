import express, { Request, Response } from 'express';
import { authenticateToken, requireScopes } from '../middleware/auth';
import Organization from '../models/Organization';
import Guest from '../models/Guest';
import SystemConfig from '../models/SystemConfig';
import { API_SCOPES, SCOPE_PRESETS, validateScopes } from '../config/scopes';
import { getAuditLogs } from '../utils/audit';
import crypto from 'crypto';

const router = express.Router();

// System Configuration Routes

// Get system configuration
router.get('/config', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Get or create system config
    let systemConfig = await SystemConfig.findOne();
    
    if (!systemConfig) {
      // Generate initial API key with system admin scope
      const initialApiKey = `gma_${crypto.randomBytes(32).toString('hex')}`;
      
      // Create default config if it doesn't exist
      systemConfig = await SystemConfig.create({
        apiKeys: [{
          key: initialApiKey,
          name: 'Default System Admin Key',
          scopes: [API_SCOPES.SYSTEM_ADMIN],
          createdAt: new Date(),
          isActive: true,
          rateLimit: 10000,
          requestCount: 0
        }],
        systemVersion: '1.0.0',
        features: {
          qrCodeEnabled: true,
          analyticsEnabled: true,
          notificationsEnabled: true,
          emailIntegration: false
        },
        security: {
          twoFactorAuth: false,
          passwordPolicy: {
            minLength: 6,
            requireUppercase: false,
            requireNumbers: false,
            requireSpecialChars: false
          },
          sessionTimeout: 24 * 60 * 60 * 1000
        },
        defaultMinVisitMinutes: 15,
        maxSessionDuration: '24h'
      });
    } else if (!systemConfig.apiKeys || systemConfig.apiKeys.length === 0) {
      // If config exists but has no API keys, add a default one
      const defaultApiKey = `gma_${crypto.randomBytes(32).toString('hex')}`;
      systemConfig.apiKeys = [{
        key: defaultApiKey,
        name: 'Default System Admin Key',
        scopes: [API_SCOPES.SYSTEM_ADMIN],
        createdAt: new Date(),
        isActive: true,
        rateLimit: 10000,
        requestCount: 0
      }];
      await systemConfig.save();
    }

    // Get organization counts
    const totalOrganizations = await Organization.countDocuments();
    const activeOrganizations = await Organization.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        ...systemConfig.toObject(),
        totalOrganizations,
        activeOrganizations
      }
    });
  } catch (error) {
    console.error('Error fetching system config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system configuration'
    });
  }
});

// Update system configuration
router.patch('/config', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { defaultMinVisitMinutes, maxSessionDuration, features, security } = req.body;

    let systemConfig = await SystemConfig.findOne();
    
    if (!systemConfig) {
      systemConfig = new SystemConfig({});
    }

    // Update fields if provided
    if (defaultMinVisitMinutes !== undefined) {
      systemConfig.defaultMinVisitMinutes = defaultMinVisitMinutes;
    }
    if (maxSessionDuration !== undefined) {
      systemConfig.maxSessionDuration = maxSessionDuration;
    }
    if (features) {
      systemConfig.features = { ...systemConfig.features, ...features };
    }
    if (security) {
      systemConfig.security = { ...systemConfig.security, ...security };
    }

    await systemConfig.save();
    
    res.json({
      success: true,
      message: 'System configuration updated successfully',
      data: systemConfig
    });
  } catch (error) {
    console.error('Error updating system config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update system configuration'
    });
  }
});

// API Key Management Routes

// Get available scopes and presets
router.get('/api-keys/scopes', authenticateToken, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        availableScopes: Object.values(API_SCOPES),
        presets: SCOPE_PRESETS
      }
    });
  } catch (error) {
    console.error('Error fetching scopes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scopes'
    });
  }
});

// Generate new API key
router.post('/api-keys/generate', authenticateToken, requireScopes([API_SCOPES.API_KEYS_WRITE]), async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      scopes, 
      organizationId, 
      expiresInDays,
      rateLimit,
      preset 
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'API key name is required'
      });
    }

    // Determine scopes
    let finalScopes: string[] = [];
    
    if (preset && SCOPE_PRESETS[preset as keyof typeof SCOPE_PRESETS]) {
      finalScopes = [...SCOPE_PRESETS[preset as keyof typeof SCOPE_PRESETS]];
    } else if (scopes && Array.isArray(scopes)) {
      finalScopes = scopes;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either scopes array or preset must be provided'
      });
    }

    // Validate scopes
    const validation = validateScopes(finalScopes);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scopes provided',
        invalidScopes: validation.invalidScopes
      });
    }

    // Validate organization if provided
    if (organizationId) {
      const org = await Organization.findById(organizationId);
      if (!org) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
      }
    }

    let systemConfig = await SystemConfig.findOne();
    
    if (!systemConfig) {
      systemConfig = new SystemConfig({});
    }

    // Generate a secure random API key
    const apiKey = `gma_${crypto.randomBytes(32).toString('hex')}`;

    // Calculate expiration date
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    // Add the new API key
    systemConfig.apiKeys.push({
      key: apiKey,
      name,
      scopes: finalScopes,
      organizationId: organizationId || undefined,
      createdAt: new Date(),
      expiresAt,
      isActive: true,
      rateLimit: rateLimit || 1000,
      requestCount: 0
    });

    await systemConfig.save();

    res.json({
      success: true,
      message: 'API key generated successfully',
      data: {
        key: apiKey,
        name,
        scopes: finalScopes,
        organizationId,
        expiresAt,
        rateLimit: rateLimit || 1000,
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error generating API key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate API key'
    });
  }
});

// Revoke API key
router.delete('/api-keys/:key', authenticateToken, requireScopes([API_SCOPES.API_KEYS_DELETE]), async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    const systemConfig = await SystemConfig.findOne();
    
    if (!systemConfig) {
      return res.status(404).json({
        success: false,
        message: 'System configuration not found'
      });
    }

    // Find and remove the API key
    const keyIndex = systemConfig.apiKeys.findIndex(k => k.key === key);
    
    if (keyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }

    systemConfig.apiKeys.splice(keyIndex, 1);
    await systemConfig.save();

    res.json({
      success: true,
      message: 'API key revoked successfully'
    });
  } catch (error) {
    console.error('Error revoking API key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke API key'
    });
  }
});

// Update API key (toggle active status, update rate limit, etc.)
router.patch('/api-keys/:key', authenticateToken, requireScopes([API_SCOPES.API_KEYS_WRITE]), async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { isActive, rateLimit, name } = req.body;

    const systemConfig = await SystemConfig.findOne();
    
    if (!systemConfig) {
      return res.status(404).json({
        success: false,
        message: 'System configuration not found'
      });
    }

    const apiKey = systemConfig.apiKeys.find(k => k.key === key);
    
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }

    // Update fields
    if (isActive !== undefined) apiKey.isActive = isActive;
    if (rateLimit !== undefined) apiKey.rateLimit = rateLimit;
    if (name !== undefined) apiKey.name = name;

    await systemConfig.save();

    res.json({
      success: true,
      message: 'API key updated successfully',
      data: {
        key: apiKey.key,
        name: apiKey.name,
        isActive: apiKey.isActive,
        rateLimit: apiKey.rateLimit
      }
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update API key'
    });
  }
});

// Reset API key request count (for rate limiting)
router.post('/api-keys/:key/reset-count', authenticateToken, requireScopes([API_SCOPES.API_KEYS_WRITE]), async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    const systemConfig = await SystemConfig.findOne();
    
    if (!systemConfig) {
      return res.status(404).json({
        success: false,
        message: 'System configuration not found'
      });
    }

    const apiKey = systemConfig.apiKeys.find(k => k.key === key);
    
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }

    apiKey.requestCount = 0;
    await systemConfig.save();

    res.json({
      success: true,
      message: 'API key request count reset successfully'
    });
  } catch (error) {
    console.error('Error resetting API key count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset API key count'
    });
  }
});

// User Management Routes

// Get all organizations (users)
router.get('/users', authenticateToken, async (req: Request, res: Response) => {
  try {
    const users = await Organization.find()
      .select('-password')
      .sort({ createdAt: -1 });

    const usersWithStats = await Promise.all(users.map(async (user) => {
      const totalGuests = await Guest.countDocuments({ organizationId: user._id });
      const activeGuests = await Guest.countDocuments({ 
        organizationId: user._id, 
        status: 'signed-in' 
      });

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        contactPerson: user.contactPerson,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt,
        stats: {
          totalGuests,
          activeGuests
        }
      };
    }));

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        total: usersWithStats.length
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get user by ID
router.get('/users/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await Organization.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const totalGuests = await Guest.countDocuments({ organizationId: user._id });
    const activeGuests = await Guest.countDocuments({ 
      organizationId: user._id, 
      status: 'signed-in' 
    });

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        stats: {
          totalGuests,
          activeGuests
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// Update user status
router.patch('/users/:id/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { isActive } = req.body;
    
    const user = await Organization.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

// Delete user
router.delete('/users/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await Organization.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Also delete all guests associated with this organization
    await Guest.deleteMany({ organizationId: req.params.id });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Advanced Analytics Routes

// Get system-wide analytics
router.get('/analytics', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate as string);
    }

    const guestFilter: any = {};
    if (Object.keys(dateFilter).length > 0) {
      guestFilter.signInTime = dateFilter;
    }

    // Aggregate statistics
    const [
      totalOrganizations,
      activeOrganizations,
      totalGuests,
      activeGuests,
      todayGuests,
      averageVisitDuration
    ] = await Promise.all([
      Organization.countDocuments(),
      Organization.countDocuments({ isActive: true }),
      Guest.countDocuments(guestFilter),
      Guest.countDocuments({ ...guestFilter, status: 'signed-in' }),
      Guest.countDocuments({
        signInTime: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }),
      Guest.aggregate([
        {
          $match: {
            status: 'signed-out',
            signOutTime: { $exists: true }
          }
        },
        {
          $project: {
            duration: {
              $subtract: ['$signOutTime', '$signInTime']
            }
          }
        },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: '$duration' }
          }
        }
      ])
    ]);

    // Get guests by organization
    const guestsByOrganization = await Guest.aggregate([
      { $match: guestFilter },
      {
        $group: {
          _id: '$organizationId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'organizations',
          localField: '_id',
          foreignField: '_id',
          as: 'organization'
        }
      },
      {
        $unwind: '$organization'
      },
      {
        $project: {
          organizationName: '$organization.name',
          guestCount: '$count'
        }
      },
      {
        $sort: { guestCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get daily guest trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyTrends = await Guest.aggregate([
      {
        $match: {
          signInTime: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$signInTime' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get peak hours
    const peakHours = await Guest.aggregate([
      {
        $match: guestFilter
      },
      {
        $project: {
          hour: { $hour: '$signInTime' }
        }
      },
      {
        $group: {
          _id: '$hour',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalOrganizations,
          activeOrganizations,
          totalGuests,
          activeGuests,
          todayGuests,
          averageVisitDuration: averageVisitDuration[0]?.avgDuration 
            ? Math.round(averageVisitDuration[0].avgDuration / 60000) // Convert to minutes
            : 0
        },
        guestsByOrganization,
        dailyTrends,
        peakHours,
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
});

// Get activity logs
router.get('/logs', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { limit = 100, page = 1 } = req.query;
    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);

    // Get recent guest activities
    const recentActivities = await Guest.find()
      .sort({ signInTime: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .populate('organizationId', 'name');

    const totalActivities = await Guest.countDocuments();

    const logs = recentActivities.map(guest => ({
      id: guest._id,
      type: guest.status === 'signed-in' ? 'sign-in' : 'sign-out',
      guestName: guest.guestName,
      organization: (guest.organizationId as any)?.name || 'Unknown',
      timestamp: guest.status === 'signed-in' ? guest.signInTime : guest.signOutTime,
      guestCode: guest.guestCode
    }));

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total: totalActivities,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalActivities / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs'
    });
  }
});

// Get audit logs (API key usage, system actions)
router.get('/audit-logs', authenticateToken, requireScopes([API_SCOPES.SYSTEM_LOGS_READ]), async (req: Request, res: Response) => {
  try {
    const {
      action,
      resource,
      apiKeyId,
      organizationId,
      startDate,
      endDate,
      limit = 100,
      page = 1
    } = req.query;

    const filters: any = {
      limit: parseInt(limit as string),
      page: parseInt(page as string)
    };

    if (action) filters.action = action;
    if (resource) filters.resource = resource;
    if (apiKeyId) filters.apiKeyId = apiKeyId;
    if (organizationId) filters.organizationId = organizationId;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const result = await getAuditLogs(filters);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs'
    });
  }
});

export default router;
