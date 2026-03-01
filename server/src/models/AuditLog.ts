import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  timestamp: Date;
  action: string; // e.g., 'api_key_used', 'guest_registered', 'organization_created'
  resource: string; // e.g., 'guest', 'organization', 'system_config'
  resourceId?: string;
  userId?: mongoose.Types.ObjectId; // For JWT-based actions
  organizationId?: mongoose.Types.ObjectId;
  apiKeyId?: string; // For API key-based actions
  method: string; // HTTP method
  endpoint: string; // API endpoint
  statusCode: number;
  ipAddress?: string;
  userAgent?: string;
  requestBody?: any;
  responseMessage?: string;
  metadata?: any;
}

const auditLogSchema = new Schema<IAuditLog>({
  timestamp: { type: Date, default: Date.now, index: true },
  action: { type: String, required: true, index: true },
  resource: { type: String, required: true, index: true },
  resourceId: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
  apiKeyId: { type: String, index: true },
  method: { type: String, required: true },
  endpoint: { type: String, required: true },
  statusCode: { type: Number, required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  requestBody: { type: Schema.Types.Mixed },
  responseMessage: { type: String },
  metadata: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});

// Index for efficient querying
auditLogSchema.index({ timestamp: -1, action: 1 });
auditLogSchema.index({ apiKeyId: 1, timestamp: -1 });
auditLogSchema.index({ organizationId: 1, timestamp: -1 });

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
