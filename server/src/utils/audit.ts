import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';

interface AuthRequest extends Request {
  organization?: any;
  isSystemAdmin?: boolean;
  apiKey?: string;
  apiKeyScopes?: string[];
  apiKeyId?: string;
}

/**
 * Log an audit event
 */
export async function logAudit(params: {
  action: string;
  resource: string;
  resourceId?: string;
  userId?: string;
  organizationId?: string;
  apiKeyId?: string;
  method: string;
  endpoint: string;
  statusCode: number;
  ipAddress?: string;
  userAgent?: string;
  requestBody?: any;
  responseMessage?: string;
  metadata?: any;
}) {
  try {
    await AuditLog.create({
      timestamp: new Date(),
      ...params
    });
  } catch (error) {
    console.error('Error logging audit event:', error);
    // Don't throw - audit logging should not break the app
  }
}

/**
 * Middleware to automatically log API requests
 */
export const auditMiddleware = (action: string, resource: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const originalJson = res.json;
    
    let responseData: any;
    
    // Intercept response
    res.send = function(data: any) {
      responseData = data;
      return originalSend.call(this, data);
    };
    
    res.json = function(data: any) {
      responseData = data;
      return originalJson.call(this, data);
    };
    
    // Log on response finish
    res.on('finish', async () => {
      try {
        const sanitizedBody = sanitizeRequestBody(req.body);
        
        await logAudit({
          action,
          resource,
          resourceId: req.params.id || req.params.guestId,
          userId: req.organization?._id?.toString(),
          organizationId: req.organization?._id?.toString(),
          apiKeyId: req.apiKeyId,
          method: req.method,
          endpoint: req.originalUrl || req.url,
          statusCode: res.statusCode,
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.get('user-agent'),
          requestBody: sanitizedBody,
          responseMessage: responseData?.message,
          metadata: {
            isApiKey: !!req.apiKey,
            isSystemAdmin: req.isSystemAdmin,
            scopes: req.apiKeyScopes
          }
        });
      } catch (error) {
        console.error('Error in audit middleware:', error);
      }
    });
    
    next();
  };
};

/**
 * Sanitize request body to remove sensitive information
 */
function sanitizeRequestBody(body: any): any {
  if (!body) return undefined;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'apiKey', 'token', 'secret'];
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

/**
 * Get audit logs with optional filters
 */
export async function getAuditLogs(filters: {
  action?: string;
  resource?: string;
  userId?: string;
  organizationId?: string;
  apiKeyId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  page?: number;
}) {
  const {
    action,
    resource,
    userId,
    organizationId,
    apiKeyId,
    startDate,
    endDate,
    limit = 100,
    page = 1
  } = filters;
  
  const query: any = {};
  
  if (action) query.action = action;
  if (resource) query.resource = resource;
  if (userId) query.userId = userId;
  if (organizationId) query.organizationId = organizationId;
  if (apiKeyId) query.apiKeyId = apiKeyId;
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }
  
  const skip = (page - 1) * limit;
  
  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean(),
    AuditLog.countDocuments(query)
  ]);
  
  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}
