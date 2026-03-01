import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Organization from '../models/Organization';
import SystemConfig from '../models/SystemConfig';

interface AuthRequest extends Request {
  organization?: any;
  isSystemAdmin?: boolean;
  apiKey?: string;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    // Check if it's an API key (starts with 'gma_')
    if (token.startsWith('gma_')) {
      const systemConfig = await SystemConfig.findOne();
      
      if (!systemConfig) {
        return res.status(401).json({
          success: false,
          message: 'Invalid API key'
        });
      }

      const apiKey = systemConfig.apiKeys.find(
        key => key.key === token && key.isActive
      );

      if (!apiKey) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or revoked API key'
        });
      }

      // Update last used timestamp
      apiKey.lastUsed = new Date();
      await systemConfig.save();

      // Mark request as system admin level access
      req.isSystemAdmin = true;
      req.apiKey = token;
      return next();
    }

    // Otherwise, treat as JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Check if it's a system admin token
    if (decoded.isSystemAdmin) {
      req.isSystemAdmin = true;
      return next();
    }

    // Regular organization token
    const organization = await Organization.findById(decoded.organizationId).select('-password');
    
    if (!organization) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.organization = organization;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export default authenticateToken;