import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Organization from '../models/Organization';
import SystemConfig from '../models/SystemConfig';
import { isSystemAdminScope } from '../config/scopes';

interface AuthRequest extends Request {
  organization?: any;
  isSystemAdmin?: boolean;
  apiKey?: string;
  apiKeyScopes?: string[];
  apiKeyId?: string;
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

      const apiKeyEntry = systemConfig.apiKeys.find(
        key => key.key === token && key.isActive
      );

      if (!apiKeyEntry) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or revoked API key'
        });
      }

      // Check expiration
      if (apiKeyEntry.expiresAt && new Date() > apiKeyEntry.expiresAt) {
        return res.status(401).json({
          success: false,
          message: 'API key has expired'
        });
      }

      // Check rate limit
      if (apiKeyEntry.rateLimit && apiKeyEntry.requestCount && apiKeyEntry.requestCount >= apiKeyEntry.rateLimit) {
        return res.status(429).json({
          success: false,
          message: 'Rate limit exceeded for this API key'
        });
      }

      // Update last used timestamp and request count
      apiKeyEntry.lastUsed = new Date();
      apiKeyEntry.requestCount = (apiKeyEntry.requestCount || 0) + 1;
      await systemConfig.save();

      // Set authentication context
      req.apiKey = token;
      req.apiKeyScopes = apiKeyEntry.scopes || [];
      req.apiKeyId = apiKeyEntry.key; // Use the key itself as identifier
      
      // Check if this is a system admin key
      req.isSystemAdmin = isSystemAdminScope(apiKeyEntry.scopes || []);
      
      // If API key is bound to a specific organization, load it
      if (apiKeyEntry.organizationId) {
        const organization = await Organization.findById(apiKeyEntry.organizationId).select('-password');
        
        if (!organization || !organization.isActive) {
          return res.status(401).json({
            success: false,
            message: 'Organization not found or inactive'
          });
        }
        
        req.organization = organization;
      }

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

/**
 * Middleware to require specific scopes for API key authentication
 * For JWT tokens, this middleware only checks if user is system admin
 */
export const requireScopes = (requiredScopes: string | string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const scopes = Array.isArray(requiredScopes) ? requiredScopes : [requiredScopes];
    
    // If authenticated with JWT and is system admin, allow access
    if (req.isSystemAdmin && !req.apiKey) {
      return next();
    }
    
    // For API keys, check scopes
    if (req.apiKeyScopes) {
      const hasRequiredScope = scopes.some(scope => 
        req.apiKeyScopes?.includes(scope) || 
        req.apiKeyScopes?.includes('system:admin')
      );
      
      if (hasRequiredScope) {
        return next();
      }
      
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions. Required scopes: ' + scopes.join(', ')
      });
    }
    
    // If not API key and not system admin, deny
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  };
};

/**
 * Middleware to ensure request has organization context (either from JWT or org-specific API key)
 */
export const requireOrganization = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.organization) {
    return res.status(400).json({
      success: false,
      message: 'This endpoint requires organization context. Use an organization-specific API key or organization JWT token.'
    });
  }
  next();
};

export default authenticateToken;