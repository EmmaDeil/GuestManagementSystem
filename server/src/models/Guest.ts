import mongoose, { Schema, Document } from 'mongoose';
import { Guest } from '../types';

export interface IGuest extends Omit<Guest, '_id'>, Document {}

const GuestSchema: Schema = new Schema({
  guestName: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true,
    maxlength: [100, 'Guest name cannot exceed 100 characters']
  },
  guestPhone: {
    type: String,
    required: [true, 'Guest phone is required'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  guestEmail: {
    type: String,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    default: null
  },
  guestCode: {
    type: String,
    required: true,
    unique: true,
    length: 6,
    match: [/^\d{6}$/, 'Guest code must be a 6-digit number']
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Organization ID is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  personToSee: {
    type: String,
    required: [true, 'Person to see is required'],
    trim: true
  },
  purpose: {
    type: String,
    trim: true,
    maxlength: [200, 'Purpose cannot exceed 200 characters']
  },
  signInTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  signOutTime: {
    type: Date,
    default: null
  },
  expectedDuration: {
    type: Number,
    required: [true, 'Expected duration is required'],
    min: [5, 'Expected duration must be at least 5 minutes'],
    max: [480, 'Expected duration cannot exceed 8 hours']
  },
  minVisitDuration: {
    type: Number,
    required: true,
    min: [5, 'Minimum visit duration must be at least 5 minutes']
  },
  idCardNumber: {
    type: String,
    default: null,
    trim: true
  },
  idCardAssigned: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['signed-in', 'signed-out', 'expired'],
    default: 'signed-in'
  },
  securityNotified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
GuestSchema.index({ guestCode: 1 });
GuestSchema.index({ organizationId: 1 });
GuestSchema.index({ status: 1 });
GuestSchema.index({ signInTime: 1 });
GuestSchema.index({ createdAt: 1 });

// Compound indexes
GuestSchema.index({ organizationId: 1, status: 1 });
GuestSchema.index({ organizationId: 1, signInTime: 1 });

export default mongoose.model<IGuest>('Guest', GuestSchema);