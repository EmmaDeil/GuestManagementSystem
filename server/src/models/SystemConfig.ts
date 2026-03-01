import mongoose, { Schema, Document } from 'mongoose';

export interface IApiKey {
  key: string;
  name: string;
  createdAt: Date;
  lastUsed?: Date;
  isActive: boolean;
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
  createdAt: { type: Date, default: Date.now },
  lastUsed: { type: Date },
  isActive: { type: Boolean, default: true }
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
