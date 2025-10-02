import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Organization from '../models/Organization';

interface AuthRequest extends Request {
  organization?: any;
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
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