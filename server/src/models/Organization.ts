import mongoose, { Schema, Document } from 'mongoose';
import { Organization } from '../types';

export interface IOrganization extends Omit<Organization, '_id'>, Document {}

const OrganizationSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [100, 'Organization name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  locations: [{
    type: String,
    trim: true
  }],
  staffMembers: [{
    type: String,
    trim: true
  }],
  minGuestVisitMinutes: {
    type: Number,
    default: 15,
    min: [5, 'Minimum visit time cannot be less than 5 minutes'],
    max: [480, 'Minimum visit time cannot exceed 8 hours']
  },
  qrCodeUrl: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
OrganizationSchema.index({ email: 1 });
OrganizationSchema.index({ isActive: 1 });

export default mongoose.model<IOrganization>('Organization', OrganizationSchema);