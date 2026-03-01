import mongoose, { Schema, Document } from 'mongoose';

export interface IApiKey {
  key: string;
  name: string;
  scopes: string[]; // e.g., ['guests:read', 'guests:write', 'analytics:read', 'system:admin']
  organizationId?: mongoose.Types.ObjectId; // Optional: restrict to specific organization
  createdAt: Date;
  expiresAt?: Date; // Optional: key expiration
  lastUsed?: Date;
  isActive: boolean;
  rateLimit?: number; // Requests per hour
  requestCount?: number; // Track usage
}

export interface ISystemConfig extends Document {
  apiKeys: IApiKey[];
  systemVersion: string;
  features: {
    qrCodeEnabled: boolean;
    analyticsEnabled: boolean;
    notificationsEnabled: boolean;
    emailIntegration: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    sessionTimeout: number;
  };
  defaultMinVisitMinutes: number;
  maxSessionDuration: string;
  updatedAt: Date;
  createdAt: Date;
}

const apiKeySchema = new Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  scopes: [{ type: String, required: true }],
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  lastUsed: { type: Date },
  isActive: { type: Boolean, default: true },
  rateLimit: { type: Number, default: 1000 }, // Default 1000 requests/hour
  requestCount: { type: Number, default: 0 }
});

const systemConfigSchema = new Schema<ISystemConfig>({
  apiKeys: [apiKeySchema],
  systemVersion: { type: String, default: '1.0.0' },
  features: {
    qrCodeEnabled: { type: Boolean, default: true },
    analyticsEnabled: { type: Boolean, default: true },
    notificationsEnabled: { type: Boolean, default: true },
    emailIntegration: { type: Boolean, default: false }
  },
  security: {
    twoFactorAuth: { type: Boolean, default: false },
    passwordPolicy: {
      minLength: { type: Number, default: 6 },
      requireUppercase: { type: Boolean, default: false },
      requireNumbers: { type: Boolean, default: false },
      requireSpecialChars: { type: Boolean, default: false }
    },
    sessionTimeout: { type: Number, default: 24 * 60 * 60 * 1000 } // 24 hours
  },
  defaultMinVisitMinutes: { type: Number, default: 15 },
  maxSessionDuration: { type: String, default: '24h' }
}, {
  timestamps: true
});

export default mongoose.model<ISystemConfig>('SystemConfig', systemConfigSchema);
